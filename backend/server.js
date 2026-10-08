const express = require("express");
const cors = require("cors");
require("dotenv").config();

const moviesRouter = require("./routes/movies");
const adminRouter = require("./routes/admin");
const featuredListsRouter = require("./routes/featured-lists");
const app = express();

const PORT = process.env.PORT || 4000;


// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// Routes
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        app: "MovieBox",
        message: "MovieBox backend is running"
    });
});


// Movies API
app.use("/api/movies", moviesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/featured-lists", featuredListsRouter);
// ==========================================
// 404
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});


// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
    console.log(
        `MovieBox backend running at http://localhost:${PORT}`
    );
});