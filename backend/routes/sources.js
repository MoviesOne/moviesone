const express = require("express");

const router = express.Router();


// ==========================================
// SOURCE NAMES
// ==========================================

const SOURCE_NAMES = [
    "Screenscape",
    "Filmu movie",
    "NHD Player",
    "Stream EMD",
    "Nex Stream"
];


// ==========================================
// MOVIE SOURCES
// ==========================================

function getMovieSources(tmdbId) {
    return [
        {
            name: "Screenscape",
            quality: "HD",
            embed: `https://nxsha.screenscape.me/embed?tmdb=${tmdbId}&type=movie&lan=eng`,
            download: ""
        },

        {
            name: "Filmu movie",
            quality: "HD",
            embed: `https://embed.filmu.in/movie/${tmdbId}`,
            download: ""
        },

        {
            name: "NHD Player",
            quality: "HD",
            embed: `https://nhdapi.com/movie/${tmdbId}`,
            download: ""
        },

        {
            name: "Stream EMD",
            quality: "HD",
            embed: `https://watch.embed-api.stream/embed/movie/${tmdbId}`,
            download: ""
        },

        {
            name: "Nex Stream",
            quality: "HD",
            embed: `https://api.codespecters.com/embed/movie/${tmdbId}?apikey=DEMO_36c097f0`,
            download: ""
        }
    ];
}


// ==========================================
// TV SOURCES
// ==========================================

function getTVSources(tmdbId, season, episode) {
    return [
        {
            name: "Screenscape",
            quality: "HD",
            embed: `https://nxsha.screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${season}&e=${episode}&lan=eng`,
            download: ""
        },

        {
            name: "Filmu movie",
            quality: "HD",
            embed: `https://embed.filmu.in/tv/${tmdbId}/${season}/${episode}`,
            download: ""
        },

        {
            name: "NHD Player",
            quality: "HD",
            embed: `https://nhdapi.com/tv/${tmdbId}/${season}/${episode}`,
            download: ""
        },

        {
            name: "Stream EMD",
            quality: "HD",
            embed: `https://watch.embed-api.stream/embed/tv/${tmdbId}/${season}/${episode}`,
            download: ""
        },

        {
            name: "Nex Stream",
            quality: "HD",
            embed: `https://api.codespecters.com/embed/tv/${tmdbId}/${season}/${episode}?apikey=DEMO_36c097f1`,
            download: ""
        }
    ];
}


// ==========================================
// GET ALL SOURCE NAMES
// GET /api/sources
// ==========================================

router.get("/", (req, res) => {

    res.json({
        success: true,
        sources: SOURCE_NAMES
    });

});


// ==========================================
// GET MOVIE SOURCES
// GET /api/sources/movie/:tmdbId
// ==========================================

router.get("/movie/:tmdbId", (req, res) => {

    const tmdbId = Number(req.params.tmdbId);

    if (!tmdbId) {
        return res.status(400).json({
            success: false,
            message: "Invalid TMDB movie ID"
        });
    }

    res.json({
        success: true,
        type: "movie",
        tmdbId,
        sources: getMovieSources(tmdbId)
    });

});


// ==========================================
// GET TV SOURCES
// GET /api/sources/tv/:tmdbId/:season/:episode
// ==========================================

router.get(
    "/tv/:tmdbId/:season/:episode",
    (req, res) => {

        const tmdbId = Number(req.params.tmdbId);
        const season = Number(req.params.season);
        const episode = Number(req.params.episode);

        if (!tmdbId || !season || !episode) {
            return res.status(400).json({
                success: false,
                message: "Invalid TV source parameters"
            });
        }

        res.json({
            success: true,
            type: "tv",
            tmdbId,
            season,
            episode,
            sources: getTVSources(
                tmdbId,
                season,
                episode
            )
        });

    }
);

module.exports = {
    router,
    getMovieSources,
    getTVSources
};