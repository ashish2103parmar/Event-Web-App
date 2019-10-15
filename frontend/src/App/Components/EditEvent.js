import React from 'react';

import Modal from "@material-ui/core/Modal"
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import { ButtonGroup, Button, TextField, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        maxWidth: "600px",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%)`,
        padding: theme.spacing(2, 4, 4),
        outline: 'none',
    },
    header: {
        marginTop: "20px"
    },
    btnGroup: {
        marginBottom: "20px"
    }
}));

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}


function format2String(date) {
    return date.getFullYear() + "-" + zeroPad(date.getMonth() + 1, 2) + "-" + zeroPad(date.getDate(), 2) + "T" + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(), 2)
}

export default function EditEvent(props) {
    const classes = useStyles();

    const [values, setValues] = React.useState({
        open: false,
        event: {
            eventID: null,
            name: "",
            startTime: "",
            endTime: "",
            description: ""
        }
    });

    props.loadCallback((event) => {
        if (event) {
            var formatEvent = { ...event }
            formatEvent.startTime = format2String(new Date(formatEvent.startTime * 1000))
            formatEvent.endTime = format2String(new Date(formatEvent.endTime * 1000))
            setValues({ event: formatEvent, open: true })
        } else {
            setValues({
                event: {
                    eventID: null,
                    name: "",
                    startTime: "",
                    endTime: "",
                    description: ""
                },
                open: true
            })
        }
    })

    const handleChange = name => event => {
        setValues({ ...values, event: { ...values.event, [name]: event.target.value } });
    };

    return (
        <Modal open={values.open}>
            <div className={classes.paper}>
                <Card>

                    <form className={classes.container} autoComplete="off" onSubmit={(event) => {
                        event.preventDefault();
                        var eventData = values.event
                        eventData.startTime = new Date(eventData.startTime).getTime() / 1000
                        eventData.endTime = new Date(eventData.endTime).getTime() / 1000
                        if (props.onSubmit) {
                            props.onSubmit(eventData)
                        }
                        setValues({
                            ...values,
                            open: false
                        })
                    }}>
                        <Container fixed>
                            <Typography className={classes.header} variant="h5" component="h2">
                                {values.event.eventID ? "Edit Event" : "New Event"}
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Name"
                                        value={values.event.name}
                                        onChange={handleChange('name')}
                                        margin="normal"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Start Time"
                                        type="datetime-local"
                                        inputProps={{
                                            min: format2String(new Date())
                                        }}
                                        defaultValue={values.event.startTime}
                                        onChange={handleChange('startTime')}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="End Time"
                                        type="datetime-local"
                                        inputProps={{
                                            min: values.event.startTime
                                        }}
                                        value={values.event.endTime}
                                        onChange={handleChange('endTime')}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        type="text"
                                        multiline
                                        rows={6}
                                        value={values.event.description}
                                        onChange={handleChange('description')}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <ButtonGroup className={classes.btnGroup} fullWidth variant="contained">
                                        <Button type="submit" color="primary">Submit</Button>
                                        <Button color="secondary" onClick={() => {
                                            setValues({ ...values, open: false })
                                        }}>Cancel</Button>
                                    </ButtonGroup>
                                </Grid>
                            </Grid>
                        </Container>
                    </form>
                </Card>
            </div>
        </Modal>
    );
}
