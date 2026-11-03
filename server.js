
const express = require("express");

// Create an Express application
const app = express();

// Handle incoming requests
app.use(function(request, response) {
    console.log("In comes a request to: " + request.url);
    response.end("Hello, world!");
});

// Start the server on port 3000
app.listen(3000, function() {
    console.log("App started on port 3000");
});
