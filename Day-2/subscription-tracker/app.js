import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to the Subscription Tracker API!");
})

app.listen(5000, () => {
    console.log("Server is running on link http://localhost:5000");
});

export default app;