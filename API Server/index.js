/**
 * Main Page
 */
var express = require("express");
var graphqlHTTP = require("express-graphql");

var app = express();

/**
 * Health test for ELB
 */
app.get('/teststatus', (req, res) => {
    res.send()
})

/**
 * Admin Graphql Handler
 */
app.post('/graphql/admin', [validateUser, validateAdmin], (req, res) => graphqlHTTP({

})(req, res))

/**
 * User Graphql Handler
 */
app.post('/graphql/user', validateUser, (req, res) => graphqlHTTP({

})(req, res))

/**
 * Public Graphql Handler
 */
app.post('/graphql', graphqlHTTP({
    
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