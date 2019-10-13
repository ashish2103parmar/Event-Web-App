/**
 * User Graphql Schema, Functions and Classes
 */
var { buildSchema } = require('graphql');

/**
 * Schema
 */
exports.schema = buildSchema(`
    type Event {
        eventID: ID
        name: String!
        decription: String!
        startTime: Int!
        endTime: Int!
        status: String!
    }

    type Query {
        username: String!
        email: String!
        listMyEvents(page: Int): [Event]
        getStatus(eventID: ID!): String
    }

    type Response {
        status: String
        message: String 
    }

    type Mutation {
        createEvent(event: Event!): Event!
        updateEvent(event: Event!: Event!
        removeEvent(eventID: ID!): Event!
    }
`);

/**
 * Functions and Classes
 */
exports.root = {
    
}