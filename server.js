

const express = require("express");
const cors = require("cors");
const path = require("path");


/*
    WEEK 7 - MONGODB INTEGRATION
    Load database configuration securely.
*/
require("dotenv").config({ path: "./config.env" });

// Import the MongoDB client
const { MongoClient } = require("mongodb");

/*
    WEEK 7 - MONGODB INTEGRATION
    Connect SkillSpring to MongoDB Atlas.
*/

// Read the connection string from config.env
const mongoURI = process.env.MONGODB_URI;

// Create a MongoDB client
const client = new MongoClient(mongoURI);

// Connect to the SkillSpring database
async function connectDatabase() {
    try {
        await client.connect();

        // Check that the database is responding
        await client.db("skillspring").command({ ping: 1 });


// Reference the lessons collection in MongoDB
const lessonsCollection = client.db("skillspring").collection("lessons");


        console.log("Connected to MongoDB Atlas successfully!");

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

// Start the database connection
connectDatabase();






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

/*
    WEEK 7 - MONGODB INTEGRATION
    Retrieve lesson data from MongoDB Atlas.
*/
app.get("/lessons", async function(request, response) {
    try {
        // Select the lessons collection
        const lessonsCollection = client.db("skillspring").collection("lessons");

        // Retrieve all lessons from MongoDB
        const lessons = await lessonsCollection.find({}).toArray();

        // Send lessons to the frontend as JSON
        response.json(lessons);

    } catch (error) {
        console.error("Error fetching lessons:", error.message);

        response.status(500).json({
            message: "Failed to fetch lessons"
        });
    }
});
    

/*
    WEEK 7 - MONGODB INTEGRATION
    Save orders and update availability in one transaction.
*/
app.post("/orders", async function(request, response) {
   const order = request.body;

    // Validate customer details and lesson IDs
    if (
        typeof order?.name !== "string" ||
        !order.name.trim() ||
        typeof order?.phone !== "string" ||
        !order.phone.trim() ||
        !Array.isArray(order?.cart) ||
        order.cart.length === 0 ||
        !order.cart.every(Number.isInteger)
    ) {
        return response.status(400).json({
            message: "Invalid order details"
        });
    }

    const database = client.db("skillspring");
    const lessonsCollection = database.collection("lessons");
    const ordersCollection = database.collection("orders");

    // Count requested spaces for each lesson
    const lessonQuantities = {};

    for (const lessonId of order.cart) {
        lessonQuantities[lessonId] =
            (lessonQuantities[lessonId] || 0) + 1;
    }

    // Start a MongoDB session
    const session = client.startSession();

    try {
        let insertedOrderId;

        // All database changes succeed or fail together
        await session.withTransaction(async function() {

            for (const [id, quantity] of Object.entries(lessonQuantities)) {

                const lessonId = Number(id);

                const lesson = await lessonsCollection.findOne(
                    { id: lessonId },
                    { session }
                );

                if (!lesson) {
                    const error = new Error("Lesson not found: " + lessonId);
                    error.statusCode = 404;
                    throw error;
                }

                // Only reserve if enough spaces remain
                const result = await lessonsCollection.updateOne(
                    {
                        id: lessonId,
                        availability: { $gte: quantity }
                    },
                    {
                        $inc: { availability: -quantity }
                    },
                    { session }
                );

                if (result.modifiedCount !== 1) {
                    const error = new Error(
                        "Not enough spaces available for " + lesson.subject
                    );
                    error.statusCode = 409;
                    throw error;
                }
            }

            // Save the order in the same transaction
            const newOrder = {
                name: order.name.trim(),
                phone: order.phone.trim(),
                cart: order.cart,
                orderDate: new Date()
            };

            const result = await ordersCollection.insertOne(
                newOrder,
                { session }
            );

            insertedOrderId = result.insertedId;
        });

        console.log("Order saved to MongoDB:", insertedOrderId);

        response.status(201).json({
            message: "Order received successfully!",
            orderId: insertedOrderId
        });

    } catch (error) {
        console.error("Checkout transaction failed:", error.message);

        response.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to complete checkout"
        });

    } finally {
        await session.endSession();
    }
});






/*
    WEEK 7 - MONGODB INTEGRATION
    Update the availability of a lesson.
*/
app.put("/lessons/:id", async function(request, response) {
    try {
        // Convert the lesson ID from the URL to a number
        const lessonId = Number(request.params.id);

        // Read the new availability from the request
        const availability = request.body.availability;

        // Validate the submitted values
        if (
            !Number.isInteger(lessonId) ||
            !Number.isInteger(availability) ||
            availability < 0
        ) {
            return response.status(400).json({
                message: "Invalid lesson ID or availability"
            });
        }

        // Access the lessons collection
        const lessonsCollection = client.db("skillspring").collection("lessons");

        // Update the matching lesson
        const result = await lessonsCollection.updateOne(
            { id: lessonId },
            { $set: { availability: availability } }
        );

        // Check whether the lesson exists
        if (result.matchedCount === 0) {
            return response.status(404).json({
                message: "Lesson not found"
            });
        }

        response.json({
            message: "Lesson availability updated successfully!"
        });

    } catch (error) {
        console.error("Error updating lesson:", error.message);

        response.status(500).json({
            message: "Failed to update lesson availability"
        });
    }
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
