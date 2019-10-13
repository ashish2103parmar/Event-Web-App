/**
 * Public Graphql Schema, Functions and Classes
 */
var { buildSchema } = require('graphql');

/**
 * Schema
 */
exports.schema = buildSchema(`
    type Event {
        eventID: ID!
        name: String!
        decription: String!
        startTime: Int!
        endTime: Int!
    }

    type Query {
        listEvents(page: Int): [Event]
    }
`);

/**
 * Functions and Classes
 */
exports.root = {

}