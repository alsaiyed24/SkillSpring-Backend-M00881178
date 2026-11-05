

const express = require("express");
const cors = require("cors");
const path = require("path");





// Create the Express application
const app = express();

// Allow the frontend to access the backend
app.use(cors());

/*
    WEEK 5 - TASK 5.5
    Allow Express to read incoming JSON request bodies.
*/
app.use(express.json());

 
/*
    WEEK 5 - TASK 5.3
    Logger middleware records incoming HTTP requests.
*/
app.use(function(request, response, next) {
    console.log("Incoming " + request.method +
                " request to: " + request.url);

    next();
});


/*
    WEEK 5 - TASK 5.4
    Serve lesson images from the backend.
*/

// Locate the folder containing lesson images
const publicPath = path.resolve(__dirname, "staticFiles");

// Serve image files through the /images URL
app.use("/images", express.static(publicPath));

// Return 404 if a requested image does not exist
app.use("/images", function(request, response) {
    response.status(404).send("Image not found!");
});


// SkillSpring lesson data
const lessons = [
    {
        id: 1001,
        subject: "Coding",
        location: "Hendon",
        price: 25,
        availability: 5,
        icon: "💻",
        image: "images/coding.jpg"
    },
    {
        id: 1002,
        subject: "Mathematics",
        location: "Colindale",
        price: 20,
        availability: 5,
        icon: "📐",
        image: "images/mathematics.jpg"
    },
    {
        id: 1003,
        subject: "Art",
        location: "Wembley",
        price: 18,
        availability: 5,
        icon: "🎨",
        image: "images/art.jpg"
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
    WEEK 5 - TASK 5.5
    Receive new orders from the SkillSpring frontend.
*/
app.post("/orders", function(request, response) {

    // Get the order information sent by the frontend
    const order = request.body;

    // Display the order details in the backend terminal
    console.log("New SkillSpring order received:");
    console.log("Customer name:", order.name);
    console.log("Phone number:", order.phone);
    console.log("Selected lesson IDs:", order.cart);

    // Confirm that the server received the order
    response.status(201).json({
        message: "Order received successfully!"
    });
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
