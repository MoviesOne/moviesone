/* =========================================
   MOVIEBOX APP
========================================= */


/* =========================================
   HIDE HOME DURING DIRECT MOVIE OPEN
========================================= */

(function hideHomeForDirectOpen() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const movieId =
        params.get("movie");

    const tvId =
        params.get("tv");

    if (!movieId && !tvId) {
        return;
    }

    const homeScreen =
        document.getElementById(
            "home-screen"
        );

    if (homeScreen) {
        homeScreen.classList.add("hidden");
    }

})();


/* =========================================
   INITIALIZE APP
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("MovieBox frontend started.");

    initializeIcons();
    setupSearch();


    // =========================================
    // DIRECT MOVIE / SERIES OPEN
    // =========================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const movieId =
        params.get("movie");


    const tvId =
        params.get("tv");


    const from =
        params.get("from") || "home";

        const returnType =
    params.get("type") || "";

    // =========================================
    // MOVIE
    // =========================================

   if (movieId) {

    console.log(
        "MovieBox: Direct movie open",
        movieId
    );

    sessionStorage.setItem(
        "movieBoxReturnPage",
        from
    );

sessionStorage.setItem(
    "movieBoxReturnType",
    returnType
);

    setTimeout(() => {

        openMovie(
            movieId,
            "movie",
            from
        );

    }, 0);

    return;
}


    // =========================================
    // TV SERIES
    // =========================================

 if (tvId) {

    console.log(
        "MovieBox: Direct series open",
        tvId
    );

    sessionStorage.setItem(
        "movieBoxReturnPage",
        from
    );

    setTimeout(() => {

        openMovie(
            tvId,
            "tv",
            from
        );

    }, 0);

    return;
}

    const requestedPlatform = params.get("platform");
    if (params.get("screen") === "platform" && requestedPlatform && PLATFORM_INFO[requestedPlatform]) {
        openPlatform(requestedPlatform, false);
        return;
    }
});

/* =========================================
   LUCIDE ICONS
========================================= */

function initializeIcons() {

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}


/* =========================================
   SIDEBAR
========================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebar-overlay");


    if (!sidebar || !overlay) {
        return;
    }


    const isClosed =
        sidebar.classList.contains("-translate-x-full");


    if (isClosed) {

        sidebar.classList.remove("-translate-x-full");

        overlay.classList.remove("hidden");

    } else {

        sidebar.classList.add("-translate-x-full");

        overlay.classList.add("hidden");

    }

}


/* =========================================
   CLOSE SIDEBAR
========================================= */

function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebar-overlay");


    if (sidebar) {
        sidebar.classList.add("-translate-x-full");
    }

    if (overlay) {
        overlay.classList.add("hidden");
    }

}


/* =========================================
   NAVIGATION
========================================= */

function navigateTo(screen) {

    closeSidebar();

const screens = [
    "home",
    "movie",
    "tv",
    "search",
    "movies",
    "tv-shows",
    "ads",
    "platform",
    "legal",
    "about",
    "help"
];


    screens.forEach(name => {

        const element =
            document.getElementById(
                `${name}-screen`
            );

        if (!element) {
            return;
        }

        element.classList.add("hidden");

    });


    let targetId;


    switch (screen) {

        case "home":
            targetId = "home-screen";
            break;

        case "movie":
            targetId = "movie-screen";
            break;

        case "tv":
            targetId = "tv-screen";
            break;

        case "search":
            targetId = "search-screen";
            break;

        case "movies":
            targetId = "movies-screen";
            break;

        case "tv-shows":
            targetId = "tv-shows-screen";
            break;


        case "ads":
            targetId = "ads-screen";
            break;

case "legal":
    targetId = "legal-screen";
    break;

case "about":
    targetId = "about-screen";
    break;

case "help":
    targetId = "help-screen";
    break;

            case "platform":
    targetId = "platform-screen";
    break;

        default:
            targetId = "home-screen";

    }


    const target =
        document.getElementById(targetId);


    if (target) {
        target.classList.remove("hidden");
    }


   
if (screen === "movie") {
    window.scrollTo(0, 0);
} else {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}




    initializeIcons();


   // Load appropriate content
if (screen === "home") {
    if (typeof initHome === "function") {
        initHome();
    }
}

if (screen === "movies") {
    if (typeof initMovies === "function") {
        initMovies();
    }
}

if (screen === "tv-shows") {
    if (typeof initTVShows === "function") {
        initTVShows();
    }
}

}

/* =========================================
   BROWSER BACK / FORWARD NAVIGATION
========================================= */

window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("movie");
    const from =
        params.get("from") ||
        sessionStorage.getItem("movieBoxReturnPage") ||
        "home";

    if (movieId) {
        navigateTo("movie");

        if (typeof loadMovieDetails === "function") {
            loadMovieDetails(movieId, "movie");
        }

        return;
    }

    const platform = params.get("platform");
    if (params.get("screen") === "platform" && platform && PLATFORM_INFO[platform]) {
        openPlatform(platform, false);
        return;
    }

    navigateTo(from);
});
/* =========================================
   OPEN MOVIE / SERIES
========================================= */

function openMovie(
    movieId,
    mediaType = "movie",
    returnPage = "home"
) {

    if (
        movieId === null ||
        movieId === undefined ||
        String(movieId).trim() === ""
    ) {
        console.warn(
            "MovieBox: ID is missing."
        );

        return;
    }


    const id =
        String(movieId).trim();


    const type =
        String(
            mediaType || "movie"
        ).toLowerCase();


    const returnTo =
        String(
            returnPage || "home"
        ).toLowerCase();


    console.log(
        "MovieBox opening:",
        {
            id,
            mediaType: type,
            returnPage: returnTo
        }
    );


    /* =========================================
       TV SERIES
    ========================================= */

    if (
        type === "tv" ||
        type === "series"
    ) {

        sessionStorage.setItem(
            "movieBoxReturnPage",
            returnTo
        );


        window.location.href =
            `series.html?series=${encodeURIComponent(id)}&from=${encodeURIComponent(returnTo)}`;


        return;
    }


    /* =========================================
       MOVIE
    ========================================= */

    sessionStorage.setItem(
        "movieBoxReturnPage",
        returnTo
    );
const url = new URL(window.location.href);

url.searchParams.set("movie", id);
url.searchParams.set("from", returnTo);
url.searchParams.set("type", "movie");

const currentParams = new URLSearchParams(window.location.search);

if (currentParams.get("movie") === id) {
    window.history.replaceState({}, "", url);
} else {
    window.history.pushState({}, "", url);
}

    navigateTo("movie");


    if (
        typeof loadMovieDetails === "function"
    ) {

        loadMovieDetails(
            id,
            "movie"
        );

    } else {

        console.error(
            "MovieBox: loadMovieDetails() is not available."
        );

    }

}
/* =========================================
   SEARCH OVERLAY
========================================= */

let movieBoxSearchResults = [];


/* =========================================
   SETUP SEARCH
========================================= */

function setupSearch() {

    const globalInput =
        document.getElementById(
            "global-search"
        );

    const pageInput =
        document.getElementById(
            "search-page-input"
        );


    /* -------------------------------------
       HEADER SEARCH BAR
    ------------------------------------- */

    if (globalInput) {

        globalInput.addEventListener(
            "focus",
            () => {

                openSearchScreen();

            }
        );


        globalInput.addEventListener(
            "click",
            () => {

                openSearchScreen();

            }
        );

    }


    /* -------------------------------------
       OVERLAY SEARCH INPUT
    ------------------------------------- */

    if (!pageInput) {
        return;
    }


    let searchTimer;


    pageInput.addEventListener(
        "input",
        event => {

            const query =
                event.target.value.trim();


            clearTimeout(
                searchTimer
            );


            if (!query) {

                showSearchEmptyState();

                return;

            }


            searchTimer =
                setTimeout(
                    () => {

                        performSearch(
                            query
                        );

                    },
                    400
                );

        }
    );


    pageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {
                return;
            }


            const query =
                pageInput.value.trim();


            if (!query) {
                return;
            }


            performSearch(
                query
            );

        }
    );

}


/* =========================================
   OPEN SEARCH OVERLAY
========================================= */

function openSearchScreen() {

    const searchScreen =
        document.getElementById(
            "search-screen"
        );


    if (!searchScreen) {
        return;
    }


    /*
       Save current search text
       before opening overlay.
    */

    const globalInput =
        document.getElementById(
            "global-search"
        );

    const pageInput =
        document.getElementById(
            "search-page-input"
        );


    if (pageInput) {

        pageInput.value =
            globalInput
                ? globalInput.value
                : "";

    }


    /*
       Show overlay.
    */

    searchScreen.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "search-open"
    );


    /*
       Focus search input.
    */

    setTimeout(() => {

        if (pageInput) {

            pageInput.focus();

            pageInput.select();

        }

    }, 80);


    initializeIcons();

}


/* =========================================
   CLOSE SEARCH OVERLAY
========================================= */

function closeSearchScreen() {

    const searchScreen =
        document.getElementById(
            "search-screen"
        );


    if (searchScreen) {

        searchScreen.classList.add(
            "hidden"
        );

    }


    document.body.classList.remove(
        "search-open"
    );


    const globalInput =
        document.getElementById(
            "global-search"
        );

    const pageInput =
        document.getElementById(
            "search-page-input"
        );


    if (globalInput) {

        globalInput.value = "";

    }


    if (pageInput) {

        pageInput.value = "";

    }


    movieBoxSearchResults = [];


    showSearchEmptyState();

}


/* =========================================
   PERFORM SEARCH
========================================= */

async function performSearch(
    query
) {

    const cleanQuery =
        String(
            query || ""
        ).trim();


    if (!cleanQuery) {
        return;
    }


    /*
       Make sure overlay is open.
    */

    const searchScreen =
        document.getElementById(
            "search-screen"
        );


    if (
        searchScreen &&
        searchScreen.classList.contains(
            "hidden"
        )
    ) {

        openSearchScreen();

    }


    /*
       Sync both inputs.
    */

    syncSearchInputs(
        cleanQuery
    );


    const results =
        document.getElementById(
            "search-results"
        );


    if (!results) {
        return;
    }


    /*
       Loading state.
    */

    results.innerHTML = `

        <div class="search-loading-state">

            <div class="search-loader"></div>

            <span>
                Searching for
                <strong>
                    ${escapeHtml(cleanQuery)}
                </strong>
            </span>

        </div>

    `;


    try {

        const data =
            await apiGet(
                `/movies/search?query=${encodeURIComponent(
                    cleanQuery
                )}`
            );


        const movies =
            normalizeMoviesResponse(
                data
            );


        movieBoxSearchResults =
            Array.isArray(movies)
                ? movies
                : [];


        if (
            movieBoxSearchResults.length
            === 0
        ) {

            results.innerHTML = `

                <div class="search-empty-state">

                    <i data-lucide="search-x"></i>

                    <strong>
                        No results found
                    </strong>

                    <span>
                        Try another movie or series name.
                    </span>

                </div>

            `;


            initializeIcons();

            return;

        }


        renderSearchResults();


    } catch (error) {

        console.error(
            "MovieBox search failed:",
            error
        );


        results.innerHTML = `

            <div class="search-error-state">

                <i data-lucide="triangle-alert"></i>

                <strong>
                    Search is currently unavailable.
                </strong>

                <span>
                    Please try again.
                </span>

            </div>

        `;


        initializeIcons();

    }

}


/* =========================================
   SYNC SEARCH INPUTS
========================================= */

function syncSearchInputs(
    query
) {

    const globalInput =
        document.getElementById(
            "global-search"
        );

    const pageInput =
        document.getElementById(
            "search-page-input"
        );


    if (globalInput) {

        globalInput.value =
            query;

    }


    if (pageInput) {

        pageInput.value =
            query;

    }

}


/* =========================================
   RENDER SEARCH RESULTS
========================================= */

function renderSearchResults() {

    const results =
        document.getElementById(
            "search-results"
        );


    if (!results) {
        return;
    }


    const movies =
        Array.isArray(
            movieBoxSearchResults
        )
            ? movieBoxSearchResults
            : [];


    results.innerHTML = `

        <div class="search-results-list">

            ${movies
                .map(
                    (
                        movie,
                        index
                    ) =>
                        createSearchResultItem(
                            movie,
                            index
                        )
                )
                .join("")}

        </div>

    `;


    initializeIcons();

}


/* =========================================
   CREATE SEARCH RESULT
========================================= */

function createSearchResultItem(
    movie,
    index
) {

    const id =
        movie.id
        ?? movie.tmdbId
        ?? "";


    const title =
        movie.title
        || movie.name
        || movie.original_title
        || movie.original_name
        || "Unknown Title";


    const poster =
        movie.poster
        || movie.poster_path
        || "";


    const rating =
        Number(
            movie.rating
            ?? movie.vote_average
            ?? 0
        );


    const mediaType =
        String(
            movie.media_type
            || movie.mediaType
            || (
                movie.name
                    ? "tv"
                    : "movie"
            )
        ).toLowerCase();


    const isSeries =
        mediaType === "tv"
        || mediaType === "series";


    const releaseDate =
        movie.release_date
        || movie.first_air_date
        || "";


    const year =
        releaseDate
            ? String(
                releaseDate
            ).substring(0, 4)
            : "";


    const safeId =
        escapeHtml(
            String(id)
        );


    const safeTitle =
        escapeHtml(
            title
        );


    const safePoster =
        escapeHtml(
            poster
        );


    return `

        <button
            type="button"
            class="search-result-item"
            onclick="openSearchResult(
                '${safeId}',
                '${isSeries ? "tv" : "movie"}'
            )"
        >

            <div class="search-result-poster">

                ${
                    safePoster
                        ? `
                            <img
                                src="${safePoster}"
                                alt="${safeTitle}"
                                loading="lazy"
                            >
                          `
                        : `
                            <div class="search-result-poster-empty">

                                <i
                                    data-lucide="film"
                                ></i>

                            </div>
                          `
                }

            </div>


            <div class="search-result-info">

                <div class="search-result-title">
                    ${safeTitle}
                </div>


                <div class="search-result-meta">

                    <span class="search-result-rating">

                        <i
                            data-lucide="star"
                        ></i>

                        ${rating.toFixed(1)}

                    </span>


                    ${
                        year
                            ? `
                                <span class="search-result-year">
                                    ${escapeHtml(year)}
                                </span>
                              `
                            : ""
                    }


                    <span
                        class="
                            search-result-type
                            ${
                                isSeries
                                    ? "series"
                                    : "movie"
                            }
                        "
                    >
                        ${
                            isSeries
                                ? "SERIES"
                                : "MOVIE"
                        }
                    </span>

                </div>

            </div>

        </button>

    `;

}


/* =========================================
   OPEN SEARCH RESULT
========================================= */

function openSearchResult(
    movieId,
    mediaType
) {

    if (!movieId) {
        return;
    }


    closeSearchScreen();


    /*
       Movie
    */

    if (
        mediaType === "movie"
    ) {

        navigateTo(
            "movie"
        );


        if (
            typeof loadMovieDetails
            === "function"
        ) {

            loadMovieDetails(
                movieId,
                "movie"
            );

        }

        return;

    }


    /*
       TV / SERIES
    */

    if (
        mediaType === "tv"
        || mediaType === "series"
    ) {

        window.location.href =
            `series.html?series=${encodeURIComponent(
                movieId
            )}&from=search`;

    }

}


/* =========================================
   EMPTY SEARCH STATE
========================================= */

function showSearchEmptyState() {

    const results =
        document.getElementById(
            "search-results"
        );


    if (!results) {
        return;
    }


    results.innerHTML = `

        <div class="search-empty-state">

            <i data-lucide="search"></i>

            <span>
                Search movies and series
            </span>

        </div>

    `;


    initializeIcons();

}

/* =========================================
   EXPLORE BUTTON
========================================= */

function scrollToLatest() {

    const section =
        document.getElementById(
            "latest-section"
        );


    if (!section) {
        return;
    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeSidebar();
        }

    }
);
/* =========================================
   STREAMING PLATFORM
========================================= */

let currentPlatform = "";
let currentPlatformMedia = "movie";
let platformCurrentPage = 1;
let platformTotalPages = 1;
let platformLoading = false;
let platformObserver = null;

const PLATFORM_INFO = {

    netflix: {
        name: "Netflix",
        description: "Movies and TV shows available on Netflix."
    },

    "prime-video": {
        name: "Prime Video",
        description: "Movies and TV shows available on Prime Video."
    },

    hulu: {
        name: "Hulu",
        description: "Movies and TV shows available on Hulu."
    },

    "disney-plus": {
        name: "Disney+",
        description: "Movies and TV shows available on Disney+."
    },

    "apple-tv-plus": {
        name: "Apple TV+",
        description: "Movies and TV shows available on Apple TV+."
    },

    max: {
        name: "Max",
        description: "Movies and TV shows available on Max."
    },

    paramount: {
        name: "Paramount+",
        description: "Movies and TV shows available on Paramount+."
    },

    peacock: {
        name: "Peacock",
        description: "Movies and TV shows available on Peacock."
    },

    jiohotstar: {
        name: "JioHotstar",
        description: "Movies and TV shows available on JioHotstar."
    }

};


function openPlatform(platform, updateHistory = true) {

    if (!platform) {
        return;
    }


    if (!PLATFORM_INFO[platform]) {

        console.warn(
            "Unknown platform:",
            platform
        );

        return;
    }

currentPlatform = platform;
currentPlatformMedia = "movie";

if (updateHistory) {
    const platformUrl = new URL(window.location.href);
    platformUrl.searchParams.set("screen", "platform");
    platformUrl.searchParams.set("platform", platform);
    platformUrl.searchParams.delete("movie");
    platformUrl.searchParams.delete("tv");
    window.history.pushState({ screen: "platform" }, "", platformUrl);
}

platformCurrentPage = 1;
platformTotalPages = 1;
platformLoading = false;

if (platformObserver) {
    platformObserver.disconnect();
    platformObserver = null;
}

    navigateTo("platform");


    updatePlatformHeader();


    switchPlatformMedia("movie");

}


function updatePlatformHeader() {

    const info =
        PLATFORM_INFO[currentPlatform];


    if (!info) {
        return;
    }


    const title =
        document.getElementById(
            "platform-page-title"
        );


    const description =
        document.getElementById(
            "platform-page-description"
        );


    if (title) {
        title.textContent = info.name;
    }


    if (description) {
        description.textContent =
            info.description;
    }


    const logo =
        document.getElementById(
            "platform-page-logo"
        );


    if (logo) {
        logo.textContent = info.name;
    }

}


function switchPlatformMedia(mediaType) {

    if (!currentPlatform) {
        return;
    }


    currentPlatformMedia =
        mediaType === "tv"
            ? "tv"
            : "movie";
platformCurrentPage = 1;
platformTotalPages = 1;
platformLoading = false;

if (platformObserver) {
    platformObserver.disconnect();
    platformObserver = null;
}

    const movieTab =
        document.getElementById(
            "platform-movies-tab"
        );


    const tvTab =
        document.getElementById(
            "platform-tv-tab"
        );


    if (movieTab) {
        movieTab.classList.toggle(
            "active",
            currentPlatformMedia === "movie"
        );
    }


    if (tvTab) {
        tvTab.classList.toggle(
            "active",
            currentPlatformMedia === "tv"
        );
    }


    loadPlatformTitles();

}

async function loadPlatformTitles(loadMore = false) {

    if (!currentPlatform) {
        return;
    }

    if (platformLoading) {
        return;
    }

    // Agar next page nahi hai
    if (
        loadMore &&
        platformCurrentPage >= platformTotalPages
    ) {
        return;
    }

    const grid =
        document.getElementById(
            "platform-results-grid"
        );

    const loading =
        document.getElementById(
            "platform-loading"
        );

    const errorBox =
        document.getElementById(
            "platform-error"
        );

    const count =
        document.getElementById(
            "platform-results-count"
        );

    const title =
        document.getElementById(
            "platform-results-title"
        );

    if (!grid) {
        return;
    }

    platformLoading = true;

    const platformName =
        PLATFORM_INFO[currentPlatform]?.name ||
        currentPlatform;


    /*
     * FIRST PAGE
     */
    if (!loadMore) {

        platformCurrentPage = 1;
        platformTotalPages = 1;

        if (platformObserver) {
            platformObserver.disconnect();
            platformObserver = null;
        }

        grid.innerHTML = "";

        loading?.classList.remove("hidden");
        errorBox?.classList.add("hidden");

        if (count) {
            count.textContent = "Loading...";
        }
    }


    /*
     * TITLE
     */
    if (title) {

        title.textContent =
            `${platformName} ${
                currentPlatformMedia === "tv"
                    ? "TV Series"
                    : "Movies"
            }`;

    }


    /*
     * NEXT PAGE
     */
    const nextPage =
        loadMore
            ? platformCurrentPage + 1
            : 1;


    /*
     * API ENDPOINT
     */
    const endpoint =
        currentPlatformMedia === "tv"
            ? `/movies/platform/${encodeURIComponent(
                  currentPlatform
              )}/tv?page=${nextPage}`
            : `/movies/platform/${encodeURIComponent(
                  currentPlatform
              )}?page=${nextPage}`;


    console.log(
        "MovieBox platform loading:",
        currentPlatform,
        currentPlatformMedia,
        "page:",
        nextPage
    );


    try {

        const data =
            await apiGet(endpoint);


        const results =
            Array.isArray(data?.results)
                ? data.results
                : [];


        /*
         * UPDATE PAGINATION
         */
        platformCurrentPage =
            Number(
                data?.page || nextPage
            );

        platformTotalPages =
            Number(
                data?.total_pages || 1
            );


        /*
         * HIDE LOADER
         */
        loading?.classList.add("hidden");


        /*
         * TOTAL COUNT
         */
        if (count) {

            count.textContent =
                `${Number(
                    data?.total_results || 0
                ).toLocaleString()} titles`;

        }


        /*
         * NO RESULTS
         */
        if (!results.length) {

            if (!loadMore) {

                grid.innerHTML = `
                    <div class="empty-state col-span-full">
                        No titles found on
                        ${escapeHtml(platformName)}.
                    </div>
                `;

            }

            return;
        }


        /*
         * CREATE CARDS
         */
        const cards =
    results
        .map(item => {

            const mediaType =
                currentPlatformMedia === "tv"
                    ? "tv"
                    : "movie";


            return createMovieCard(
                {
                    ...item,
                    media_type: mediaType
                },
                "platform"
            );

        })
        .join("");
        /*
         * FIRST PAGE = REPLACE
         * NEXT PAGE = APPEND
         */
        if (loadMore) {

            grid.insertAdjacentHTML(
                "beforeend",
                cards
            );

        } else {

            grid.innerHTML = cards;

        }


        initializeIcons();


    } catch (error) {

        console.error(
            "Platform loading failed:",
            error
        );


        if (!loadMore) {

            loading?.classList.add("hidden");
            errorBox?.classList.remove("hidden");

            if (count) {
                count.textContent = "";
            }

            const message =
                document.getElementById(
                    "platform-error-message"
                );

            if (message) {

                message.textContent =
                    `Unable to load ${platformName} titles.`;

            }

        } else {

            console.error(
                "MovieBox: Failed to load next page."
            );

        }

    } finally {

        platformLoading = false;

        /*
         * IMPORTANT:
         * Observer loading complete hone ke BAAD
         * attach hoga.
         */
        setupPlatformInfiniteScroll();

    }

}
function setupPlatformInfiniteScroll() {

    /*
     * Remove old observer
     */

    if (platformObserver) {

        platformObserver.disconnect();

        platformObserver = null;

    }


    /*
     * Stop if there are no more pages
     */

    if (
        platformCurrentPage >=
        platformTotalPages
    ) {

        return;

    }


    /*
     * Create bottom trigger
     */

    let sentinel =
        document.getElementById(
            "platform-scroll-sentinel"
        );


    if (!sentinel) {

        sentinel =
            document.createElement("div");

        sentinel.id =
            "platform-scroll-sentinel";

        sentinel.style.width =
            "100%";

        sentinel.style.height =
            "1px";

        sentinel.style.marginTop =
            "20px";

        sentinel.style.pointerEvents =
            "none";


        const grid =
            document.getElementById(
                "platform-results-grid"
            );


        if (!grid) {
            return;
        }


        grid.parentElement.appendChild(
            sentinel
        );

    }


    /*
     * Watch bottom of page
     */

    platformObserver =
        new IntersectionObserver(
            entries => {

                if (!entries.length) {
                    return;
                }


                if (
                    entries[0].isIntersecting
                ) {

                    loadPlatformTitles(true);

                }

            },
            {
                root: null,

                rootMargin:
                    "700px 0px 700px 0px",

                threshold: 0
            }
        );


    platformObserver.observe(
        sentinel
    );

}
