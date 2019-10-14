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

import Copyright from './Components/Copyright';
import IconButton from '@material-ui/core/IconButton';

import APIRequest from './js/APIRequest';

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
        height: '300px',
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
var lockUpdateMe = false;
var lockAutoLoad = false

async function loadCards(nextToken, admin) {
    if (!lockAutoLoad || nextToken) {
        lockAutoLoad = true
        var response
        if (admin) {

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

function formatDate(timeStamp) {
    const date = new Date(timeStamp * 1000)
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes()
}

function Main(props) {
    const classes = useStyles();

    const sessionCredentials = JSON.parse(localStorage.getItem("sessionCredentials"))

    const [me, setMe] = React.useState()

    if (sessionCredentials && !me && !lockUpdateMe) {
        lockUpdateMe = true
        userAPI.setSessionKey(sessionCredentials);
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
                setMe(result.data.me)
            } else {
                localStorage.removeItem("sessionCredentials")
                console.error(result)
            }
        })
    }

    const [nextToken, setNextToken] = React.useState()

    if (!lockAutoLoad)
        loadCards().then(setNextToken)
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
                                    <CardContent className={classes.cardContent}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {card.name ? card.name : "Sometihings not right"}
                                        </Typography>
                                        <Typography gutterBottom variant="subtitle1" color="textSecondary">
                                            {formatDate(card.startTime)}
                                        </Typography>
                                        <Typography>
                                            {card.description.length > 50 ? card.description.substring(0, 50) + "..." : card.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" color="primary">
                                            Know More
                                        </Button>
                                    </CardActions>
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