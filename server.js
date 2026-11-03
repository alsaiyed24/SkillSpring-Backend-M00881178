

const express = require("express");
const cors = require("cors");

// Create the Express application
const app = express();

// Allow the frontend to access the backend
app.use(cors());

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
app.use(function(request, response) {
    console.log("In comes a request to: " + request.url);
    response.json(lessons);
});

// Start the server on port 3000
app.listen(3000, function() {
    console.log("App started on port 3000");
});
