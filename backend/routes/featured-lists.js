const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const FEATURED_LISTS_FILE = path.join(
    __dirname,
    "../data/featured-lists.json"
);


// ==========================================
// GET ALL FEATURED LISTS
// GET /api/featured-lists
// ==========================================

router.get("/", (req, res) => {

    try {

        if (!fs.existsSync(FEATURED_LISTS_FILE)) {

            return res.json({
                success: true,
                lists: []
            });

        }

        const fileContent =
            fs.readFileSync(
                FEATURED_LISTS_FILE,
                "utf8"
            ).trim();

        const lists =
            fileContent
                ? JSON.parse(fileContent)
                : [];

        return res.json({
            success: true,
            lists: Array.isArray(lists)
                ? lists
                : []
        });

    } catch (error) {

        console.error(
            "Get featured lists error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load featured lists",
            error: error.message
        });

    }

});

// ==========================================
// UPDATE FEATURED LIST
// PUT /api/featured-lists/:id
// ==========================================

router.put("/:id", (req, res) => {

    try {

        const listId =
            String(req.params.id || "").trim();

        const poster =
            typeof req.body.poster === "string"
                ? req.body.poster.trim()
                : "";

        if (!listId) {

            return res.status(400).json({
                success: false,
                message: "Featured list ID is required"
            });

        }

        if (!fs.existsSync(FEATURED_LISTS_FILE)) {

            return res.status(404).json({
                success: false,
                message: "Featured lists database not found"
            });

        }

        const fileContent =
            fs.readFileSync(
                FEATURED_LISTS_FILE,
                "utf8"
            ).trim();

        let lists =
            fileContent
                ? JSON.parse(fileContent)
                : [];

        if (!Array.isArray(lists)) {
            lists = [];
        }

        const listIndex =
            lists.findIndex(
                list => list.id === listId
            );

        if (listIndex === -1) {

            return res.status(404).json({
                success: false,
                message: "Featured list not found"
            });

        }

        lists[listIndex].poster = poster;

        fs.writeFileSync(
            FEATURED_LISTS_FILE,
            JSON.stringify(lists, null, 4),
            "utf8"
        );

        return res.json({
            success: true,
            message: "Featured list poster updated successfully",
            list: lists[listIndex]
        });

    } catch (error) {

        console.error(
            "Update featured list error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update featured list",
            error: error.message
        });

    }

});
module.exports = router;