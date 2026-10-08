// ==========================================
// MovieBox - Premium Movie Details
// ==========================================
// ==========================================
// PREMIUM INLINE LOADING BAR
// ==========================================

function showDetailLoading(container) {
    if (!container) return;

    // Avoid duplicate bars
    if (container.querySelector(".detail-loading-bar")) {
        return;
    }

    container.insertAdjacentHTML(
        "afterbegin",
        `
        <div class="detail-loading-bar"
             role="progressbar"
             aria-label="Loading details">
            <span></span>
        </div>
        `
    );
}

async function loadMovieDetails(
    movieId,
    mediaType = "movie"
) {
    const container = document.getElementById("movie-detail-content");

    if (!container) {
        console.error("Movie detail container not found.");
        return;
    }

   showDetailLoading(container);

    try {
      const response = await apiGet(
    `/movies/${encodeURIComponent(movieId)}?type=${mediaType}`
);
        const movie =
            response?.movie ||
            response?.data ||
            response;

        if (!movie || !movie.id) {
            throw new Error("Movie not found");
        }

        if (window.MovieBoxSEO) {
            window.MovieBoxSEO.applyMovieSeo(movie, mediaType);
        }

        renderMovieDetails(movie);

    } catch (error) {
        console.error("Movie details error:", error);

        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>

                <h3>Movie not found</h3>

                <p>
                    We couldn't load this movie right now.
                </p>

                <button
                    class="retry-button"
                  onclick="goBackFromMovie()"
                >
                    Back to Home
                </button>
            </div>
        `;
    }
}


// ==========================================
// Render Movie Details
// ==========================================

function renderMovieDetails(movie) {
    console.log("MOVIE RENDER STARTED", movie);
    const container =
        document.getElementById("movie-detail-content");

    if (!container) return;
// Invalidate any pending episode request from previous content
window.seriesSourceRequestId =
    (window.seriesSourceRequestId || 0) + 1;

window.currentMovieSources = [];

window.seriesState = {
    movie: null,
    seasons: [],
    currentSeasonIndex: 0,
    currentEpisodeIndex: 0
};

const oldIframe = document.getElementById("movieEmbed");
if (oldIframe) {
    oldIframe.src = "about:blank";
    oldIframe.style.display = "none";
}
    const title =
        movie.title ||
        movie.name ||
        movie.original_title ||
        "Untitled";

    const originalTitle =
        movie.original_title ||
        movie.originalTitle ||
        title;

    const overview =
        movie.overview ||
        movie.description ||
        "No description available.";

    const poster =
        movie.poster ||
        movie.poster_path ||
        movie.posterUrl ||
        "";

    const backdrop =
        movie.backdrop ||
        movie.backdrop_path ||
        movie.backdropUrl ||
        poster;

    const rating =
        movie.rating ??
        movie.vote_average ??
        movie.score ??
        "N/A";

    const releaseDate =
        movie.release_date ||
        movie.releaseDate ||
        movie.first_air_date ||
        "";

    const year =
        releaseDate
            ? String(releaseDate).substring(0, 4)
            : (movie.year || "N/A");

    const runtime =
        movie.runtime ||
        movie.duration ||
        0;

    const runtimeText =
        runtime
            ? `${runtime} min`
            : "N/A";

    const language =
        movie.original_language ||
        movie.language ||
        "N/A";

    const countries =
        Array.isArray(movie.production_countries)
            ? movie.production_countries
            : [];

    const countryNames =
        countries
            .map(country => {
                if (typeof country === "string") {
                    return country;
                }

                return (
                    country.name ||
                    country.iso_3166_1 ||
                    ""
                );
            })
            .filter(Boolean);

    const countryText =
        countryNames.length
            ? countryNames.join(", ")
            : "N/A";

    const genres =
        Array.isArray(movie.genres)
            ? movie.genres
            : [];

    const genreNames =
        genres
            .map(genre => {
                if (typeof genre === "string") {
                    return genre;
                }

                return genre.name || "";
            })
            .filter(Boolean);

    const movieId =
        movie.id ||
        movie.tmdbId;

    // Store current movie before rendering
    window.currentMovie = movie;

    container.innerHTML = `
        <div class="movie-detail-page">

        


            <!-- Reserved display ad slot: add ad provider code here later -->
            <div class="ad-slot ad-slot--banner" id="ad-slot-movie-player" data-ad-slot="movie-player" aria-label="Reserved advertisement space">Ad space reserved</div>

            <!-- ======================================
                 VIDEO PLAYER
            ======================================= -->

            <section
                class="movie-player-section"
                id="movie-player-section"
            >

                <div class="movie-player-heading">

                    <div>
                        <span class="section-eyebrow">
                            NOW PLAYING
                        </span>

                        <h2>Watch Movie</h2>
                    </div>

                </div>


                <div class="movie-player-container">

                    <div
                        class="movie-player"
                        id="movie-player"
                    >

                        <div
                            id="playerPlaceholder"
                            class="player-placeholder"
                        >
                            <i data-lucide="play-circle"></i>

                            <span>
                                Loading player...
                            </span>
                        </div>


                        <iframe
                            id="movieEmbed"
                            loading="eager"
                            src=""
                            title="${escapeHtml(title)} Player"
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            allowfullscreen
                            style="display:none;"
                        ></iframe>

                    </div>

                </div>

                <!-- ======================================
     SERIES EPISODE NAVIGATION
======================================= -->

<div
    class="series-episode-nav"
    id="series-episode-nav"
    style="display:none;"
>

    <button
        type="button"
        class="episode-nav-button"
        id="prev-episode-button"
        onclick="playPreviousEpisode()"
    >
        <i data-lucide="chevron-left"></i>
        <span>Prev</span>
    </button>


    <div class="current-episode-info">

        <span class="episode-nav-label">
            NOW PLAYING
        </span>

        <strong id="current-episode-label">
            Episode 1
        </strong>

    </div>


    <button
        type="button"
        class="episode-nav-button"
        id="next-episode-button"
        onclick="playNextEpisode()"
    >
        <span>Next</span>
        <i data-lucide="chevron-right"></i>
    </button>

</div>

                <!-- ======================================
                     VIDEO SOURCES
                ======================================= -->

                <div
                    class="video-sources"
                    id="video-sources"
                >

                    <div class="sources-heading">

                        <div>
                            <span class="section-eyebrow">
                                PLAYBACK OPTIONS
                            </span>

                            <h3>Video Sources</h3>
                        </div>

                    </div>


                    <div
                        id="video-source-list"
                        class="video-source-list"
                    >
                        <div class="empty-state">
                            Loading sources...
                        </div>
                    </div>

                </div>

                <!-- ======================================
     SERIES SEASONS
======================================= -->

<section
    class="series-episodes-section"
    id="series-episodes-section"
    style="display:none;"
>

    <div class="detail-section-header">

        <span class="section-eyebrow">
            EPISODES
        </span>

        <h2>Seasons</h2>

    </div>


    <div
        class="series-season-list"
        id="series-season-list"
    ></div>


    <div
        class="series-episode-list"
        id="series-episode-list"
    ></div>

</section>

<!-- ======================================
     DOWNLOAD EPISODES
======================================= -->

<section
    class="series-download-section"
    id="series-download-section"
    style="display:none;"
>

    <div class="detail-section-header">

        <span class="section-eyebrow">
            DOWNLOAD
        </span>

        <h2>Download Episodes</h2>

    </div>


    <div
        class="series-download-list"
        id="series-download-list"
    ></div>

</section>

                <!-- ======================================
                     DOWNLOAD
                ======================================= -->

                <div class="movie-download-section">

                    <button
                        class="source-download-button"
                        id="movie-download-button"
                        onclick="downloadCurrentMovie()"
                    >
                        <i data-lucide="download"></i>
                        <span>Download</span>
                    </button>

                </div>

            </section>


            <!-- ======================================
                 MOVIE HERO / INFORMATION
            ======================================= -->

            <section class="movie-information-section">

                <div class="movie-information-inner">


                    <!-- Poster -->

                    <div class="movie-detail-poster">

                        ${
                            poster
                                ? `
                                    <img
                                        src="${escapeHtml(poster)}"
                                        alt="${escapeHtml(title)}"
                                        loading="lazy"
                                    >
                                  `
                                : `
                                    <div class="poster-placeholder">
                                        <i data-lucide="image"></i>
                                        <span>No Image</span>
                                    </div>
                                  `
                        }

                    </div>


                    <!-- Movie Info -->

                    <div class="movie-detail-info">

                        <div class="movie-detail-badge">
                            MOVIE
                        </div>


                        <h1 class="movie-detail-title">
                            ${escapeHtml(title)}
                        </h1>


                        ${
                            originalTitle !== title
                                ? `
                                    <div class="original-title">
                                        ${escapeHtml(originalTitle)}
                                    </div>
                                  `
                                : ""
                        }


                        <!-- Meta -->

                        <div class="movie-meta">

                            <span class="rating">
                                <i data-lucide="star"></i>

                                ${escapeHtml(
                                    typeof rating === "number"
                                        ? rating.toFixed(1)
                                        : String(rating)
                                )}
                            </span>


                            <span>
                                <i data-lucide="calendar"></i>
                                ${escapeHtml(String(year))}
                            </span>


                            <span>
                                <i data-lucide="clock-3"></i>
                                ${escapeHtml(runtimeText)}
                            </span>

                        </div>


                        <!-- Genres -->

                        ${
                            genreNames.length
                                ? `
                                    <div class="movie-genres">

                                        ${genreNames
                                            .map(
                                                genre => `
                                                    <span class="genre-pill">
                                                        ${escapeHtml(genre)}
                                                    </span>
                                                `
                                            )
                                            .join("")}

                                    </div>
                                  `
                                : ""
                        }


                        <!-- Description -->

                        <div class="movie-description-block">

                            <h3>Description</h3>

                            <p class="movie-description">
                                ${escapeHtml(overview)}
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            <!-- ======================================
                 MOVIE DETAILS
            ======================================= -->

            <section class="movie-extra-info">

                <div class="detail-section-header">

                    <span class="section-eyebrow">
                        INFORMATION
                    </span>

                    <h2>Movie Details</h2>

                </div>


                <div class="movie-details-grid">

                    <div class="movie-info-card">

                        <span class="info-label">
                            Original Title
                        </span>

                        <strong>
                            ${escapeHtml(originalTitle)}
                        </strong>

                    </div>


                    <div class="movie-info-card">

                        <span class="info-label">
                            Release Date
                        </span>

                        <strong>
                            ${escapeHtml(
                                releaseDate || "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="movie-info-card">

                        <span class="info-label">
                            Language
                        </span>

                        <strong>
                            ${escapeHtml(language)}
                        </strong>

                    </div>


                    <div class="movie-info-card">

                        <span class="info-label">
                            Country
                        </span>

                        <strong>
                            ${escapeHtml(countryText)}
                        </strong>

                    </div>


                    <div class="movie-info-card">

                        <span class="info-label">
                            Rating
                        </span>

                        <strong>
                            ${escapeHtml(
                                typeof rating === "number"
                                    ? rating.toFixed(1)
                                    : String(rating)
                            )}
                        </strong>

                    </div>


                    <div class="movie-info-card">

                        <span class="info-label">
                            Runtime
                        </span>

                        <strong>
                            ${escapeHtml(runtimeText)}
                        </strong>

                    </div>

                </div>

            </section>


            <!-- ======================================
                 SCREENSHOTS
            ======================================= -->

            <section
                class="screenshots-section"
                id="movie-screenshots"
            >

                <div class="detail-section-header">

                    <span class="section-eyebrow">
                        GALLERY
                    </span>

                    <h2>Screenshots</h2>

                </div>


                <div
                    class="screenshots-grid"
                    id="screenshots-grid"
                >
                    <div class="empty-state">
                        No screenshots available.
                    </div>
                </div>

            </section>

        </div>
    `;

renderMovieSources(movie);

renderMovieScreenshots(movie);

if (movie.media_type === "tv") {
    renderSeriesUI(movie);
}


    // Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }


    // ======================================
    // AUTO LOAD FIRST SOURCE
    // ======================================

    const sources = window.currentMovieSources || [];
    if (sources.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const requestedSource = Number.parseInt(params.get("source"), 10);
        const initialSource = Number.isInteger(requestedSource) && requestedSource >= 0 && requestedSource < sources.length
            ? requestedSource
            : 0;
        selectMovieSource(initialSource, false);
    }
}


// ==========================================
// Movie Sources
// ==========================================
function renderMovieSources(movie) {
    const list = document.getElementById("video-source-list");
    if (!list) return;

    const sources =
        movie?.sources ||
        movie?.videoSources ||
        movie?.servers ||
        [];

    // Always update global sources first
    window.currentMovieSources = Array.isArray(sources)
        ? sources
        : [];

    const iframe = document.getElementById("movieEmbed");
    const placeholder = document.getElementById("playerPlaceholder");

    if (window.currentMovieSources.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                No video sources available.
            </div>
        `;

        // Clear any previously playing video
        if (iframe) {
            iframe.src = "about:blank";
            iframe.style.display = "none";
        }

        if (placeholder) {
            placeholder.style.display = "flex";
            placeholder.innerHTML = `
                <i data-lucide="video-off"></i>
                <span>No video sources available.</span>
            `;
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        return;
    }

    list.innerHTML = window.currentMovieSources
        .map((source, index) => {
            const name = source.name || source.title || "Source";

            return `
                <button
                    type="button"
                    class="video-source-item ${index === 0 ? "active" : ""}"
                    onclick="selectMovieSource(${index})"
                >
                    <span class="source-name">
                        ${escapeHtml(name)}
                    </span>

                    ${
                        source.quality
                            ? `<span class="source-quality">
                                ${escapeHtml(source.quality)}
                            </span>`
                            : ""
                    }

                    <span class="source-arrow">
                        <i data-lucide="play"></i>
                    </span>
                </button>
            `;
        })
        .join("");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

// ==========================================
// Select Movie Source
// ==========================================

function selectMovieSource(
    index,
    shouldScroll = true
) {

    const sources =
        window.currentMovieSources || [];

    const source =
        sources[index];

    if (!source) return;


    const embed =
        source.embed ||
        source.url ||
        source.link ||
        "";


    if (!embed) {

        alert(
            "This source does not have a playable video."
        );

        return;
    }


    const iframe =
        document.getElementById(
            "movieEmbed"
        );

    const placeholder =
        document.getElementById(
            "playerPlaceholder"
        );


    if (!iframe) return;


    // ======================================
    // Active Source
    // ======================================

    const sourceItems =
        document.querySelectorAll(
            ".video-source-item"
        );


    sourceItems.forEach(
        (item, itemIndex) => {

            item.classList.toggle(
                "active",
                itemIndex === index
            );

        }
    );


    // Load the selected player immediately; avoid blank-frame and timer delays.
    const loadToken = (window.moviePlayerLoadToken || 0) + 1;
    window.moviePlayerLoadToken = loadToken;
    if (placeholder) {
        placeholder.style.display = "flex";
        placeholder.innerHTML = '<i data-lucide="loader-circle"></i><span>Connecting to streaming server...</span>';
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
    iframe.style.display = "block";
    iframe.onload = () => {
        if (window.moviePlayerLoadToken !== loadToken) return;
        if (placeholder) placeholder.style.display = "none";
    };
    iframe.src = embed;

    // Keep selected server in the URL so refresh restores it.
    const playerUrl = new URL(window.location.href);
    playerUrl.searchParams.set("source", String(index));
    window.history.replaceState(window.history.state || {}, "", playerUrl);


    // ======================================
    // Scroll only when user clicks source
    // ======================================

    if (shouldScroll) {

        const playerSection =
            document.getElementById(
                "movie-player-section"
            );

        if (playerSection) {

            playerSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }
}


// ==========================================
// Download Source
// ==========================================

function downloadMovieSource(index) {

    const sources =
        window.currentMovieSources || [];

    const source =
        sources[index];


    if (
        !source ||
        !source.download
    ) {

        alert(
            "Download is not available for this source."
        );

        return;
    }


    window.open(
        source.download,
        "_blank",
        "noopener,noreferrer"
    );
}


// ==========================================
// Main Download Button
// ==========================================

function downloadCurrentMovie() {

    const movie =
        window.currentMovie || {};

    const tmdbId =
        movie.tmdb_id ||
        movie.tmdbId ||
        movie.id ||
        null;

    const imdbId =
        movie.imdb_id ||
        movie.imdbId ||
        null;

    openDownloadSheet({
        type: "movie",

        tmdbId: tmdbId,

        imdbId: imdbId,

        title:
            movie.title ||
            movie.name ||
            movie.original_title ||
            "Movie"
    });
}

// =========================================================
// MOVIEBOX DOWNLOAD SHEET
// =========================================================

window.MovieBoxDownloadSheet =
    window.MovieBoxDownloadSheet || {

    context: {},

    previousOverflow: "",

    open(context = {}) {

        const sheet =
            document.getElementById(
                "downloadSheet"
            );

        if (!sheet) {
            console.warn(
                "Download sheet not found."
            );
            return;
        }

        this.context = context;

        const title =
            document.getElementById(
                "downloadSheetTitle"
            );

        const subtitle =
            document.getElementById(
                "downloadSheetSubtitle"
            );


        // ==============================
        // MOVIE
        // ==============================

        if (context.type === "movie") {

            if (title) {
                title.textContent =
                    `Download • ${context.title || "Movie"}`;
            }

            if (subtitle) {
                subtitle.textContent =
                    "Choose your preferred download option";
            }
        }


        // ==============================
        // SERIES
        // ==============================

        if (context.type === "series") {

            if (title) {
                title.textContent =
                    `Download • S${context.season} E${context.episode}`;
            }

            if (subtitle) {
                subtitle.textContent =
                    context.episodeName ||
                    context.title ||
                    "Choose your preferred download option";
            }
        }


        this.previousOverflow =
            document.body.style.overflow;


        sheet.classList.add("is-open");

        sheet.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    },


    close() {

        const sheet =
            document.getElementById(
                "downloadSheet"
            );

        if (!sheet) {
            return;
        }

        sheet.classList.remove(
            "is-open"
        );

        sheet.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            this.previousOverflow || "";

        this.previousOverflow = "";
    }
};


// =========================================================
// OPEN / CLOSE
// =========================================================

function openDownloadSheet(context = {}) {

    if (
        window.MovieBoxDownloadSheet
    ) {
        window.MovieBoxDownloadSheet.open(
            context
        );
    }
}


function closeDownloadSheet() {

    if (
        window.MovieBoxDownloadSheet
    ) {
        window.MovieBoxDownloadSheet.close();
    }
}



// ==========================================
// Screenshots
// ==========================================

function renderMovieScreenshots(movie) {

    const grid =
        document.getElementById(
            "screenshots-grid"
        );

    if (!grid) return;


    const screenshots =
        movie.screenshots ||
        movie.images ||
        [];


    if (
        !Array.isArray(screenshots) ||
        screenshots.length === 0
    ) {

        grid.innerHTML = `
            <div class="empty-state">
                No screenshots available.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        screenshots
            .map((image, index) => {

                const imageUrl =
                    typeof image === "string"
                        ? image
                        : (
                            image.url ||
                            image.file_path ||
                            image.src ||
                            ""
                        );


                if (!imageUrl) {
                    return "";
                }


                return `
                    <div class="screenshot-item">

                        <img
                            src="${escapeHtml(
                                imageUrl
                            )}"
                            alt="Screenshot ${
                                index + 1
                            }"
                            loading="lazy"
                        >

                    </div>
                `;

            })
            .join("");
}


// ==========================================
// Watch Later
// ==========================================

function addToWatchLater(movieId) {

    let watchLater =
        JSON.parse(
            localStorage.getItem(
                "moviebox_watch_later"
            ) || "[]"
        );


    if (!watchLater.includes(movieId)) {

        watchLater.push(movieId);


        localStorage.setItem(
            "moviebox_watch_later",
            JSON.stringify(watchLater)
        );


        alert(
            "Added to Watch Later."
        );

    } else {

        alert(
            "Already added to Watch Later."
        );

    }
}
function goBackFromMovie() {
    const returnPage =
        sessionStorage.getItem(
            "movieBoxReturnPage"
        );

    const returnType =
        sessionStorage.getItem(
            "movieBoxReturnType"
        );


    // ==========================================
    // FEATURED LIST
    // ==========================================

    if (
        returnPage === "featured-list"
    ) {

        sessionStorage.removeItem(
            "movieBoxReturnPage"
        );

        sessionStorage.removeItem(
            "movieBoxReturnType"
        );

        window.location.href =
            `featured-list.html?type=${encodeURIComponent(
                returnType || "animation"
            )}`;

        return;
    }


    // ==========================================
    // NEW RELEASES
    // ==========================================

    if (
        returnPage === "new-releases"
    ) {

        sessionStorage.removeItem(
            "movieBoxReturnPage"
        );

        window.location.href =
            "new-releases.html";

        return;
    }

    // ==========================================
    // STREAMING PLATFORM
    // ==========================================

    if (
        returnPage === "platform"
    ) {

        sessionStorage.removeItem(
            "movieBoxReturnPage"
        );

        navigateTo("platform");

        return;
    }

// ==========================================
    // POPULAR MOVIES
    // ==========================================

    if (
        returnPage === "popular"
    ) {

        sessionStorage.removeItem(
            "movieBoxReturnPage"
        );

        sessionStorage.removeItem(
            "movieBoxReturnType"
        );

        window.location.href =
            "popular.html";

        return;
    }

    // ==========================================
    // DEFAULT HOME
    // ==========================================

    sessionStorage.removeItem(
        "movieBoxReturnPage"
    );

    sessionStorage.removeItem(
        "movieBoxReturnType"
    );

    navigateTo("home");
}
// ==========================================
// SERIES STATE
// ==========================================

window.seriesState = {

    movie: null,

    seasons: [],

    currentSeasonIndex: 0,

    currentEpisodeIndex: 0

};


// ==========================================
// RENDER SERIES UI
// ==========================================

function renderSeriesUI(movie) {

    const nav =
        document.getElementById(
            "series-episode-nav"
        );

    const seasonSection =
        document.getElementById(
            "series-episodes-section"
        );

    const downloadSection =
        document.getElementById(
            "series-download-section"
        );


    if (!nav || !seasonSection) {
        return;
    }


    const seasons =
        Array.isArray(movie.seasons)
            ? movie.seasons
            : [];


    if (!seasons.length) {
        return;
    }


    window.seriesState = {

        movie,

        seasons,

        currentSeasonIndex: 0,

        currentEpisodeIndex: 0

    };


    // Show series UI

    nav.style.display = "flex";

    seasonSection.style.display = "block";


    if (downloadSection) {
        downloadSection.style.display = "block";
    }


    renderSeasonList();


    const firstSeason =
        seasons[0];


    if (
        firstSeason &&
        firstSeason.episodes &&
        firstSeason.episodes.length
    ) {

        renderEpisodeList(0);

        renderDownloadEpisodes(0);

    }


    updateEpisodeNavigation();


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}


// ==========================================
// SEASON LIST
// ==========================================

function renderSeasonList() {

    const list =
        document.getElementById(
            "series-season-list"
        );


    if (!list) return;


    const seasons =
        window.seriesState.seasons || [];


    list.innerHTML =
        seasons.map(
            (season, index) => {

                const count =
                    season.episode_count ||
                    season.episodes?.length ||
                    0;


                return `

                    <button
                        type="button"
                        class="series-season-row ${
                            index ===
                            window.seriesState.currentSeasonIndex
                                ? "active"
                                : ""
                        }"
                        onclick="selectSeriesSeason(${index})"
                    >

                        <span class="series-season-name">
                            ${escapeHtml(
                                season.name ||
                                `Season ${season.season_number}`
                            )}
                        </span>


                        <span class="series-season-count">
                            (EP ${count})
                        </span>

                    </button>

                `;

            }
        ).join("");


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}


// ==========================================
// SELECT SEASON
// ==========================================

function selectSeriesSeason(
    seasonIndex
) {

    const seasons =
        window.seriesState.seasons || [];


    const season =
        seasons[seasonIndex];


    if (!season) return;


    window.seriesState.currentSeasonIndex =
        seasonIndex;


    window.seriesState.currentEpisodeIndex =
        0;


    renderSeasonList();

    renderEpisodeList(seasonIndex);

    renderDownloadEpisodes(seasonIndex);

    updateEpisodeNavigation();


    const episodes =
        season.episodes || [];


    if (episodes.length) {

        playSeriesEpisode(
            seasonIndex,
            0
        );

    }

}


// ==========================================
// EPISODE LIST
// ==========================================

function renderEpisodeList(
    seasonIndex
) {

    const list =
        document.getElementById(
            "series-episode-list"
        );


    if (!list) return;


    const season =
        window.seriesState.seasons[
            seasonIndex
        ];


    if (!season) return;


    const episodes =
        season.episodes || [];


    list.innerHTML = `

        <div class="episode-list-heading">

            <span>
                ${escapeHtml(
                    season.name ||
                    `Season ${season.season_number}`
                )}
            </span>

            <small>
                ${episodes.length} Episodes
            </small>

        </div>


        <div class="episode-buttons">

            ${
                episodes.map(
                    (episode, index) => `

                        <button
                            type="button"
                            class="series-episode-button ${
                                index ===
                                window.seriesState.currentEpisodeIndex
                                    ? "active"
                                    : ""
                            }"
                            onclick="
                                playSeriesEpisode(
                                    ${seasonIndex},
                                    ${index}
                                )
                            "
                        >
                            E${episode.episode_number}
                        </button>

                    `
                ).join("")
            }

        </div>

    `;

}


// ==========================================
// DOWNLOAD EPISODES
// ==========================================

function renderDownloadEpisodes(
    seasonIndex
) {

    const list =
        document.getElementById(
            "series-download-list"
        );


    if (!list) return;


    const season =
        window.seriesState.seasons[
            seasonIndex
        ];


    if (!season) return;


    const episodes =
        season.episodes || [];


    list.innerHTML =
        episodes.map(
            (episode, index) => {

                return `

                    <div class="series-download-item">

                        <div>

                            <strong>
                                E${episode.episode_number}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    episode.name ||
                                    `Episode ${episode.episode_number}`
                                )}
                            </span>

                        </div>


                        <button
                            type="button"
                            class="episode-download-button"
                            onclick="
                                downloadSeriesEpisode(
                                    ${seasonIndex},
                                    ${index}
                                )
                            "
                        >
                            <i data-lucide="download"></i>
                            Download
                        </button>

                    </div>

                `;

            }
        ).join("");


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}



// ==========================================
// PLAY SERIES EPISODE
// ==========================================
async function playSeriesEpisode(seasonIndex, episodeIndex) {
    const state = window.seriesState;
    if (!state || !Array.isArray(state.seasons)) return;

    const season = state.seasons[seasonIndex];
    if (!season || !Array.isArray(season.episodes)) return;

    const episode = season.episodes[episodeIndex];
    if (!episode) return;

    state.currentSeasonIndex = seasonIndex;
    state.currentEpisodeIndex = episodeIndex;

    renderSeasonList();
    renderEpisodeList(seasonIndex);
    renderDownloadEpisodes(seasonIndex);
    updateEpisodeNavigation();

    const iframe = document.getElementById("movieEmbed");
    const placeholder = document.getElementById("playerPlaceholder");

    // Clear old video and show loading state
    if (iframe) {
        iframe.src = "about:blank";
        iframe.style.display = "none";
    }

    if (placeholder) {
        placeholder.style.display = "flex";
        placeholder.innerHTML = `
            <i data-lucide="loader-circle"></i>
            <span>Loading episode...</span>
        `;
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Prevent older API responses from replacing the current episode
    window.seriesSourceRequestId =
        (window.seriesSourceRequestId || 0) + 1;

    const requestId = window.seriesSourceRequestId;

    try {
        const movie = state.movie;
        const tmdbId = movie?.tmdbId || movie?.tmdb_id || movie?.id;

        if (!tmdbId) {
            throw new Error("Series ID is missing");
        }

        const response = await apiGet(
            `/sources/tv/${encodeURIComponent(tmdbId)}/${season.season_number}/${episode.episode_number}`
        );

        // Ignore outdated responses
        if (
            requestId !== window.seriesSourceRequestId ||
            window.seriesState !== state ||
            state.currentSeasonIndex !== seasonIndex ||
            state.currentEpisodeIndex !== episodeIndex
        ) {
            return;
        }

        const sources = response?.sources || response?.data || [];

        renderMovieSources({
            sources: Array.isArray(sources) ? sources : []
        });

        if (window.currentMovieSources.length > 0) {
            selectMovieSource(0, false);
        }

    } catch (error) {
        // Ignore errors from an older episode request
        if (requestId !== window.seriesSourceRequestId) return;

        console.error("Episode sources error:", error);

        window.currentMovieSources = [];

        const list = document.getElementById("video-source-list");
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    Unable to load episode sources.
                </div>
            `;
        }

        if (iframe) {
            iframe.src = "about:blank";
            iframe.style.display = "none";
        }

        if (placeholder) {
            placeholder.style.display = "flex";
            placeholder.innerHTML = `
                <i data-lucide="alert-circle"></i>
                <span>Unable to load episode sources.</span>
            `;
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    // Scroll player
    const playerSection = document.getElementById("movie-player-section");
    if (playerSection) {
        playerSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ==========================================
// PREVIOUS EPISODE
// ==========================================
function playPreviousEpisode() {
    const state = window.seriesState;

    if (!state || !Array.isArray(state.seasons) || !state.seasons.length) {
        return;
    }

    let seasonIndex = state.currentSeasonIndex;
    let episodeIndex = state.currentEpisodeIndex;

    if (episodeIndex > 0) {
        episodeIndex--;
    } else if (seasonIndex > 0) {
        seasonIndex--;

        const previousSeason = state.seasons[seasonIndex];
        const episodes = Array.isArray(previousSeason?.episodes)
            ? previousSeason.episodes
            : [];

        if (!episodes.length) {
            return;
        }

        episodeIndex = episodes.length - 1;
    } else {
        return;
    }

    playSeriesEpisode(seasonIndex, episodeIndex);
}



// ==========================================
// NEXT EPISODE
// ==========================================
function playNextEpisode() {
    const state = window.seriesState;

    if (!state || !Array.isArray(state.seasons) || !state.seasons.length) {
        return;
    }

    let seasonIndex = state.currentSeasonIndex;
    let episodeIndex = state.currentEpisodeIndex;

    const currentSeason = state.seasons[seasonIndex];
    const currentEpisodes = Array.isArray(currentSeason?.episodes)
        ? currentSeason.episodes
        : [];

    if (!currentEpisodes.length) return;

    if (episodeIndex < currentEpisodes.length - 1) {
        episodeIndex++;
    } else if (seasonIndex < state.seasons.length - 1) {
        seasonIndex++;

        const nextSeason = state.seasons[seasonIndex];
        const nextEpisodes = Array.isArray(nextSeason?.episodes)
            ? nextSeason.episodes
            : [];

        if (!nextEpisodes.length) return;

        episodeIndex = 0;
    } else {
        return;
    }

    playSeriesEpisode(seasonIndex, episodeIndex);
}

// ==========================================
// UPDATE PREV / NEXT
// ==========================================

function updateEpisodeNavigation() {

    const state =
        window.seriesState;


    const label =
        document.getElementById(
            "current-episode-label"
        );


    const prev =
        document.getElementById(
            "prev-episode-button"
        );


    const next =
        document.getElementById(
            "next-episode-button"
        );


    if (!state.seasons.length) {
        return;
    }


    const season =
        state.seasons[
            state.currentSeasonIndex
        ];


    const episode =
        season?.episodes[
            state.currentEpisodeIndex
        ];


    if (label && season && episode) {

        label.textContent =
            `S${season.season_number} • E${episode.episode_number}`;

    }


    if (prev) {

        prev.disabled =
            state.currentSeasonIndex === 0 &&
            state.currentEpisodeIndex === 0;

    }


    const lastSeasonIndex =
        state.seasons.length - 1;


    const lastSeason =
        state.seasons[
            lastSeasonIndex
        ];


    const isLastEpisode =
        state.currentSeasonIndex ===
            lastSeasonIndex &&
        state.currentEpisodeIndex ===
            lastSeason.episodes.length - 1;


    if (next) {
        next.disabled = isLastEpisode;
    }

}


// ==========================================
// DOWNLOAD SINGLE EPISODE
// ==========================================
function downloadSeriesEpisode(
    seasonIndex,
    episodeIndex
) {

    const state =
        window.seriesState || {};

    const season =
        state.seasons?.[seasonIndex];

    const episode =
        season?.episodes?.[episodeIndex];

    const movie =
        state.movie ||
        window.currentMovie ||
        {};


    if (!season || !episode) {
        return;
    }


    const tmdbId =
        movie.tmdb_id ||
        movie.tmdbId ||
        movie.id ||
        null;


    const imdbId =
        movie.imdb_id ||
        movie.imdbId ||
        null;


    const seasonNumber =
        season.season_number ??
        seasonIndex + 1;


    const episodeNumber =
        episode.episode_number ??
        episodeIndex + 1;


    openDownloadSheet({

        type: "series",

        tmdbId: tmdbId,

        imdbId: imdbId,

        season: seasonNumber,

        episode: episodeNumber,

        title:
            movie.title ||
            movie.name ||
            "Series",

        episodeName:
            episode.name ||
            `Episode ${episodeNumber}`
    });
}
