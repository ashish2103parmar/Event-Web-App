/**
 * Resource Names and Credentials
 */
exports = {
    eventsDB: {
        name: "events-db",
        key: "eventid",
        index: {
            name: "start-index",
            key: "start_timestamp"
        },
        ttl: "expire_timestamp"
    },
    usersDB: {
        name: "users-db",
        key: "userid",
        sortKey: "dtype",
        ttl: "expire_timestamp"
    }
}