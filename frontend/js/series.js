// ==========================================
// MovieBox - Premium Series Page
// ==========================================

let currentSeries = null;
let currentSeason = 1;
let currentEpisodeIndex = 0;
let currentEpisodes = [];
let currentSources = [];
let currentSourceIndex = 0;



// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadSeriesPage
);

function showSeriesLoading(container) {
    if (!container) return;

    if (container.querySelector(".series-detail-loading")) {
        return;
    }

    container.insertAdjacentHTML(
        "afterbegin",
        `
        <div
            class="series-detail-loading"
            role="progressbar"
            aria-label="Loading series"
        >
            <span></span>
        </div>
        `
    );
}
// ==========================================
// LOAD SERIES
// ==========================================

async function loadSeriesPage() {

    const container =
        document.getElementById(
            "series-detail-content"
        );
if (!container) return;

showSeriesLoading(container);
    const params =
        new URLSearchParams(
            window.location.search
        );

    const seriesId =
        params.get("series");


    if (!seriesId) {

        errorSeries(
            "Series ID is missing."
        );

        return;
    }


    try {

        const response =
            await apiGet(
                `/movies/tv/${encodeURIComponent(seriesId)}`
            );


        const series =
            response?.series ||
            response?.tv ||
            response?.data ||
            response;


        if (
            !series ||
            !series.id ||
            series.media_type === "movie"
        ) {

            throw new Error(
                "Series not found"
            );

        }


        currentSeries = series;

        if (window.MovieBoxSEO) {
            window.MovieBoxSEO.applyMovieSeo(series, "tv");
        }

        const requestedSource = Number.parseInt(params.get("source"), 10);
        currentSourceIndex = Number.isInteger(requestedSource) && requestedSource >= 0 ? requestedSource : 0;

        renderSeries(
            series
        );


        buildSeasonSelector();


    } catch (error) {

        console.error(
            "Series loading error:",
            error
        );


        errorSeries(
            "We could not load this series right now."
        );

    }

}


// ==========================================
// RENDER SERIES PAGE
// ==========================================

function renderSeries(series) {

    const container =
        document.getElementById(
            "series-detail-content"
        );


    if (!container) {
        return;
    }


    const title =
        series.title ||
        series.name ||
        "Untitled Series";


    const poster =
        series.poster ||
        "";


    const backdrop =
        series.backdrop ||
        poster;


    const rating =
        series.rating ??
        "N/A";


    const releaseDate =
        series.release_date ||
        series.first_air_date ||
        "";


    const language =
        series.original_language ||
        series.language ||
        "N/A";


    const totalSeasons =
        Number(
            series.number_of_seasons
        ) || 1;


    container.innerHTML = `

        <div class="series-page">


            <!-- Reserved display ad slot: add ad provider code here later -->
            <div class="ad-slot ad-slot--banner" id="ad-slot-series-player" data-ad-slot="series-player" aria-label="Reserved advertisement space">Ad space reserved</div>

            <!-- ==================================
                 PLAYER
            ================================== -->

            <section
                class="series-player"
                id="series-player-section"
            >

                <div class="series-frame">

                    <div
                        id="series-placeholder"
                        class="series-player-placeholder"
                    >

                        <i data-lucide="play-circle"></i>

                        <span>
                            Select an episode
                        </span>

                    </div>


                    <iframe
                        id="series-iframe"
                        loading="eager"
                        src=""
                        title="${escapeHtml(title)} Player"
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowfullscreen
                    ></iframe>

                </div>

            </section>


            <!-- ==================================
                 PREV / CURRENT / NEXT
            ================================== -->

            <section class="series-nav">

                <button
                    id="prev"
                    onclick="prevEpisode()"
                >

                    <i data-lucide="chevron-left"></i>

                    <span>Prev</span>

                </button>


                <div class="series-now-playing">

                    <small>
                        NOW PLAYING
                    </small>

                    <strong id="playing">
                        S1 • E1
                    </strong>

                </div>


                <button
                    id="next"
                    onclick="nextEpisode()"
                >

                    <span>Next</span>

                    <i data-lucide="chevron-right"></i>

                </button>

            </section>


            <!-- ==================================
                 VIDEO SOURCES
            ================================== -->

            <section class="section">

                <div class="eyebrow">
                    PLAYBACK OPTIONS
                </div>

                <h2>
                    Video Sources
                </h2>


                <div
                    id="sources"
                    class="source-grid"
                >

                    <div class="series-empty">

                        Select an episode.

                    </div>

                </div>

            </section>


            <!-- ==================================
                 DOWNLOAD & WATCH EPISODE
            ================================== -->

            <section class="section">

                <div class="download-head">

                    <div>

                        <div class="eyebrow">
                            EPISODES
                        </div>

                        <h2>
                            Download & Watch Episode
                        </h2>

                    </div>


                    <!-- SINGLE SEASON DROPDOWN -->

                    <select
                        id="season-select"
                        onchange="changeSeason(this.value)"
                    >

                    </select>

                </div>


                <div
                    id="downloads"
                    class="downloads"
                >

                    <div class="series-empty">

                        Loading episodes...

                    </div>

                </div>

            </section>


            <!-- ==================================
                 SERIES HERO / INFO
            ================================== -->

            <section class="section">

                <div
                    class="series-info"
                    style="
                        background-image:
                        linear-gradient(
                            90deg,
                            #070709 15%,
                            rgba(7,7,9,.80)
                        ),
                        url('${escapeHtml(backdrop)}')
                    "
                >

                    <div>

                        ${
                            poster
                                ? `
                                    <img
                                        src="${escapeHtml(poster)}"
                                        class="poster"
                                        alt="${escapeHtml(title)}"
                                    >
                                  `
                                : ""
                        }

                    </div>


                    <div>

                        <b class="type">
                            TV SERIES
                        </b>


                        <h1>
                            ${escapeHtml(title)}
                        </h1>


                        <div class="meta">

                            <span>
                                ★ ${escapeHtml(rating)}
                            </span>

                            <span>
                                ${escapeHtml(
                                    releaseDate
                                        ? releaseDate.substring(0, 4)
                                        : "N/A"
                                )}
                            </span>

                            <span>
                                ${escapeHtml(language)}
                            </span>

                        </div>


                        <p>
                            ${escapeHtml(
                                series.overview ||
                                "No description available."
                            )}
                        </p>

                    </div>

                </div>

            </section>


            <!-- ==================================
                 SERIES DETAILS
            ================================== -->

            <section class="section">

                <div class="eyebrow">
                    INFORMATION
                </div>

                <h2>
                    Series Details
                </h2>


                <div class="details">

                    <div>

                        <small>
                            Original Title
                        </small>

                        <b>
                            ${escapeHtml(
                                series.original_title ||
                                title
                            )}
                        </b>

                    </div>


                    <div>

                        <small>
                            First Air Date
                        </small>

                        <b>
                            ${escapeHtml(
                                releaseDate ||
                                "N/A"
                            )}
                        </b>

                    </div>


                    <div>

                        <small>
                            Seasons
                        </small>

                        <b>
                            ${totalSeasons}
                        </b>

                    </div>


                    <div>

                        <small>
                            Episodes
                        </small>

                        <b>
                            ${escapeHtml(
                                series.number_of_episodes ||
                                "N/A"
                            )}
                        </b>

                    </div>


                    <div>

                        <small>
                            Language
                        </small>

                        <b>
                            ${escapeHtml(language)}
                        </b>

                    </div>


                    <div>

                        <small>
                            Rating
                        </small>

                        <b>
                            ${escapeHtml(rating)}
                        </b>

                    </div>

                </div>

            </section>


        </div>

    `;


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ==========================================
// SEASON DROPDOWN
// ==========================================

function buildSeasonSelector() {

    const select =
        document.getElementById(
            "season-select"
        );


    if (!select) {
        return;
    }


    const seasons =
        Array.isArray(
            currentSeries?.seasons
        )
            ? currentSeries.seasons
                .filter(
                    season =>
                        Number(
                            season.season_number
                        ) > 0
                )
            : [];


    if (seasons.length === 0) {

        const total =
            Number(
                currentSeries?.number_of_seasons
            ) || 1;


        let html = "";


        for (
            let i = 1;
            i <= total;
            i++
        ) {

            html += `
                <option value="${i}">
                    Season ${i}
                </option>
            `;

        }


        select.innerHTML = html;

    } else {

        select.innerHTML =
            seasons
                .map(
                    season => `
                        <option
                            value="${Number(
                                season.season_number
                            )}"
                        >
                            Season ${Number(
                                season.season_number
                            )}
                        </option>
                    `
                )
                .join("");

    }


    select.value =
        String(currentSeason);


    loadSeason(
        currentSeason
    );

}


// ==========================================
// CHANGE SEASON
// ==========================================

async function changeSeason(
    season
) {

    currentSeason =
        Number(season) || 1;


    currentEpisodeIndex = 0;


    const select =
        document.getElementById(
            "season-select"
        );


    if (select) {

        select.value =
            String(currentSeason);

    }


    await loadSeason(
        currentSeason
    );

}


// ==========================================
// LOAD SEASON EPISODES
// ==========================================

async function loadSeason(
    season
) {

    const container =
        document.getElementById(
            "downloads"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="series-empty">

            Loading episodes...

        </div>

    `;


    try {

        /*
         * IMPORTANT:
         * New TV endpoint
         */

        const response =
            await apiGet(
                `/movies/tv/${encodeURIComponent(
                    currentSeries.id
                )}/season/${season}`
            );


        currentEpisodes =
            response?.episodes ||
            response?.season?.episodes ||
            [];


        renderEpisodeCards();


        if (
            currentEpisodes.length > 0
        ) {

            await playEpisode(
                0,
                false
            );

        }


    } catch (error) {

        console.error(
            "Season loading error:",
            error
        );


        container.innerHTML = `

            <div class="series-empty">

                Episodes unavailable.

            </div>

        `;

    }

}


// ==========================================
// EPISODE CARDS
// ==========================================

function renderEpisodeCards() {

    const container =
        document.getElementById(
            "downloads"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(
            currentEpisodes
        ) ||
        currentEpisodes.length === 0
    ) {

        container.innerHTML = `

            <div class="series-empty">

                No episodes available.

            </div>

        `;

        return;

    }


    container.innerHTML =
        currentEpisodes
            .map(
                (episode, index) => {

                    const number =
                        Number(
                            episode.episode_number
                        ) ||
                        index + 1;


                    const name =
                        episode.name ||
                        `Episode ${number}`;


                    /*
                     * Backend returns still_path
                     */

                    const image =
                        episode.still_path ||
                        episode.still ||
                        episode.image ||
                        "";


                    const description =
                        episode.overview ||
                        "No episode description available.";


                    const airDate =
                        episode.air_date ||
                        "";


                    const runtime =
                        episode.runtime ||
                        "";


                    return `

                        <article
                            class="
                                download-card
                                ${
                                    index === currentEpisodeIndex
                                        ? "active"
                                        : ""
                                }
                            "
                            onclick="
                                playEpisode(${index})
                            "
                        >


                            <!-- EPISODE IMAGE -->

                            <div class="still">

                                ${
                                    image
                                        ? `
                                            <img
                                                src="${escapeHtml(image)}"
                                                alt="Episode ${number}"
                                                loading="lazy"
                                            >
                                          `
                                        : `
                                            <div class="episode-image-placeholder">
                                                <i data-lucide="image"></i>
                                            </div>
                                          `
                                }


                                <div class="episode-number-overlay">

                                    E${number}

                                </div>

                            </div>


                            <!-- EPISODE INFO -->

                            <div class="download-info">


                                <div class="title-row">

                                    <h3>

                                        ${escapeHtml(
                                            name
                                        )}

                                    </h3>

                                </div>


                                <small>

                                    ${escapeHtml(
                                        airDate
                                    )}

                                    ${
                                        airDate &&
                                        runtime
                                            ? " • "
                                            : ""
                                    }

                                    ${
                                        runtime
                                            ? `${escapeHtml(
                                                runtime
                                            )}m`
                                            : ""
                                    }

                                </small>


                                <p>

                                    ${escapeHtml(
                                        description
                                    )}

                                </p>


                                <!-- DOWNLOAD ONLY -->

                                <button
                                    type="button"
                                    class="episode-download-button"
                                    onclick="
                                        event.stopPropagation();
                                        downloadEpisode(${index});
                                    "
                                >

                                    <i
                                        data-lucide="download"
                                    ></i>

                                    <span>
                                        Download
                                    </span>

                                </button>


                            </div>


                        </article>

                    `;

                }
            )
            .join("");


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ==========================================
// PLAY EPISODE
// ==========================================

async function playEpisode(
    index,
    scroll = true
) {

    const episode =
        currentEpisodes[index];


    if (!episode) {
        return;
    }


    currentEpisodeIndex =
        index;


    const number =
        Number(
            episode.episode_number
        ) ||
        index + 1;


    const playing =
        document.getElementById(
            "playing"
        );


    if (playing) {

        playing.textContent =
            `S${currentSeason} • E${number}`;

    }


    updateNavigation();


    renderEpisodeCards();


    /*
     * Load video sources
     */

    await loadSources(
        currentSeries.tmdbId ||
        currentSeries.id,
        currentSeason,
        number,
        scroll
    );

}

// ==========================================
// LOAD VIDEO SOURCES
// ==========================================

async function loadSources(
    tmdbId,
    season,
    episode,
    scroll = true
) {

    const list =
        document.getElementById("sources");

    if (!list) {
        return;
    }

    const requestId = (window.seriesSourcesRequestId || 0) + 1;
    window.seriesSourcesRequestId = requestId;
    currentSources = [];
    const iframe = document.getElementById("series-iframe");
    const placeholder = document.getElementById("series-placeholder");
    if (iframe) {
        iframe.onload = null;
        iframe.removeAttribute("src");
        iframe.style.display = "none";
    }
    if (placeholder) {
        placeholder.style.display = "flex";
        placeholder.innerHTML = '<i data-lucide="play-circle"></i><span>Choose a streaming server</span>';
    }
    list.innerHTML = `
        <div class="series-empty">
            Loading video sources...
        </div>
    `;

    /*
     * ======================================
     * 1. TRY BACKEND SOURCE API
     * ======================================
     */

    try {

        const response =
            await apiGet(
                `/sources/tv/${encodeURIComponent(
                    tmdbId
                )}/${season}/${episode}`
            );

        const backendSources =
            response?.sources ||
            response?.data?.sources ||
            response?.data ||
            [];

        if (
            Array.isArray(backendSources) &&
            backendSources.length > 0
        ) {

            currentSources =
                backendSources;

        }

    } catch (error) {

        console.warn(
            "Backend TV sources failed, using direct sources:",
            error
        );

    }


    // Ignore stale API responses when the user changes episode quickly.
    if (window.seriesSourcesRequestId !== requestId) return;

    /*
     * ======================================
     * 2. FALLBACK TV SOURCES
     * ======================================
     */

    if (
        !Array.isArray(currentSources) ||
        currentSources.length === 0
    ) {

        currentSources = [

            {
                name: "Screenscape",
                quality: "HD",

                embed:
                    `https://nxsha.screenscape.me/embed?tmdb=${encodeURIComponent(
                        tmdbId
                    )}&type=tv&s=${season}&e=${episode}&lan=eng`,

                download: ""
            },


            {
                name: "Filmu movie",
                quality: "HD",

                embed:
                    `https://embed.filmu.in/tv/${encodeURIComponent(
                        tmdbId
                    )}/${season}/${episode}`,

                download: ""
            },


            {
                name: "NHD Player",
                quality: "HD",

                embed:
                    `https://nhdapi.com/tv/${encodeURIComponent(
                        tmdbId
                    )}/${season}/${episode}`,

                download: ""
            },


            {
                name: "Stream EMD",
                quality: "HD",

                embed:
                    `https://watch.embed-api.stream/embed/tv/${encodeURIComponent(
                        tmdbId
                    )}/${season}/${episode}`,

                download: ""
            },


            {
                name: "Nex Stream",
                quality: "HD",

                embed:
                    `https://api.codespecters.com/embed/tv/${encodeURIComponent(
                        tmdbId
                    )}/${season}/${episode}?apikey=DEMO_36c097f0`,

                download: ""
            }

        ];

    }


    /*
     * ======================================
     * 3. STILL NOTHING?
     * ======================================
     */

    if (
        !Array.isArray(currentSources) ||
        currentSources.length === 0
    ) {

        list.innerHTML = `
            <div class="series-empty">
                No video sources available.
            </div>
        `;

        return;
    }


    /*
     * ======================================
     * 4. RENDER SOURCE BUTTONS
     * ======================================
     */

    list.innerHTML =
        currentSources
            .map(
                (source, index) => {

                    const name =
                        source.name ||
                        source.title ||
                        `Source ${index + 1}`;

                    return `

                        <button
                            type="button"
                            class="
    source-btn
    ${
        index === currentSourceIndex
            ? "active"
            : ""
    }
"
                            onclick="
                                selectSource(${index})
                            "
                        >

                            <span>
                                ${escapeHtml(name)}
                            </span>

                            ${
                                source.quality
                                    ? `
                                        <small>
                                            ${escapeHtml(
                                                source.quality
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                            <i
                                data-lucide="play"
                            ></i>

                        </button>

                    `;

                }
            )
            .join("");


    /*
     * ======================================
     * 5. LUCIDE ICONS
     * ======================================
     */

    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

/*
 * ======================================
 * 6. KEEP CURRENT SOURCE
 * ======================================
 */

if (currentSourceIndex >= currentSources.length) {
    currentSourceIndex = 0;
}

selectSource(
    currentSourceIndex,
    scroll
);

}
// ==========================================
// SELECT SOURCE
// ==========================================

function selectSource(
    index,
    scroll = true
) {

    const source =
        currentSources[index];

    if (!source) {
        return;
    }

    // Remember selected source
    currentSourceIndex = index;
    if (!source) {
        return;
    }


    const url =
        source.embed ||
        source.url ||
        source.link ||
        "";


    if (!url) {

        console.warn(
            "TV source URL missing:",
            source
        );

        return;

    }


    const iframe =
        document.getElementById(
            "series-iframe"
        );


    const placeholder =
        document.getElementById(
            "series-placeholder"
        );


    if (!iframe) {

        console.error(
            "series-iframe not found"
        );

        return;

    }


    /*
     * Active source button
     */

    document
        .querySelectorAll(
            ".source-btn"
        )
        .forEach(
            (button, buttonIndex) => {

                button.classList.toggle(
                    "active",
                    buttonIndex === index
                );

            }
        );


    // Start the chosen source immediately and keep a loading state until iframe load.
    const loadToken = (window.seriesPlayerLoadToken || 0) + 1;
    window.seriesPlayerLoadToken = loadToken;
    if (placeholder) {
        placeholder.style.display = "flex";
        placeholder.innerHTML = '<i data-lucide="loader-circle"></i><span>Connecting to streaming server...</span>';
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
    iframe.style.display = "block";
    iframe.onload = () => {
        if (window.seriesPlayerLoadToken !== loadToken) return;
        if (placeholder) placeholder.style.display = "none";
    };
    iframe.src = url;

    const playerUrl = new URL(window.location.href);
    playerUrl.searchParams.set("source", String(index));
    window.history.replaceState(window.history.state || {}, "", playerUrl);


    /*
     * Scroll player only when needed
     */

   

}
// ==========================================
// PREVIOUS EPISODE
// ==========================================

function prevEpisode() {

    if (
        currentEpisodeIndex <= 0
    ) {
        return;
    }


    playEpisode(
        currentEpisodeIndex - 1
    );

}


// ==========================================
// NEXT EPISODE
// ==========================================

function nextEpisode() {

    if (
        currentEpisodeIndex >=
        currentEpisodes.length - 1
    ) {

        return;

    }


    playEpisode(
        currentEpisodeIndex + 1
    );

}


// ==========================================
// NAVIGATION STATE
// ==========================================

function updateNavigation() {

    const prev =
        document.getElementById(
            "prev"
        );


    const next =
        document.getElementById(
            "next"
        );


    if (prev) {

        prev.disabled =
            currentEpisodeIndex <= 0;

    }


    if (next) {

        next.disabled =
            currentEpisodeIndex >=
            currentEpisodes.length - 1;

    }

}

// ==========================================
// DOWNLOAD EPISODE
// ==========================================

function downloadEpisode(
    index
) {

    const episode =
        currentEpisodes[index];

    if (!episode) {
        return;
    }


    const tmdbId =
        currentSeries?.tmdb_id ||
        currentSeries?.tmdbId ||
        currentSeries?.id ||
        null;


    const imdbId =
        currentSeries?.imdb_id ||
        currentSeries?.imdbId ||
        null;


    const episodeNumber =
        Number(
            episode.episode_number
        ) ||
        index + 1;


    const episodeName =
        episode.name ||
        `Episode ${episodeNumber}`;


    console.log(
        "SERIES DOWNLOAD CLICK",
        {
            tmdbId,
            imdbId,
            season: currentSeason,
            episode: episodeNumber
        }
    );


    openDownloadSheet({

        type: "series",

        tmdbId:
            tmdbId,

        imdbId:
            imdbId,

        season:
            currentSeason,

        episode:
            episodeNumber,

        title:
            currentSeries?.title ||
            currentSeries?.name ||
            "Series",

        episodeName:
            episodeName

    });

}
function goBackSeries() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const from =
        params.get("from");

    const type =
        params.get("type");


    // ==========================================
    // FEATURED LIST
    // ==========================================

    if (
        from === "featured-list"
    ) {

        window.location.href =
            `featured-list.html?type=${encodeURIComponent(
                type || "animation"
            )}`;

        return;
    }

// ==========================================
    // TRENDING TV
    // ==========================================

    if (
        from === "trending-tv"
    ) {

        window.location.href =
            "trending-tv.html";

        return;
    }


    // ==========================================
    // DEFAULT
    // ==========================================

    window.location.href =
        "index.html";
}


// ==========================================
// ERROR
// ==========================================

function errorSeries(
    message
) {

    const container =
        document.getElementById(
            "series-detail-content"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="series-error">

            <h2>
                Series not found
            </h2>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                onclick="goBackSeries()"
            >
                Back
            </button>

        </div>

    `;

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}