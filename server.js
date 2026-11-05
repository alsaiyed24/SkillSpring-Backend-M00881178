

const express = require("express");
const cors = require("cors");

// Create the Express application
const app = express();

// Allow the frontend to access the backend
app.use(cors());
 
/*
    WEEK 5 - TASK 5.3
    Logger middleware records incoming HTTP requests.
*/
app.use(function(request, response, next) {
    console.log("Incoming " + request.method +
                " request to: " + request.url);

    next();
});

// SkillSpring lesson data
const lessons = [
    {
        id: 1001,
        subject: "Coding",
        location: "Hendon",
        price: 25,
        availability: 5,
        icon: "💻"
    },
    {
        id: 1002,
        subject: "Mathematics",
        location: "Colindale",
        price: 20,
        availability: 5,
        icon: "📐"
    },
    {
        id: 1003,
        subject: "Art",
        location: "Wembley",
        price: 18,
        availability: 5,
        icon: "🎨"
    }
];

// Respond to requests with lesson data in JSON format

/*
    WEEK 5 - TASK 5.2
    GET route for SkillSpring lessons.
    Returns lesson data only when /lessons is requested.
*/
app.get("/lessons", function(request, response) {
    response.json(lessons);
});

/*
    WEEK 5 - TASK 5.2
    Handle requests that do not match any route.
*/
app.use(function(request, response) {
    response.status(404).send("Page not found!");
});


// Start the server on port 3000
app.listen(3000, function() {
    console.log("App started on port 3000");
});
