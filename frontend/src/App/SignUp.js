import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Copyright from './Components/Copyright';
import APIRequest from './js/APIRequest';

const useStyles = makeStyles(theme => ({
    '@global': {
        body: {
            backgroundColor: theme.palette.common.white,
        },
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function SignUp(props) {
    var API = new APIRequest("http://localhost:8080/graphql")
    const classes = useStyles();
    const defaultValues = {
        email: "",
        username: "",
        password: ""
    }
    const [variables, setVariables] = React.useState(defaultValues)

    const onVariableChange = (key) => (event) => {
        setVariables({ ...variables, [key]: event.target.value })
    }

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <AddIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                </Typography>
                    <form className={classes.form} onSubmit={(event) => {
                        event.preventDefault()
                        API.request(`
                            mutation SignUp($email: String!, $username: String!, $password: String!) {
                                signup(email: $email, username: $username, password: $password) {
                                    error {
                                        code
                                        msg
                                    }
                                    user {
                                        username
                                        email
                                    }
                                }
                            }
                        `, variables).then((response) => response.json()).then(resp => {
                            if (resp.data) {
                                if (resp.data.signup.error) {
                                    alert(resp.data.signup.error.msg)
                                    console.error(resp.data.signup.error)
                                } else {
                                    props.history.push("/signin")
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
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullwidth
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={variables.username}
                            onChange={onVariableChange("username")}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={variables.email}
                            onChange={onVariableChange("email")}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            inputProps={{
                                minLength: 6
                            }}
                            autoComplete="current-password"
                            value={variables.password}
                            onChange={onVariableChange("password")}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign Up
                    </Button>
                        <Grid container>
                            <Grid item xs={12}>
                                <Link href="#/signin" variant="body2">
                                    <Typography align="center">
                                        {"Have an account? Sign In"}
                                    </Typography>
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright />
                </Box>
            </Container>
        </div>
    );
}

export default SignUp;