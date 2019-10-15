import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import EventIcon from '@material-ui/icons/Event';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import SyncIcon from '@material-ui/icons/Loop';
import Copyright from './Components/Copyright';
import APIRequest from './js/APIRequest';
import EditEvent from './Components/EditEvent';
import { CardHeader, Divider, ButtonGroup } from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Delete'

const useStyles = makeStyles(theme => ({
    title: {
        flexGrow: 1,
    },
    headerContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
    },
    headerButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    },
}));


var userAPI = new APIRequest("http://localhost:8080/user/graphql");

var cards = [];
var lockUpdateMe = false;

var lockAutoLoad = false

async function loadCards(nextToken) {
    if (!lockAutoLoad || nextToken) {
        lockAutoLoad = true
        var response = await userAPI.request(`
            query GetCards($nextToken: String) {
                listMyEvents(nextToken: $nextToken) { 
                    error { 
                        code 
                        msg 
                    } 
                    nextToken 
                    list { 
                        eventID
                        name
                        description
                        startTime
                        endTime
                        status
                    } 
                } 
            }`, { nextToken }).then((response) => response.json())

        const data = response.data
        if (data) {
            if (data.listMyEvents.error) {
                console.error(data.listMyEvents.error.msg)
            } else {
                cards = [...cards, ...data.listMyEvents.list]
                return data.listMyEvents.nextToken
            }
        } else {
            console.error(response)
        }
    }
    return null
}

function updateMe(callback) {
    if (!lockUpdateMe) {
        lockUpdateMe = true
        userAPI.request(`
            query{
                me {
                    username
                    email
                    admin
                }
            }
        `).then((response) => response.json()).then((result) => {
            if (result.data) {
                lockUpdateMe = false
                callback(result.data.me)
            } else {
                localStorage.removeItem("sessionCredentials")
                console.error(result)
            }
        })
    }
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function formatDate(timeStamp) {
    const date = new Date(timeStamp * 1000)
    return zeroPad(date.getDate(), 2) + "/" + zeroPad(date.getMonth() + 1, 2) + "/" + date.getFullYear() + " " + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(), 2)
}


function Main(props) {
    const classes = useStyles();

    const sessionCredentials = JSON.parse(localStorage.getItem("sessionCredentials"))

    if (sessionCredentials) {
        userAPI.setSessionKey(sessionCredentials)
    } else {
        props.history.push("/signin")
    }

    const [state, setState] = React.useState({
        me: null, nextToken: null, refresh: 0
    })

    var editEvent = null;

    const { me, nextToken, refresh } = state

    const updateState = (key) => (value) => {
        setState({ ...state, [key]: value })
    }

    if (!me)
        updateMe(updateState("me"))

    if (!lockAutoLoad)
        loadCards().then(updateState("nextToken"))

    return (
        <React.Fragment>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" onClick={() => props.history.push('/')} >
                        <EventIcon />
                    </IconButton>

                    <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                        My Campus
                    </Typography>
                    <Button color="inherit" onClick={() => {
                        localStorage.removeItem("sessionCredentials")
                        userAPI.request(`
                                mutation SignOut {
                                    signout {
                                        code
                                        msg
                                    }
                                }
                            `).then((response) => response.json()).then(resp => {
                            if (resp.data) {
                                if (resp.data.signout) {
                                    alert(resp.data.signout.msg)
                                    console.error(resp.data.signout)
                                } else {
                                    window.location.reload()
                                }
                            } else {
                                console.error(resp)
                                alert("Some thing went wrong")
                            }
                        }).catch((error) => {
                            console.error(error)
                            alert("Some thing went wrong")
                        })
                        props.history.push('/')
                    }}>Sign Out</Button>
                </Toolbar>
            </AppBar>
            <main>
                <div className={classes.headerContent}>
                    <Container maxWidth="sm">
                        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                            My Events
                        </Typography>
                        <div className={classes.headerButtons}>
                            <Grid container spacing={2} justify="center">
                                <Grid item>
                                    <Button variant="outlined" color="primary" size="large" onClick={() => {
                                        if (editEvent)
                                            editEvent({})
                                    }}>
                                        New Event
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    </Container>
                </div>
                <Container className={classes.cardGrid}>
                    <Grid container spacing={3}>
                        {cards.map((card, idx) => {
                            return <Grid item key={idx} xs={12} sm={6} md={4}>
                                <Card className={classes.card}>
                                    <CardHeader title={card.status}
                                        titleTypographyProps={{
                                            variant: "h6", component: "h5"
                                        }}
                                        action={
                                            <ButtonGroup>
                                                <IconButton onClick={() => {
                                                    userAPI.request(`
                                                    query refreshStatus ($eventID: ID!) {
                                                        getEventStatus (eventID: $eventID) {
                                                            error {
                                                                code
                                                                msg
                                                            }
                                                            eventID
                                                            status
                                                        }
                                                    }`, { eventID: card.eventID }).then((response) => response.json()).then(resp => {
                                                        if (resp.data) {
                                                            if (resp.data.getEventStatus.error) {
                                                                console.error(resp.data.getEventStatus.error.msg)
                                                            } else {
                                                                console.log(resp.data.getEventStatus)
                                                                cards[idx].status = resp.data.getEventStatus.status
                                                                updateState("refresh")(refresh + 1)
                                                            }
                                                        } else {
                                                            console.error(resp)
                                                            alert("Some thing went wrong")
                                                        }
                                                    }).catch((error) => {
                                                        console.error(error)
                                                        alert("Some thing went wrong")
                                                    })
                                                }}>
                                                    <SyncIcon />
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    userAPI.request(`
                                                        mutation RemoveEvent ($eventID: ID!) {
                                                            removeEvent(eventID: $eventID) {
                                                                error {
                                                                    code
                                                                    msg
                                                                }
                                                                event {
                                                                    eventID
                                                                }
                                                            }
                                                        }
                                                    `, {
                                                        eventID: card.eventID
                                                    }).then(r => r.json()).then(j => {
                                                        if (j.data) {
                                                            if (j.data.removeEvent.error) {
                                                                console.error(j.data.removeEvent.error.msg)
                                                            } else {
                                                                var idx = cards.findIndex(card => (card.eventID === j.data.removeEvent.event.eventID));
                                                                cards.splice(idx, 1)
                                                                updateState("refresh")(refresh + 1)
                                                            }
                                                        } else {
                                                            console.error(j)
                                                            alert("Some thing went wrong")
                                                        }
                                                    }).catch((error) => {
                                                        console.error(error)
                                                    })
                                                }}>
                                                    <RemoveIcon />
                                                </IconButton>
                                            </ButtonGroup>
                                        }
                                    />
                                    <Divider />
                                    <CardContent className={classes.cardContent}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {card.name ? card.name : "Sometihings not right"}
                                        </Typography>
                                        <Typography gutterBottom variant="subtitle1" color="textSecondary">
                                            {formatDate(card.startTime)} - {formatDate(card.endTime)}
                                        </Typography>
                                        <Typography>
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" color="primary" onClick={() => {
                                            if (editEvent)
                                                editEvent(card)
                                        }}>
                                            Edit
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        })}
                        <Grid item xs={12}></Grid>
                        <Grid item xs={5}></Grid>
                        <Grid container item xs={2} justify="center">
                            {
                                nextToken ?
                                    <Button color="primary" variant="contained" onClick={() => {
                                        loadCards(nextToken).then(updateState("nextToken"))
                                    }}>
                                        Load More
                                </Button>
                                    : null
                            }
                        </Grid>
                    </Grid>
                </Container>
            </main>
            <EditEvent loadCallback={(callback) => {
                editEvent = callback
            }} onSubmit={(event) => {
                if (event.eventID) {
                    userAPI.request(`
                        mutation UpdateEvent($eventID: ID!, $event: InputEvent!) {
                            updateEvent(eventID: $eventID, event: $event) {
                                error {
                                    code
                                    msg
                                }
                                event {
                                    eventID
                                    name
                                    description
                                    startTime
                                    endTime
                                    status
                                }
                            }
                        }
                    `, {
                        eventID: event.eventID, event: {
                            name: event.name,
                            description: event.description,
                            startTime: event.startTime,
                            endTime: event.endTime
                        }
                    }).then(r => r.json()).then(j => {
                        if (j.data) {
                            if (j.data.updateEvent.error) {
                                console.error(j.data.updateEvent.error.msg)
                            } else {
                                var idx = cards.findIndex(card => (card.eventID === j.data.updateEvent.event.eventID));
                                cards[idx] = j.data.updateEvent.event
                                updateState("refresh")(refresh + 1)
                            }
                        } else {
                            console.error(j)
                            alert("Some thing went wrong")
                        }
                    }).catch((error) => {
                        console.error(error)
                    })
                } else {
                    userAPI.request(`
                        mutation CreateEvent($event: InputEvent!) {
                            createEvent(event: $event) {
                                error {
                                    code
                                    msg
                                }
                                event {
                                    eventID
                                    name
                                    description
                                    startTime
                                    endTime
                                    status
                                }
                            }
                        }
                    `, { event }).then(r => r.json()).then(j => {
                        if (j.data) {
                            if (j.data.createEvent.error) {
                                console.error(j.data.createEvent.error.msg)
                            } else {
                                cards.push(j.data.createEvent.event)
                                updateState("refresh")(refresh + 1)
                            }
                        } else {
                            console.error(j)
                            alert("Some thing went wrong")
                        }
                    }).catch((error) => {
                        console.error(error)
                    })
                }
            }} />
            <footer className={classes.footer}>
                <Copyright />
            </footer>
        </React.Fragment>
    );
}

export default Main;