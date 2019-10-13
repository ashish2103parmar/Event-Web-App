/**
 * Main Page
 */
var express = require("express");
var graphqlHTTP = require("express-graphql");
var publicGraphQL = require("./public");
var userGraphQL = require("./user");
var app = express();
var { checkSession } = require("./lib/user")
/**
 * Health test for ELB
 */
app.get('/teststatus', (req, res) => {
    res.send()
})

/**
 * User Graphql Handler
 */
app.post('/graphql/user', (req, res, next) => {
    if (req.headers["x-session-key"]) {
        checkSession(req.headers["x-session-key"], (data) => {
            if (data.error) {
                res.status(400).send(data)
            } else {
                req.context = data
                next()
            }
        })
    } else {
        res.status(400).send({
            error: "Session Key Missing"
        })
    }
}, (req, res) => graphqlHTTP({
    schema: userGraphQL.schema,
    rootValue: userGraphQL.root,
    context: req.context,
    graphiql: true,
})(req, res))

/**
 * Public Graphql Handler
 */
app.use('/graphql', graphqlHTTP({
    schema: publicGraphQL.schema,
    rootValue: publicGraphQL.root,
    graphiql: true,
}))

/**
 * Error Handling
 */
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send()
})

/**
 * Start Server
 */
app.listen(8080, () => {
    console.log("Server Started..!")
})