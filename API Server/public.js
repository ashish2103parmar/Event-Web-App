/**
 * Public Graphql Schema, Functions and Classes
 */
var { buildSchema } = require('graphql');
var event = require("./lib/event")
var { addUser, login } = require("./lib/user")

/**
 * Schema
 */
exports.schema = buildSchema(`
    type Event {
        eventID: ID!
        name: String!
        description: String!
        startTime: Int!
        endTime: Int!
    }

    type Error {
        code: String!
        msg:String!
    }
    
    type ListEventResponse {
        error: Error
        nextToken: String
        list: [Event]
    }

    type Query {
        listEvents(nextToken: String): ListEventResponse
    }

    type Credentials {
        sessionKey: String!
        sessionExpire: Int!
    }

    type UserInfo {
        email: String!
        username: String!
    }

    type SignupResponse {
        error: Error
        user: UserInfo
    }

    type SigninResponse {
        error: Error
        credentials: Credentials
    }

    type Mutation {
        signup(email: String!, username: String!, password: String!): SignupResponse
        signin(email: String!, password: String!): SigninResponse
    }
`);

/**
 * Functions and Classes
 */
exports.root = {
    listEvents: ({ nextToken }) => {
        return new Promise((resolve) => event.listEvents({ nextToken }, resolve))
    },
    signup: ({ email, username, password }) => {
        return new Promise((resolve) => addUser({ email, username, password }, resolve))
    },
    signin: ({ email, password }) => {
        return new Promise((resolve) => login({ email, password }, resolve))
    }
}