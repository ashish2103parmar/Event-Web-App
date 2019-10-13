/**
 * Resource Names and Credentials
 */

// Events DB
exports.eventsDB = {
    name: "events-db",
    key: "eventid",
    index: {
        email: {
            name: "email-index",
            key: "email"
        },
        start: {
            name: "start-index",
            key: "start_timestamp"
        }
    },
    ttl: "expire_timestamp"
};

// User DB
exports.usersDB = {
    name: "users-db",
    key: "type",
    sortKey: "id",
    ttl: "expire_timestamp"
};
