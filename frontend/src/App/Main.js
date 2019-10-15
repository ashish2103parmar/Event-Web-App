import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import EventIcon from '@material-ui/icons/Event';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import Copyright from './Components/Copyright';
import IconButton from '@material-ui/core/IconButton';

import APIRequest from './js/APIRequest';
import { ButtonGroup, CardHeader, Divider } from '@material-ui/core';

import RemoveIcon from '@material-ui/icons/Delete'
import ApproveIcon from '@material-ui/icons/Done'
import RejectIcon from '@material-ui/icons/Clear'

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

var publicAPI = new APIRequest("http://localhost:8080/graphql")
var userAPI = new APIRequest("http://localhost:8080/user/graphql")

var cards = [];
var lockAutoLoad = false

async function loadCards(nextToken, me) {
    if (!lockAutoLoad || nextToken) {
        lockAutoLoad = true
        var response
        if (me ? me.admin : false) {
            response = await userAPI.request(`
            query GetCards($nextToken: String) {
                    listEvents(nextToken: $nextToken) { 
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
                            organizer {
                                name
                                email
                            }
                            status
                        } 
                    } 
            }`, { nextToken }).then((response) => response.json())
        } else {
            response = await publicAPI.request(`
            query GetCards($nextToken: String) {
                    listEvents(nextToken: $nextToken) { 
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
                        } 
                    } 
            }`, { nextToken }).then((response) => response.json())
        }
        const data = response.data
        console.log(data)
        if (data) {
            if (data.listEvents.error) {
                console.error(data.listEvents.error.msg)
            } else {
                cards = [...cards, ...data.listEvents.list]
                return data.listEvents.nextToken
            }
        } else {
            console.error(response)
        }
    }
    return null
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

    const [me, setMe] = React.useState()
    const [nextToken, setNextToken] = React.useState()
    const [refresh, setRefresh] = React.useState(0)

    if (!lockAutoLoad) {
        userAPI.setSessionKey(sessionCredentials);
        if (sessionCredentials) {
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
                    loadCards(nextToken, result.data.me).then(setNextToken)
                    setMe(result.data.me)
                } else {
                    localStorage.removeItem("sessionCredentials")
                    console.error(result)
                }
            })
        } else {
            loadCards(nextToken, me).then(setNextToken)
        }
    }

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
                    {
                        me ? <Button color="inherit" onClick={() => props.history.push('/dashboard')}>Dashboard</Button> : <Button color="inherit" onClick={() => props.history.push('/signin')}>Sign In</Button>
                    }

                </Toolbar>
            </AppBar>
            <main>
                <div className={classes.headerContent}>
                    <Container maxWidth="sm">
                        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                            Events
                        </Typography>
                        <Typography variant="h5" align="center" color="textSecondary" paragraph>
                            Here's a list of upcoming Events on our Campus.
                            Hosting an Event? let everyone know about it.
                        </Typography>
                        <div className={classes.headerButtons}>
                            <Grid container spacing={2} justify="center">
                                <Grid item>
                                    <Button variant="outlined" color="primary" size="large" onClick={() => {
                                        if (me)
                                            props.history.push("/dashboard");
                                        else
                                            props.history.push('/signup');

                                    }}>
                                        Post Event
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
                                    {
                                        me ? me.admin &&
                                            <React.Fragment>
                                                <CardHeader title={card.status}
                                                    titleTypographyProps={{
                                                        variant: "h6", component: "h5"
                                                    }}
                                                    action={
                                                        <ButtonGroup>
                                                            {
                                                                card.status === "Pending" &&
                                                                <IconButton onClick={() => {
                                                                    userAPI.request(`
                                                                        mutation UpdateEventStatus ($eventID: ID!, $status: String!) {
                                                                            updateEventStatus(eventID: $eventID, status: $status) {
                                                                                error {
                                                                                    code
                                                                                    msg
                                                                                }
                                                                                eventID
                                                                                status
                                                                            }
                                                                        }
                                                                    `, {
                                                                        eventID: card.eventID,
                                                                        status: "Approved"
                                                                    }).then(r => r.json()).then(j => {
                                                                        if (j.data) {
                                                                            if (j.data.updateEventStatus.error) {
                                                                                console.error(j.data.updateEventStatus.error.msg)
                                                                            } else {
                                                                                cards[idx].status = j.data.updateEventStatus.status
                                                                                setRefresh(refresh + 1)
                                                                            }
                                                                        } else {
                                                                            console.error(j)
                                                                            alert("Some thing went wrong")
                                                                        }
                                                                    }).catch((error) => {
                                                                        console.error(error)
                                                                    })
                                                                }}>
                                                                    <ApproveIcon />
                                                                </IconButton>
                                                            }
                                                            {
                                                                card.status === "Pending" &&
                                                                <IconButton onClick={() => {
                                                                    userAPI.request(`
                                                                        mutation UpdateEventStatus ($eventID: ID!, $status: String!) {
                                                                            updateEventStatus(eventID: $eventID, status: $status) {
                                                                                error {
                                                                                    code
                                                                                    msg
                                                                                }
                                                                                eventID
                                                                                status
                                                                            }
                                                                        }
                                                                    `, {
                                                                        eventID: card.eventID,
                                                                        status: "Rejected"
                                                                    }).then(r => r.json()).then(j => {
                                                                        if (j.data) {
                                                                            if (j.data.updateEventStatus.error) {
                                                                                console.error(j.data.updateEventStatus.error.msg)
                                                                            } else {
                                                                                cards[idx].status = j.data.updateEventStatus.status
                                                                                setRefresh(refresh + 1)
                                                                            }
                                                                        } else {
                                                                            console.error(j)
                                                                            alert("Some thing went wrong")
                                                                        }
                                                                    }).catch((error) => {
                                                                        console.error(error)
                                                                    })
                                                                }}>
                                                                    <RejectIcon />
                                                                </IconButton>
                                                            }
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
                                                                            setRefresh(refresh + 1)
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
                                            </React.Fragment> : null
                                    }
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
                                </Card>
                            </Grid>
                        })}
                        <Grid item xs={12}></Grid>
                        <Grid item xs={4}></Grid>
                        <Grid container item xs={4} justify="center">
                            {
                                nextToken ?
                                    <Button color="primary" variant="contained" onClick={() => {
                                        loadCards().then(setNextToken)
                                    }}>
                                        Load More
                                </Button>
                                    : "Thats all for now. Come back later"
                            }
                        </Grid>
                    </Grid>
                </Container>
            </main>
            <footer className={classes.footer}>
                <Copyright />
            </footer>
        </React.Fragment>
    );
}

export default Main;