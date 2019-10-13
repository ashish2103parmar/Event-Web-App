/**
 * Admin Users DB Functions
 */

var DynamoDB = require('aws-sdk/clients/dynamodb');
var { generateRandomString, generateUUID, hashPassword, hash, validateEmail, validatePassword } = require("./util")
var { usersDB } = require("../creds")
var { CustomException, CustomExceptionCodes } = require("./exceptions")

// Dynamodb Client
var dynamodbClient = new DynamoDB({ region: "us-east-1" })

/**
 * Add User
 * (Use to Add Admin User)
 */
exports.addUser = ({ username, email, password }, callback) => {
    if (username !== "" && validateEmail(email) && validatePassword(password)) {
        const salt = generateRandomString(16);
        dynamodbClient.putItem({
            TableName: usersDB.name,
            Item: {
                [usersDB.key]: {
                    S: "user"
                },
                [usersDB.sortKey]: {
                    S: email
                },
                salt: {
                    S: salt
                },
                hash: {
                    S: hashPassword(password, salt)
                },
                username: {
                    S: username
                },
            },
            ConditionExpression: "attribute_not_exists(" + usersDB.sortKey + ")"
        }, (error) => {
            if (error) {
                if (error.code === "ConditionalCheckFailedException") {
                    callback(new CustomException(CustomExceptionCodes.AlreadyExists, "User Already Exists"))
                } else {
                    callback(new CustomException(CustomExceptionCodes.UnknownError, "Create User Failed for Unknown Reason"))
                }
            } else
                callback(null, { username, email })
        })
    } else {
        callback(new CustomException(CustomExceptionCodes.InvalidRequest, "Data Sent is Invalid"))
    }
}

/**
 * Login
 */
exports.login = ({ email, password }, callback) => {
    if (validateEmail(email) && validatePassword(password)) {
        dynamodbClient.getItem({
            Key: {
                [usersDB.key]: {
                    S: "user"
                },
                [usersDB.sortKey]: {
                    S: email
                }
            },
            TableName: usersDB.name
        }, (error, data) => {
            if (error) {
                callback(error)
            } else {
                if (data.Item) {
                    const userInfo = data.Item;
                    if (userInfo.hash.S === hashPassword(password, userInfo.salt.S)) {
                        const sessionKey = hash(generateUUID());
                        const ttl = (Date.now() / 1000 + 3600 * 24 * 7).toFixed(0)
                        dynamodbClient.putItem({
                            Item: {
                                [usersDB.key]: {
                                    S: "session"
                                },
                                [usersDB.sortKey]: {
                                    S: sessionKey
                                },
                                email: userInfo[usersDB.sortKey],
                                username: userInfo.username,
                                admin: userInfo.admin ? userInfo.admin : {
                                    BOOL: false
                                },
                                [usersDB.ttl]: {
                                    N: ttl
                                }
                            },
                            TableName: usersDB.name
                        }, (error) => {
                            if (error) {
                                callback(new CustomException(CustomExceptionCodes.UnknownError, "Login Failed for Unknown Reason"))
                            } else {
                                callback(null, {
                                    sessionKey,
                                    sessionExpire: ttl
                                })
                            }
                        })
                    } else {
                        callback(new CustomException(CustomExceptionCodes.ValidationFailed, "Incorrect Password"))
                    }
                } else {
                    callback(new CustomException(CustomExceptionCodes.NotFound, "User Not Found"))
                }
            }
        })
    } else {
        callback(new CustomException(CustomExceptionCodes.InvalidRequest, "Data Sent is Invalid"))
    }
}

/**
 * Log Out
 */
exports.logout = (sessionKey, callback) => {
    dynamodbClient.deleteItem({
        Key: {
            [usersDB.key]: {
                S: "session"
            },
            [usersDB.sortKey]: {
                S: sessionKey
            },
        },
        TableName: usersDB.name
    }, (error) => {
        if (error)
            callback(new CustomException(CustomExceptionCodes.UnknownError, "Log Out Failed"))
        else {
            callback()
        }
    })
}

/**
 * Validate Session
 */
exports.checkSession = (sessionKey, callback) => {
    dynamodbClient.getItem({
        TableName: usersDB.name,
        Key: {
            [usersDB.key]: {
                S: "session"
            },
            [usersDB.sortKey]: {
                S: sessionKey
            },
        }
    }, (error, result) => {
        if (error) {
            callback(new CustomException(CustomExceptionCodes.UnknownError, "Session Validation Failed for Unknown Reason"))
        } else {
            if (result.Item) {
                callback(null, {
                    email: result.Item.email.S,
                    username: result.Item.username.S
                })
            } else {
                callback(new CustomException(CustomExceptionCodes.ValidationFailed, "Invalid SessionKey"))
            }
        }
    })
}

/**
 * extend Session
 */
exports.extendSession = (sessionKey, callback) => {
    const ttl = (Date.now() / 1000 + 3600 * 24 * 7).toFixed(0)
    dynamodbClient.updateItem({
        TableName: usersDB.name,
        Key: {
            [usersDB.key]: {
                S: "session"
            },
            [usersDB.sortKey]: {
                S: sessionKey
            },
        },
        ExpressionAttributeValues: {
            ":t": {
                N: ttl
            }
        },
        ExpressionAttributeNames: {
            "#t": usersDB.ttl
        },
        UpdateExpression: "SET #t = :t",
    }, (error) => {
        if (error) {
            callback(new CustomException(CustomExceptionCodes.UnknownError, "Session Validation Failed for Unknown Reason"))
        } else {
            callback(null, {
                sessionKey,
                sessionExpire: ttl
            })
        }
    })
}