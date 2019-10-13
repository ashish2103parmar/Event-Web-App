/**
 * User Graphql Schema, Functions and Classes
 */
var { buildSchema } = require('graphql');
var eventFunctions = require("./lib/event")
var { extendSession, logout } = require("./lib/user")
var { CustomException, CustomExceptionCodes } = require("./lib/exceptions")
/**
 * Schema
 */
exports.schema = buildSchema(`
    
    type Organizer {
        name: String!
        email: String!
    }

    type Event {
        eventID: ID!
        name: String!
        description: String!
        startTime: Int!
        endTime: Int!
        organizer: Organizer
        status: String!
    }

    type UserInfo {
        email: String!
        username: String!
        admin: Boolean
    }

    type Error {
        code: String!
        msg: String!
    }

    type ListEventResponse {
        error: Error
        list: [Event]
        nextToken: String
    }

    type StatusResponse {
        error: Error
        eventID: ID
        status: String
    }

    type Query {
        me: UserInfo
        listMyEvents(nextToken: String): ListEventResponse
        getEventStatus(eventID: ID!): StatusResponse
        listEvents(nextToken: String): ListEventResponse
    }

    type Response {
        error: Error
        event: Event
    }

    type Credentials {
        sessionKey: String!
        sessionExpire: Int!
    }

    type ExtendSessionResponse {
        error: Error
        credentials: Credentials
    }

    input InputEvent {
        name: String!
        description: String!
        startTime: Int!
        endTime: Int!
    }

    type Mutation {
        createEvent(event: InputEvent!): Response
        updateEvent(eventID: ID!, event: InputEvent!): Response
        removeEvent(eventID: ID!): Response
        signout: Error
        extendSession: ExtendSessionResponse 
        updateEventStatus(eventID: ID!, status: String!): StatusResponse
    }
`);

/**
 * Functions and Classes
 */
exports.root = {
    createEvent: ({ event }, context) => {
        return new Promise((resolve) => eventFunctions.createEvent({ ...event, username: context.user.username, email: context.user.email }, resolve))
    },
    updateEvent: ({ eventID, event }, context) => {
        return new Promise((resolve) => eventFunctions.updateEvent({ eventID, ...event, email: context.user.email }, resolve))
    },
    removeEvent: ({ eventID }, context) => {
        return new Promise((resolve) => eventFunctions.removeEvent({ eventID, email: context.user.email }, resolve))
    },
    signout: ({ }, context) => {
        return new Promise((resolve) => logout(context.sessionKey, resolve))
    },
    extendSession: ({ }, context) => {
        return new Promise((resolve) => extendSession(context.sessionKey, resolve))
    },
    me: ({ }, context) => {
        return context.user
    },
    listMyEvents: ({ nextToken }, context) => {
        return new Promise((resolve) => eventFunctions.listUserEvents({ nextToken, email: context.user.email }, resolve))
    },
    getEventStatus: ({ eventID }, context) => {
        return new Promise((resolve) => eventFunctions.getStatus({ eventID, email: context.user.email }, resolve))
    },
    updateEventStatus: ({ eventID, status }, context) => {
        if (context.user.admin)
            return new Promise((resolve) => eventFunctions.updateEventStatus({ eventID, status }, resolve))
        else
            return { error: new CustomException(CustomExceptionCodes.AccessDenied, "Access Denied") }
    },
    listEvents: ({ nextToken }, context) => {
        if (context.user.admin)
            return new Promise((resolve) => eventFunctions.listEvents({ nextToken, admin: context.user.admin }, resolve))
        else
            return { error: new CustomException(CustomExceptionCodes.AccessDenied, "Access Denied") }
    }
} 