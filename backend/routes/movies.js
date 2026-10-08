const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const {
    getMovieSources
} = require("./sources");
const router = express.Router();

const MOVIES_FILE = path.join(
    __dirname,
    "../data/movies.json"
);

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";

// Process-local cache for repeated TMDB requests during local development.
const TMDB_CACHE_TTL_MS = 2 * 60 * 1000;
const tmdbCache = new Map();

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/";

// ==========================================
// TMDB REQUEST HELPER
// ==========================================
async function tmdbRequest(endpoint, retries = 3) {
    if (!TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is missing in .env");
    }

    const cached = tmdbCache.get(endpoint);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    if (cached) tmdbCache.delete(endpoint);

    const separator = endpoint.includes("?") ? "&" : "?";

    const url =
        `${TMDB_BASE_URL}${endpoint}${separator}api_key=${encodeURIComponent(TMDB_API_KEY)}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const data = await new Promise((resolve, reject) => {
               const request = https.get(
    url,
    {
        family: 4,
headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
    "Accept": "application/json"
},
        timeout: 20000
    },
                    (response) => {
                        let body = "";

                        response.setEncoding("utf8");

                        response.on("data", (chunk) => {
                            body += chunk;
                        });

                        response.on("end", () => {
                            if (
                                response.statusCode < 200 ||
                                response.statusCode >= 300
                            ) {
                                return reject(
                                    new Error(
                                        `TMDB API Error ${response.statusCode}: ${body}`
                                    )
                                );
                            }

                            try {
                                resolve(JSON.parse(body));
                            } catch {
                                reject(
                                    new Error(
                                        "TMDB returned invalid JSON response"
                                    )
                                );
                            }
                        });
                    }
                );

                request.on("timeout", () => {
                    request.destroy(
                        new Error("TMDB request timed out")
                    );
                });

                request.on("error", reject);
            });

            tmdbCache.set(endpoint, {
                data,
                expiresAt: Date.now() + TMDB_CACHE_TTL_MS
            });
            return data;

        } catch (error) {
            console.error(
                `TMDB request attempt ${attempt}/${retries} failed:`,
                error.code || error.message
            );

            if (attempt === retries) {
                throw new Error(
                    `TMDB connection failed: ${
                        error.code || error.message
                    }`
                );
            }

            // Small delay before retry
            await new Promise(resolve =>
                setTimeout(resolve, 1000 * attempt)
            );
        }
    }
}

// ==========================================
// STREAMING PROVIDERS
// ==========================================

const STREAMING_PLATFORMS = {

    netflix: {
        name: "Netflix",
        region: "US",
        aliases: [
            "Netflix"
        ]
    },

    "prime-video": {
        name: "Prime Video",
        region: "US",
        aliases: [
            "Amazon Prime Video",
            "Prime Video"
        ]
    },

    hulu: {
        name: "Hulu",
        region: "US",
        aliases: [
            "Hulu"
        ]
    },

    "disney-plus": {
        name: "Disney+",
        region: "US",
        aliases: [
            "Disney Plus",
            "Disney+"
        ]
    },

    "apple-tv-plus": {
        name: "Apple TV+",
        region: "US",
        aliases: [
            "Apple TV Plus",
            "Apple TV"
        ]
    },

    max: {
        name: "Max",
        region: "US",
        aliases: [
            "Max",
            "HBO Max"
        ]
    },

    paramount: {
        name: "Paramount+",
        region: "US",
        aliases: [
            "Paramount Plus",
            "Paramount+"
        ]
    },

    peacock: {
        name: "Peacock",
        region: "US",
        aliases: [
            "Peacock"
        ]
    },

    jiohotstar: {
        name: "JioHotstar",
        region: "IN",
        aliases: [
            "JioHotstar",
            "Jio Hotstar",
            "Disney Plus Hotstar",
            "Disney+ Hotstar"
        ]
    }

};
async function findProviderId(platform, mediaType = "movie") {

    const config =
        STREAMING_PLATFORMS[platform];

    if (!config) {
        throw new Error("Unknown streaming platform");
    }


    const endpoint =
        mediaType === "tv"
            ? `/watch/providers/tv?language=en-US&watch_region=${config.region}`
            : `/watch/providers/movie?language=en-US&watch_region=${config.region}`;


    const data =
        await tmdbRequest(endpoint);


    const providers =
        data.results || [];


    /*
     * Normalize names so:
     *
     * Paramount+
     * Paramount Plus
     * PARAMOUNT+
     *
     * can all match.
     */

    const normalizeProviderName = name => {

        return String(name || "")
            .toLowerCase()
            .replace(/[+]/g, "plus")
            .replace(/[^a-z0-9]/g, "");

    };


    const aliases = [
        config.name,
        ...(config.aliases || [])
    ]
        .map(normalizeProviderName);


    const provider =
        providers.find(item => {

            const providerName =
                normalizeProviderName(
                    item.provider_name
                );


            return aliases.some(alias => {

                return (
                    providerName === alias ||
                    providerName.includes(alias) ||
                    alias.includes(providerName)
                );

            });

        });


    if (provider) {

        console.log(
            `MovieBox provider found: ${config.name}`,
            provider.provider_id,
            provider.provider_name
        );

    } else {

        console.warn(
            `MovieBox provider NOT found: ${config.name}`,
            {
                region: config.region,
                mediaType
            }
        );

    }


    return provider || null;

}
// ==========================================
// FORMAT MOVIE
// ==========================================

function formatMovie(movie) {

    return {
        id: movie.id,
        tmdbId: movie.id,

        title:
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            "Unknown Title",

        original_title:
            movie.original_title ||
            movie.original_name ||
            movie.title ||
            movie.name ||
            "",

        overview:
            movie.overview || "",

        poster:
            movie.poster_path
                ? `${IMAGE_BASE_URL}w500${movie.poster_path}`
                : "",

        backdrop:
            movie.backdrop_path
                ? `${IMAGE_BASE_URL}original${movie.backdrop_path}`
                : "",

        rating:
            movie.vote_average ?? 0,

        release_date:
            movie.release_date ||
            movie.first_air_date ||
            "",

        runtime:
            movie.runtime || 0,

        genres:
            movie.genres || [],

        original_language:
            movie.original_language || "",

        production_countries:
            movie.production_countries || [],

        media_type:
            movie.media_type ||
            (
                movie.name ||
                movie.first_air_date
                    ? "tv"
                    : "movie"
            ),

        number_of_seasons:
            movie.number_of_seasons || 0,

        number_of_episodes:
            movie.number_of_episodes || 0,

        sources: getMovieSources(movie.id),

       screenshots:
    Array.isArray(movie.images?.backdrops)
        ? movie.images.backdrops
            .slice(0, 12)
            .map(image => ({
                url:
                    `${IMAGE_BASE_URL}w1280${image.file_path}`,

                file_path:
                    image.file_path,

                aspect_ratio:
                    image.aspect_ratio,

                width:
                    image.width,

                height:
                    image.height
            }))
        : []
    };
}


// ==========================================
// FORMAT TV
// ==========================================

function formatTV(show) {

    return {
        id: show.id,
        tmdbId: show.id,

        title:
            show.name ||
            show.original_name ||
            "Unknown Title",

        original_title:
            show.original_name ||
            show.name ||
            "",

        overview:
            show.overview || "",

        poster:
            show.poster_path
                ? `${IMAGE_BASE_URL}w500${show.poster_path}`
                : "",

        backdrop:
            show.backdrop_path
                ? `${IMAGE_BASE_URL}original${show.backdrop_path}`
                : "",

        rating:
            show.vote_average ?? 0,

        release_date:
            show.first_air_date || "",

        runtime:
            0,

        genres:
            show.genres || [],

        original_language:
            show.original_language || "",

        media_type: "tv",

        number_of_seasons:
            show.number_of_seasons || 0,

        number_of_episodes:
            show.number_of_episodes || 0,

        sources: [],

        screenshots: []
    };
}


// ==========================================
// POPULAR MOVIES
// GET /api/movies
// ==========================================

router.get("/", async (req, res) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const data = await tmdbRequest(
            `/movie/popular?language=en-US&page=${page}`
        );

        const results =
            data.results.map(formatMovie);

        res.json({
            success: true,
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results
        });

    } catch (error) {

        console.error(
            "TMDB popular movies error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch popular movies",
            error: error.message
        });

    }

});

// ==========================================
// TRENDING TV
// GET /api/movies/trending-tv?page=1
// ==========================================

router.get("/trending-tv", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await tmdbRequest(
                `/trending/tv/day?language=en-US&page=${page}`
            );


        const results =
            (data.results || [])
                .map(formatTV);


        res.json({

            success: true,

            page:
                data.page || page,

            total_pages:
                data.total_pages || 1,

            total_results:
                data.total_results ||
                results.length,

            results

        });


    } catch (error) {

        console.error(
            "TMDB trending TV error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch trending TV shows",

            error:
                error.message

        });

    }

});

// ==========================================
// NEW RELEASES
// GET /api/movies/new-releases
//
// Includes:
// 1. India theatrical releases
// 2. India digital/streaming releases
// 3. Configured streaming platforms
//
// Sorted by latest release date
// ==========================================

router.get("/new-releases", async (req, res) => {

    try {

        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const today =
            new Date().toISOString().split("T")[0];


        // ======================================
        // 1. INDIA RELEASES
        // ======================================

        const indiaData = await tmdbRequest(
            `/discover/movie` +
            `?language=en-US` +
            `&region=IN` +
            `&release_date.lte=${today}` +
            `&with_release_type=2|3|4` +
            `&sort_by=primary_release_date.desc` +
            `&include_adult=false` +
            `&include_video=false` +
            `&page=${page}`
        );


        // ======================================
        // 2. CONFIGURED STREAMING PLATFORMS
        // ======================================

        const platformNames = Object.keys(
            STREAMING_PLATFORMS
        );


        const providerIds = [];


        for (const platform of platformNames) {

            try {

                const provider =
                    await findProviderId(
                        platform,
                        "movie"
                    );

                if (provider?.provider_id) {

                    providerIds.push(
                        provider.provider_id
                    );

                }

            } catch (providerError) {

                console.warn(
                    `Unable to resolve provider: ${platform}`,
                    providerError.message
                );

            }

        }


        let streamingResults = [];


        if (providerIds.length) {

            const streamingData =
                await tmdbRequest(
                    `/discover/movie` +
                    `?language=en-US` +
                    `&watch_region=IN` +
                    `&with_watch_providers=${providerIds.join("|")}` +
                    `&with_watch_monetization_types=flatrate` +
                    `&sort_by=primary_release_date.desc` +
                    `&release_date.lte=${today}` +
                    `&include_adult=false` +
                    `&include_video=false` +
                    `&page=${page}`
                );


            streamingResults =
                streamingData.results || [];

        }


        // ======================================
        // 3. MERGE INDIA + STREAMING RESULTS
        // ======================================

        const merged = [
            ...(indiaData.results || []),
            ...streamingResults
        ];


        // ======================================
        // 4. REMOVE DUPLICATES
        // ======================================

        const uniqueMovies =
            new Map();


        for (const movie of merged) {

            if (!movie?.id) {
                continue;
            }

            const existing =
                uniqueMovies.get(movie.id);


            if (!existing) {

                uniqueMovies.set(
                    movie.id,
                    movie
                );

                continue;
            }


            // Prefer the earliest known
            // India/streaming release date.
            const existingDate =
                existing.release_date || "";

            const currentDate =
                movie.release_date || "";


            if (
                currentDate &&
                (
                    !existingDate ||
                    currentDate > existingDate
                )
            ) {

                uniqueMovies.set(
                    movie.id,
                    movie
                );

            }

        }


        // ======================================
        // 5. SORT LATEST FIRST
        // ======================================

        const results =
            Array.from(
                uniqueMovies.values()
            )
            .sort((a, b) => {

                const dateA =
                    a.release_date || "";

                const dateB =
                    b.release_date || "";

                return dateB.localeCompare(dateA);

            })
            .map(formatMovie);


        // ======================================
        // RESPONSE
        // ======================================

        res.json({

            success: true,

            page,

            total_pages:
                Math.max(
                    indiaData.total_pages || 1,
                    1
                ),

            total_results:
                results.length,

            results

        });


    } catch (error) {

        console.error(
            "TMDB new releases error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch new releases",

            error:
                error.message

        });

    }

});

// ==========================================
// TOP MOVIES
// GET /api/movies/top
// ==========================================

router.get("/top", async (req, res) => {

    try {

        const data = await tmdbRequest(
            "/movie/top_rated?language=en-US&page=1"
        );

        const results =
            data.results
                .slice(0, 10)
                .map(formatMovie);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB top movies error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch top movies",
            error: error.message
        });

    }

});


// ==========================================
// TOP TV SHOWS
// GET /api/movies/top-shows
// ==========================================

router.get("/top-shows", async (req, res) => {

    try {

        const data = await tmdbRequest(
            "/tv/top_rated?language=en-US&page=1"
        );

        const results =
            data.results
                .slice(0, 10)
                .map(formatTV);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB top TV error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch top TV shows",
            error: error.message
        });

    }

});

// ==========================================
// DISCOVER MOVIES HELPER
// ==========================================

async function discoverMovies(
    filters = {},
    page = 1
) {

    const params = new URLSearchParams({

        language: "en-US",

        sort_by:
            filters.sort_by ||
            "popularity.desc",

        include_adult: "false",

        include_video: "false",

        page: String(page)

    });


    if (filters.with_genres) {

        params.set(
            "with_genres",
            filters.with_genres
        );

    }


    if (filters.with_origin_country) {

        params.set(
            "with_origin_country",
            filters.with_origin_country
        );

    }


    if (filters.with_companies) {

        params.set(
            "with_companies",
            filters.with_companies
        );

    }


    const data =
        await tmdbRequest(
            `/discover/movie?${params.toString()}`
        );


    return {

        page:
            data.page || page,

        total_pages:
            data.total_pages || 1,

        total_results:
            data.total_results || 0,

        results:
            (data.results || [])
                .map(formatMovie)

    };

}

// ==========================================
// ANIMATION MOVIES
// GET /api/movies/animation
// ==========================================

router.get("/animation", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await discoverMovies(
                {
                    // TMDB Animation genre
                    with_genres: "16"
                },
                page
            );


        res.json({

            success: true,

            page:
                data.page,

            total_pages:
                data.total_pages,

            total_results:
                data.total_results,

            results:
                data.results

        });


    } catch (error) {

        console.error(
            "TMDB animation movies error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch animation movies",

            error:
                error.message

        });

    }

});

// ==========================================
// MARVEL UNIVERSE
// GET /api/movies/marvel
// ==========================================

router.get("/marvel", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await discoverMovies(
                {
                    // Marvel Studios
                    with_companies: "420"
                },
                page
            );


        res.json({

            success: true,

            page:
                data.page,

            total_pages:
                data.total_pages,

            total_results:
                data.total_results,

            results:
                data.results

        });


    } catch (error) {

        console.error(
            "TMDB Marvel movies error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch Marvel movies",

            error:
                error.message

        });

    }

});

// ==========================================
// DC UNIVERSE
// GET /api/movies/dc
// ==========================================

router.get("/dc", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await discoverMovies(
                {
                    // DC Comics
                    with_companies: "174"
                },
                page
            );


        res.json({

            success: true,

            page:
                data.page,

            total_pages:
                data.total_pages,

            total_results:
                data.total_results,

            results:
                data.results

        });


    } catch (error) {

        console.error(
            "TMDB DC movies error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch DC movies",

            error:
                error.message

        });

    }

});

// ==========================================
// KOREAN DRAMA & MOVIES
// GET /api/movies/korean
// ==========================================

router.get("/korean", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await discoverMovies(
                {
                    with_origin_country: "KR"
                },
                page
            );


        res.json({

            success: true,

            page:
                data.page,

            total_pages:
                data.total_pages,

            total_results:
                data.total_results,

            results:
                data.results

        });


    } catch (error) {

        console.error(
            "TMDB Korean movies error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch Korean movies",

            error:
                error.message

        });

    }

});

// ==========================================
// DISCOVER TV HELPER
// ==========================================

async function discoverTV(
    filters = {},
    page = 1
) {

    const params = new URLSearchParams({

        language: "en-US",

        sort_by:
            filters.sort_by ||
            "popularity.desc",

        include_adult: "false",

        page: String(page)

    });


    if (filters.with_genres) {

        params.set(
            "with_genres",
            filters.with_genres
        );

    }


    if (filters.with_origin_country) {

        params.set(
            "with_origin_country",
            filters.with_origin_country
        );

    }


    if (filters.with_companies) {

        params.set(
            "with_companies",
            filters.with_companies
        );

    }


    const data =
        await tmdbRequest(
            `/discover/tv?${params.toString()}`
        );


    return {

        page:
            data.page || page,

        total_pages:
            data.total_pages || 1,

        total_results:
            data.total_results || 0,

        results:
            (data.results || [])
                .map(formatTV)

    };

}

// ==========================================
// ANIME SERIES
// GET /api/movies/anime-series
// ==========================================

router.get("/anime-series", async (req, res) => {

    try {

        const page =
            Math.max(
                1,
                Number.parseInt(
                    req.query.page,
                    10
                ) || 1
            );


        const data =
            await discoverTV(
                {
                    // Animation genre
                    with_genres: "16",

                    // Japan
                    with_origin_country: "JP"
                },
                page
            );


        res.json({

            success: true,

            page:
                data.page,

            total_pages:
                data.total_pages,

            total_results:
                data.total_results,

            results:
                data.results

        });


    } catch (error) {

        console.error(
            "TMDB anime series error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch anime series",

            error:
                error.message

        });

    }

});

// ==========================================
// GENRE MOVIES
// ==========================================

async function getGenreMovies(
    genreId,
    page = 1
) {

    const data = await tmdbRequest(
        `/discover/movie?language=en-US&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );

    return data.results.map(formatMovie);
}

// ==========================================
// ROMANCE
// GET /api/movies/romance
// ==========================================

router.get("/romance", async (req, res) => {

    try {

        const results =
            await getGenreMovies(10749);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB romance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch romance movies",
            error: error.message
        });

    }

});


// ==========================================
// THRILLER
// GET /api/movies/thriller
// ==========================================

router.get("/thriller", async (req, res) => {

    try {

        const results =
            await getGenreMovies(53);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB thriller error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch thriller movies",
            error: error.message
        });

    }

});

// ==========================================
// HORROR
// GET /api/movies/horror
// ==========================================

router.get("/horror", async (req, res) => {

    try {

        const results =
            await getGenreMovies(27);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB horror error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch horror movies",
            error: error.message
        });

    }

});


// ==========================================
// COMEDY
// GET /api/movies/comedy
// ==========================================

router.get("/comedy", async (req, res) => {

    try {

        const results =
            await getGenreMovies(35);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB comedy error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch comedy movies",
            error: error.message
        });

    }

});


// ==========================================
// ACTION
// GET /api/movies/action
// ==========================================

router.get("/action", async (req, res) => {

    try {

        const results =
            await getGenreMovies(28);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB action error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch action movies",
            error: error.message
        });

    }

});


// ==========================================
// SCI-FI
// GET /api/movies/scifi
// ==========================================

router.get("/scifi", async (req, res) => {

    try {

        const results =
            await getGenreMovies(878);

        res.json({
            success: true,
            results
        });

    } catch (error) {

        console.error(
            "TMDB sci-fi error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch sci-fi movies",
            error: error.message
        });

    }

});


// ==========================================
// SEARCH MOVIES
// GET /api/movies/search?query=spider
// ==========================================

router.get("/search", async (req, res) => {

    try {

        const query =
            String(req.query.query || "").trim();

        if (!query) {

            return res.json({
                success: true,
                results: []
            });

        }

        const data = await tmdbRequest(
            `/search/multi?language=en-US&query=${encodeURIComponent(query)}`
        );

        const results =
            data.results
                .filter(
                    item =>
                        item.media_type === "movie" ||
                        item.media_type === "tv"
                )
                .map(item =>
                    item.media_type === "tv"
                        ? formatTV(item)
                        : formatMovie(item)
                );

        res.json({
            success: true,
            page: data.page,
            total_pages: data.total_pages,
            total_results: results.length,
            results
        });

    } catch (error) {

        console.error(
            "TMDB search error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to search",
            error: error.message
        });

    }

});

// ==========================================
// ADD MOVIE TO MOVIEBOX
// POST /api/movies/add
// ==========================================

router.post("/add", (req, res) => {

    try {

        const movie = req.body;

        if (!movie || !movie.id) {

            return res.status(400).json({
                success: false,
                message: "Movie data is required"
            });

        }

        const tmdbId = Number(
            movie.tmdbId || movie.id
        );

        if (!tmdbId) {

            return res.status(400).json({
                success: false,
                message: "Valid TMDB ID is required"
            });

        }

        if (
            movie.media_type &&
            movie.media_type !== "movie"
        ) {

            return res.status(400).json({
                success: false,
                message: "Only movies can be added from Movie Management"
            });

        }

        let movies = [];

        if (fs.existsSync(MOVIES_FILE)) {

            const fileContent =
                fs.readFileSync(
                    MOVIES_FILE,
                    "utf8"
                ).trim();

            if (fileContent) {
                movies = JSON.parse(fileContent);
            }

        }

        if (!Array.isArray(movies)) {
            movies = [];
        }

        const alreadyExists =
            movies.some(item =>
                Number(
                    item.tmdbId || item.id
                ) === tmdbId
            );

        if (alreadyExists) {

            return res.status(409).json({
                success: false,
                message: "Movie already exists in MovieBox"
            });

        }

        const movieToSave = {

            id: tmdbId,

            tmdbId: tmdbId,

            title:
                movie.title ||
                movie.name ||
                "Unknown Title",

            original_title:
                movie.original_title ||
                movie.title ||
                "",

            overview:
                movie.overview ||
                "",

            poster:
                movie.poster ||
                "",

            backdrop:
                movie.backdrop ||
                "",

            rating:
                movie.rating ?? 0,

            release_date:
                movie.release_date ||
                "",

            runtime:
                movie.runtime || 0,

            genres:
                Array.isArray(movie.genres)
                    ? movie.genres
                    : [],

            original_language:
                movie.original_language ||
                "",

            production_countries:
                Array.isArray(
                    movie.production_countries
                )
                    ? movie.production_countries
                    : [],

            media_type:
                "movie",

            number_of_seasons:
                0,

            number_of_episodes:
                0,

            sources:
                getMovieSources(tmdbId),

            screenshots:
                Array.isArray(movie.screenshots)
                    ? movie.screenshots
                    : []

        };

        movies.push(movieToSave);

        fs.writeFileSync(
            MOVIES_FILE,
            JSON.stringify(
                movies,
                null,
                4
            ),
            "utf8"
        );

        return res.status(201).json({
            success: true,
            message: "Movie added to MovieBox",
            movie: movieToSave
        });

    } catch (error) {

        console.error(
            "Add movie error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to add movie",
            error: error.message
        });

    }

});
// ==========================================
// GET MOVIES SAVED IN MOVIEBOX
// GET /api/movies/managed
// ==========================================

router.get("/managed", (req, res) => {

    try {

        if (!fs.existsSync(MOVIES_FILE)) {
            return res.json({
                success: true,
                movies: []
            });
        }

        const fileContent =
            fs.readFileSync(
                MOVIES_FILE,
                "utf8"
            ).trim();

        const movies = fileContent
            ? JSON.parse(fileContent)
            : [];

        return res.json({
            success: true,
            movies: Array.isArray(movies)
                ? movies
                : []
        });

    } catch (error) {

        console.error(
            "Get managed movies error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load MovieBox movies",
            error: error.message
        });
    }

});

// ==========================================
// REMOVE MOVIE FROM MOVIEBOX
// DELETE /api/movies/:tmdbId
// ==========================================

router.delete("/:tmdbId", (req, res) => {

    try {

        const tmdbId = Number(
            req.params.tmdbId
        );

        if (!tmdbId) {

            return res.status(400).json({
                success: false,
                message: "Valid TMDB ID is required"
            });

        }

        if (!fs.existsSync(MOVIES_FILE)) {

            return res.status(404).json({
                success: false,
                message: "Movie database not found"
            });

        }

        const fileContent =
            fs.readFileSync(
                MOVIES_FILE,
                "utf8"
            ).trim();

        let movies = fileContent
            ? JSON.parse(fileContent)
            : [];

        if (!Array.isArray(movies)) {
            movies = [];
        }

        const movieIndex =
            movies.findIndex(movie =>
                Number(
                    movie.tmdbId || movie.id
                ) === tmdbId
            );

        if (movieIndex === -1) {

            return res.status(404).json({
                success: false,
                message: "Movie is not in MovieBox"
            });

        }

        const removedMovie =
            movies[movieIndex];

        movies.splice(
            movieIndex,
            1
        );

        fs.writeFileSync(
            MOVIES_FILE,
            JSON.stringify(
                movies,
                null,
                4
            ),
            "utf8"
        );

        return res.json({
            success: true,
            message: "Movie removed from MovieBox",
            movie: removedMovie
        });

    } catch (error) {

        console.error(
            "Remove movie error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to remove movie",
            error: error.message
        });

    }

});

//
// ==========================================
// EDIT MOVIE IN MOVIEBOX
// PUT /api/movies/:tmdbId
// ==========================================

router.put("/:tmdbId", (req, res) => {

    try {

        const tmdbId = Number(
            req.params.tmdbId
        );

        if (!tmdbId) {
            return res.status(400).json({
                success: false,
                message: "Valid TMDB ID is required"
            });
        }

        if (!fs.existsSync(MOVIES_FILE)) {
            return res.status(404).json({
                success: false,
                message: "Movie database not found"
            });
        }

        const fileContent =
            fs.readFileSync(
                MOVIES_FILE,
                "utf8"
            ).trim();

        let movies = fileContent
            ? JSON.parse(fileContent)
            : [];

        if (!Array.isArray(movies)) {
            movies = [];
        }

        const movieIndex =
            movies.findIndex(movie =>
                Number(
                    movie.tmdbId || movie.id
                ) === tmdbId
            );

        if (movieIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Movie is not in MovieBox"
            });
        }

        const currentMovie =
            movies[movieIndex];

        const allowedFields = [
            "title",
            "original_title",
            "overview",
            "poster",
            "backdrop",
            "rating",
            "release_date",
            "runtime",
            "genres",
            "original_language",
            "production_countries",
            "sources",
            "screenshots"
        ];

        allowedFields.forEach(field => {

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                currentMovie[field] =
                    req.body[field];
            }

        });

        movies[movieIndex] =
            currentMovie;

        fs.writeFileSync(
            MOVIES_FILE,
            JSON.stringify(
                movies,
                null,
                4
            ),
            "utf8"
        );

        return res.json({
            success: true,
            message: "Movie updated successfully",
            movie: currentMovie
        });

    } catch (error) {

        console.error(
            "Edit movie error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update movie",
            error: error.message
        });

    }

});

router.get("/platform/:platform", async (req, res) => {
    try {
        const platform = String(req.params.platform || "")
            .trim()
            .toLowerCase();

        const config = STREAMING_PLATFORMS[platform];

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Unknown streaming platform"
            });
        }
const provider =
    await findProviderId(
        platform,
        "movie"
    );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: `${config.name} provider not found`
            });
        }

        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const data = await tmdbRequest(
            `/discover/movie` +
            `?language=en-US` +
            `&watch_region=${config.region}` +
            `&with_watch_providers=${provider.provider_id}` +
            `&with_watch_monetization_types=flatrate` +
            `&sort_by=popularity.desc` +
            `&page=${page}`
        );

        const results = (data.results || []).map(formatMovie);

        res.json({
            success: true,
            platform,
            platform_name: config.name,
            region: config.region,
            provider_id: provider.provider_id,
            page: data.page || page,
            total_pages: data.total_pages || 0,
            total_results: data.total_results || 0,
            results
        });

    } catch (error) {
        console.error("Platform movies error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load platform movies"
        });
    }
});

router.get("/platform/:platform/tv", async (req, res) => {
    try {
        const platform = String(req.params.platform || "")
            .trim()
            .toLowerCase();

        const config = STREAMING_PLATFORMS[platform];

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Unknown streaming platform"
            });
        }

      const provider =
    await findProviderId(
        platform,
        "tv"
    );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: `${config.name} provider not found`
            });
        }

        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const data = await tmdbRequest(
            `/discover/tv` +
            `?language=en-US` +
            `&watch_region=${config.region}` +
            `&with_watch_providers=${provider.provider_id}` +
            `&with_watch_monetization_types=flatrate` +
            `&sort_by=popularity.desc` +
            `&page=${page}`
        );

        const results = (data.results || []).map(formatTV);

        res.json({
            success: true,
            platform,
            platform_name: config.name,
            region: config.region,
            provider_id: provider.provider_id,
            page: data.page || page,
            total_pages: data.total_pages || 0,
            total_results: data.total_results || 0,
            results
        });

    } catch (error) {
        console.error("Platform TV error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load platform TV shows"
        });
    }
});


// ==========================================
// TV SEASON EPISODES
// GET /api/movies/tv/:id/season/:season
// ==========================================

router.get("/tv/:id/season/:season", async (req, res) => {

    try {

        const tvId = Number(req.params.id);
        const season = Number(req.params.season);

        if (!tvId || !season) {

            return res.status(400).json({
                success: false,
                message: "Invalid TV ID or season"
            });

        }

        const data = await tmdbRequest(
            `/tv/${tvId}/season/${season}?language=en-US`
        );

        const episodes = (data.episodes || []).map(
            episode => ({
                id: episode.id,
                episode_number: episode.episode_number,
                name: episode.name || "",
                overview: episode.overview || "",
                air_date: episode.air_date || "",
                runtime: episode.runtime || 0,
                still_path: episode.still_path
                    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                    : "",
                season_number: episode.season_number
            })
        );

        res.json({
            success: true,
            season,
            episodes
        });

    } catch (error) {

        console.error(
            "TMDB season episodes error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch season episodes",
            error: error.message
        });

    }

});
// ==========================================
// SINGLE TV SERIES
// GET /api/movies/tv/:id
// ==========================================

router.get("/tv/:id", async (req, res) => {

    try {

        const tvId =
            Number(req.params.id);

        if (!tvId) {

            return res.status(400).json({
                success: false,
                message: "Invalid TV ID"
            });

        }


        const tvData =
            await tmdbRequest(
                `/tv/${tvId}?language=en-US`
            );


        const seasons = [];


        for (
            const seasonInfo
            of (tvData.seasons || [])
        ) {

            const seasonNumber =
                Number(
                    seasonInfo.season_number
                );


            if (
                seasonNumber < 1
            ) {
                continue;
            }


            try {

                const seasonData =
                    await tmdbRequest(
                        `/tv/${tvId}/season/${seasonNumber}?language=en-US`
                    );


                const episodes =
                    (seasonData.episodes || [])
                        .map(episode => ({

                            id: episode.id,

                            episode_number:
                                episode.episode_number,

                            name:
                                episode.name,

                            overview:
                                episode.overview,

                            air_date:
                                episode.air_date,

                            runtime:
                                episode.runtime,

                            rating:
                                episode.vote_average,

                            still:
                                episode.still_path
                                    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                                    : "",

                        }));


                seasons.push({

                    season_number:
                        seasonNumber,

                    episode_count:
                        episodes.length,

                    episodes

                });


            } catch (seasonError) {

                console.error(
                    `Season ${seasonNumber} error:`,
                    seasonError.message
                );


                seasons.push({

                    season_number:
                        seasonNumber,

                    episode_count:
                        seasonInfo.episode_count || 0,

                    episodes: []

                });

            }

        }


        res.json({

            success: true,

            series: {

                id: tvData.id,

                tmdbId: tvData.id,

                media_type: "tv",

                title:
                    tvData.name,

                original_title:
                    tvData.original_name,

                overview:
                    tvData.overview,

                poster:
                    tvData.poster_path
                        ? `https://image.tmdb.org/t/p/w500${tvData.poster_path}`
                        : "",

                backdrop:
                    tvData.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${tvData.backdrop_path}`
                        : "",

                rating:
                    tvData.vote_average,

                first_air_date:
                    tvData.first_air_date,

                release_date:
                    tvData.first_air_date,

                genres:
                    tvData.genres || [],

                number_of_seasons:
                    tvData.number_of_seasons,

                number_of_episodes:
                    tvData.number_of_episodes,

                seasons

            }

        });


    } catch (error) {

        console.error(
            "TMDB TV details error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch TV series details",

            error:
                error.message

        });

    }

});

// ==========================================
// SINGLE MOVIE
// GET /api/movies/:id
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const movieId =
            Number(req.params.id);

        if (!movieId) {

            return res.status(400).json({
                success: false,
                message: "Invalid movie ID"
            });

        }

       const data = await tmdbRequest(
    `/movie/${movieId}?language=en-US&append_to_response=images&include_image_language=en-US,null`
);

        const movie =
            formatMovie(data);

        res.json({
            success: true,
            movie
        });

    } catch (error) {

        console.error(
            "TMDB movie details error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch movie details",
            error: error.message
        });

    }

});
module.exports = router;