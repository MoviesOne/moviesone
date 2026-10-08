/* =========================================
   MOVIEBOX API
========================================= */

const API_BASE = "https://moviesone.onrender.com/api";


/* =========================================
   BASIC API REQUEST
========================================= */

async function apiGet(endpoint) {

    try {

        const response = await fetch(`${API_BASE}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("MovieBox API Error:", error);

        throw error;
    }
}


/* =========================================
   API POST
========================================= */

async function apiPost(endpoint, body = {}) {

    try {

        const response = await fetch(`${API_BASE}${endpoint}`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)

        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error("MovieBox API Error:", error);

        throw error;
    }
}


/* =========================================
   API PUT
========================================= */

async function apiPut(endpoint, body = {}) {

    try {

        const response = await fetch(`${API_BASE}${endpoint}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)

        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error("MovieBox API Error:", error);

        throw error;
    }
}


/* =========================================
   API DELETE
========================================= */

async function apiDelete(endpoint) {

    try {

        const response = await fetch(`${API_BASE}${endpoint}`, {

            method: "DELETE"

        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error("MovieBox API Error:", error);

        throw error;
    }
}


/* =========================================
   IMAGE HELPER
========================================= */

function getImageUrl(path, size = "w500") {

    if (!path) {
        return "";
    }

    // Already a complete URL
    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    // TMDB image path
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

function normalizeMoviesResponse(data) {

    if (!data) {
        return [];
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.results)) {
        return data.results;
    }

    if (Array.isArray(data.movies)) {
        return data.movies;
    }

    if (
        data.data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }

    return [];
}

/* =========================================
   SAFE TEXT
========================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}