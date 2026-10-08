const express = require("express");
const crypto = require("crypto");

const router = express.Router();

function safeCompare(a, b) {
    const valueA = Buffer.from(String(a || ""));
    const valueB = Buffer.from(String(b || ""));

    if (valueA.length !== valueB.length) {
        return false;
    }

    return crypto.timingSafeEqual(valueA, valueB);
}

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
        return res.status(500).json({
            success: false,
            message: "Admin login is not configured"
        });
    }

    const usernameValid = safeCompare(username, adminUsername);
    const passwordValid = safeCompare(password, adminPassword);

    if (!usernameValid || !passwordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }

    res.json({
        success: true,
        message: "Admin login successful"
    });
});

module.exports = router;