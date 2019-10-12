/**
 * Main Page
 */
var express = require("express");
var graphqlHTTP = require("express-graphql");

var app = express();

/**
 * Health test for ELB
 */
app.use('/teststatus', (req, res) => {
    res.send()
})



/**
 * Start Server
 */
app.listen(8080, () => {
    console.log("Server Started..!")
})