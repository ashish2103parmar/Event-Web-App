/**
 * Event DB Functions
 */

var DynamoDB = require('aws-sdk/clients/dynamodb');
var { eventsDB } = require("../creds")
var { CustomException, CustomExceptionCodes } = require("./exceptions")
var { generateUUID } = require("./util")

// Dynamodb Client
var dynamodbClient = new DynamoDB({ region: "us-east-1" })

/**
 * Create Event
 */
exports.createEvent = ({ name, description, startTime, endTime, username, email }, callback) => {
    if (name !== "" && description !== "" && startTime && endTime) {
        const eventID = generateUUID()
        dynamodbClient.putItem({
            TableName: eventsDB.name,
            Item: {
                [eventsDB.key]: {
                    S: eventID
                },
                email: {
                    S: email
                },
                organizer: {
                    S: username
                },
                name: {
                    S: name
                },
                description: {
                    S: description
                },
                start_timestamp: {
                    N: startTime.toString()
                },
                expire_timestamp: {
                    N: endTime.toString()
                },
                status: {
                    S: "Pending"
                }
            }
        }, (error) => {
            if (error) {
                callback(new CustomException(CustomExceptionCodes.UnknownError, "Create Event Failed for Unknown Reason"))
            } else {
                callback(null, {
                    eventID, name, description, startTime, endTime, status: "Pending"
                })
            }
        })
    } else {
        callback(new CustomException(CustomExceptionCodes.InvalidRequest, "Data Sent is Invalid"))
    }
}

/**
 * list User Added Event
 */
exports.listUserEvents = ({ email, nextToken }, callback) => {
    dynamodbClient.query({
        ExpressionAttributeValues: {
            ":v1": {
                S: email
            }
        },
        ExpressionAttributeNames: {
            "#vi": eventsDB.index.email.key,
            "#n": "name",
            "#s": "status"
        },
        KeyConditionExpression: "#vi = :v1",
        IndexName: eventsDB.index.email.name,
        TableName: eventsDB.name,
        ExclusiveStartKey: nextToken,
        Limit: 20,
        ProjectionExpression: eventsDB.key + ", #n, description, start_timestamp, expire_timestamp, #s"
    }, (error, queryResult) => {
        if (error) {
            callback(new CustomException(CustomExceptionCodes.UnknownError, "List Event Failed for Unknown Reason"))
        } else {
            callback(null,
                {
                    nextToken: queryResult.LastEvaluatedKey,
                    list: queryResult.Items.map((value) => ({
                        eventID: value[eventsDB.key].S,
                        name: value.name.S,
                        description: value.description.S,
                        startTime: parseInt(value.start_timestamp.N),
                        endTime: parseInt(value.expire_timestamp.N),
                        status: value.status.S
                    }))
                }
            )
        }
    })
}

/**
 * List Events
 */
exports.listEvents = ({ nextToken, admin }, callback) => {
    dynamodbClient.scan({
        IndexName: eventsDB.index.start.name,
        TableName: eventsDB.name,
        ExclusiveStartKey: nextToken,
        Limit: 20,
        ExpressionAttributeNames: {
            "#n": "name",
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ":s": {
                S: "Success"
            }
        },
        FilterExpression: !admin ? "#s = :s" : undefined,
        ProjectionExpression: eventsDB.key + ", #n, description, start_timestamp, expire_timestamp, #s, organizer, email"
    }, (error, scanResult) => {
        if (error) {
            callback(new CustomException(CustomExceptionCodes.UnknownError, "List Event Failed for Unknown Reason"))
        } else {
            callback(null,
                {
                    nextToken: scanResult.LastEvaluatedKey,
                    list: scanResult.Items.map((value) => ({
                        eventID: value[eventsDB.key].S,
                        name: value.name.S,
                        description: value.description.S,
                        startTime: parseInt(value.start_timestamp.N),
                        endTime: parseInt(value.expire_timestamp.N),
                        organizer: admin ? {
                            email: value.email.S,
                            name: value.organizer.S
                        } : undefined,
                        status: admin ? value.status.S : undefined
                    }))
                }
            )
        }
    })
}

/**
 * update Event
 */
exports.updateEvent = ({ eventID, name, description, startTime, endTime, email }, callback) => {
    if (name !== "" && description !== "" && startTime && endTime) {
        dynamodbClient.updateItem({
            TableName: eventsDB.name,
            Key: {
                [eventsDB.key]: {
                    S: eventID
                }
            },
            ExpressionAttributeValues: {
                ":n": {
                    S: name
                },
                ":d": {
                    S: description
                },
                ":st": {
                    N: startTime.toString()
                },
                ":et": {
                    N: endTime.toString()
                },
                ":e": {
                    S: email
                },
                ":s": {
                    S: "Pending"
                }
            },
            ExpressionAttributeNames: {
                "#n": "name",
                "#d": "description",
                "#st": "start_timestamp",
                "#et": "expire_timestamp",
                "#s": "status"
            },
            UpdateExpression: "SET #n = :n, #d = :d, #st = :st, #et = :et, #s = :s",
            ConditionExpression: "email = :e"
        }, (error, data) => {
            if (error) {
                if (error.code === "ConditionalCheckFailedException") {
                    callback(new CustomException(CustomExceptionCodes.AccessDenied, "Access Denied"))
                } else {
                    callback(new CustomException(CustomExceptionCodes.UnknownError, "Update Event Failed for Unknown Reason"))
                }
            } else {
                callback(null, {
                    eventID,
                    name,
                    description,
                    startTime,
                    endTime,
                    status: "Pending"
                })
            }
        })
    } else {
        callback(new CustomException(CustomExceptionCodes.InvalidRequest, "Data Sent is Invalid"))
    }
}

const validStatus = ["Pending", "Success", "Rejected"]

/**
 * Update Event Status
 */
exports.updateEventStatus = ({ eventID, status }, callback) => {
    if (validStatus.findIndex(value => (value === status)) !== -1) {
        dynamodbClient.updateItem({
            TableName: eventsDB.name,
            Key: {
                [eventsDB.key]: {
                    S: eventID
                }
            },
            ExpressionAttributeValues: {
                ":s": {
                    S: status
                }
            },
            ExpressionAttributeNames: {
                "#s": "status"
            },
            UpdateExpression: "SET #s = :s",
        }, (error, data) => {
            if (error) {
                callback(new CustomException(CustomExceptionCodes.UnknownError, "Update Event Failed for Unknown Reason"))
            } else {
                callback(null, {
                    eventID,
                    status
                })
            }
        })
    } else {
        callback(new CustomException(CustomExceptionCodes.InvalidRequest, "Data Sent is Invalid"))
    }
}

/**
 * Remove Event
 */
exports.removeEvent = ({ eventID, email, admin }, callback) => {
    dynamodbClient.deleteItem({
        TableName: eventsDB.name,
        Key: {
            [eventsDB.key]: {
                S: eventID
            }
        },
        ReturnValues: "ALL_OLD",
        ConditionExpression: !admin ? "email = :e" : undefined,
        ExpressionAttributeValues: {
            ":e": {
                S: email
            }
        }
    }, (error, data) => {
        if (error) {
            if (error.code === "ConditionalCheckFailedException") {
                callback(new CustomException(CustomExceptionCodes.AccessDenied, "Access Denied"))
            } else {
                callback(new CustomException(CustomExceptionCodes.UnknownError, "Removing Event Failed for Unknown Reason"))
            }
        } else {
            const value = data.Attributes
            callback(null, {
                eventID: value[eventsDB.key].S,
                name: value.name.S,
                description: value.description.S,
                startTime: parseInt(value.start_timestamp.N),
                endTime: parseInt(value.expire_timestamp.N),
                organizer: admin ? {
                    email: value.email.S,
                    name: value.organizer.S
                } : undefined
            })
        }
    })
}