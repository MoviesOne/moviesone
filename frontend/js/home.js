/* =========================================
   MOVIEBOX HOME
   PREMIUM MOBILE-FIRST HERO + MOVIE CARDS
========================================= */

let homeData = {
    popular: [],
    trendingTV: [],
    newReleases: [],
    topMovies: [],
    topShows: [],
    romance: [],
    thriller: [],
    horror: [],
    comedy: [],
    action: [],
    scifi: []
};


/* =========================================
   HERO STATE
========================================= */

let heroMovies = [];
let heroIndex = 0;
let heroTimer = null;
let heroTouchStartX = 0;
let heroTouchStartY = 0;
let heroIsAnimating = false;


/* =========================================
   INITIALIZE HOME
========================================= */

async function initHome() {

    console.log("MovieBox Home loading...");
    showHomeLoading();

    // Render sections independently so one slow request does not block the page.
    const sections = [
        ["/movies", "popular", "popular-movies-grid", 30],
        ["/movies/trending-tv", "trendingTV", "trending-tv-grid", 30],
        ["/movies/new-releases", "newReleases", "new-releases-grid", 30],
        ["/movies/top", "topMovies", "top-movies-grid", 10],
        ["/movies/top-shows", "topShows", "top-shows-grid", 10],
        ["/movies/romance", "romance", "romance-grid", 30],
        ["/movies/thriller", "thriller", "thriller-grid", 30],
        ["/movies/horror", "horror", "horror-grid"],
        ["/movies/comedy", "comedy", "comedy-grid"],
        ["/movies/action", "action", "action-grid"],
        ["/movies/scifi", "scifi", "scifi-grid"]
    ];

    let succeeded = 0;
    let heroStarted = false;

    const startHeroIfReady = () => {
        if (heroStarted) return;
        const heroMovies = homeData.popular.length ? homeData.popular : homeData.newReleases;
        if (heroMovies.length) {
            heroStarted = true;
            startHeroSlider(heroMovies);
        }
    };

    await Promise.all(sections.map(async ([endpoint, dataKey, gridId, limit]) => {
        try {
            const response = await apiGet(endpoint);
            const movies = normalizeMoviesResponse(response);
            homeData[dataKey] = (dataKey === "topMovies" || dataKey === "topShows")
                ? movies.slice(0, limit)
                : movies;
            renderMovieGrid(gridId, homeData[dataKey], limit);
            succeeded += 1;
            startHeroIfReady();
            refreshIcons();
        } catch (error) {
            console.error(`Home section failed (${endpoint}):`, error);
        }
    }));

    if (!succeeded) {
        showHomeError();
        return;
    }

    startHeroIfReady();
    refreshIcons();
    console.log(`MovieBox Home loaded: ${succeeded}/${sections.length} sections.`);
}


function getResults(result) {

    if (
        !result ||
        result.status !== "fulfilled"
    ) {

        return [];

    }

    return normalizeMoviesResponse(
        result.value
    );

}


/* =========================================
   NORMALIZE API RESPONSE
========================================= */

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
   RENDER HOME MOVIE GRID (OPTIMIZED)
========================================= */
function renderMovieGrid(elementId, movies, limit = 30) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.classList.add("home-horizontal-row");

    const items = Array.isArray(movies)
        ? movies.slice(0, limit)
        : [];

    container.innerHTML = items
        .map(movie => createMovieCard(movie))
        .join("");

    refreshIcons();
}


/* =========================================
   CREATE PREMIUM MOVIE CARD
========================================= */
function createMovieCard(
    movie,
    returnPage = "home"
) {

    const id =
        movie.id ||
        movie.tmdbId ||
        movie.tmdb_id ||
        movie.movieId;


    const title =
        movie.title ||
        movie.name ||
        movie.original_title ||
        movie.original_name ||
        "Unknown Title";


    const poster =
        movie.poster ||
        movie.poster_path ||
        movie.posterPath ||
        movie.image ||
        "";


    const posterUrl =
        getImageUrl(
            poster,
            "w500"
        );


    // =========================
    // RATING
    // =========================

    const rating =
        movie.imdb_rating ??
        movie.imdbRating ??
        movie.rating ??
        movie.vote_average ??
        movie.score ??
        null;


    // =========================
    // YEAR
    // =========================

    const releaseDate =
        movie.release_date ||
        movie.first_air_date ||
        movie.releaseDate ||
        "";


    const year =
        releaseDate
            ? String(releaseDate).slice(0, 4)
            : (
                movie.year ||
                ""
            );


    // =========================
    // MOVIE / TV TYPE
    // =========================

    const mediaType =
        movie.media_type ||
        movie.mediaType ||
        (
            movie.first_air_date ||
            movie.name ||
            movie.original_name ||
            movie.number_of_seasons
                ? "tv"
                : "movie"
        );


    const typeLabel =
        mediaType === "tv"
            ? "SERIES"
            : "MOVIE";


    // =========================
    // SAFE VALUES
    // =========================

    const safeId =
        escapeHtml(
            String(id || "")
        );


    const safeTitle =
        escapeHtml(
            String(title)
        );


    const safeMediaType =
        escapeHtml(
            String(mediaType)
        );

        const safeReturnPage =
    escapeHtml(
        String(returnPage)
    );

    // =========================
    // CARD
    // =========================

    return `
        <article
            class="movie-card premium-movie-card"
           onclick="openMovie('${safeId}', '${safeMediaType}', '${safeReturnPage}')"
        >

            <!-- POSTER -->

            <div class="movie-card-poster">

                ${
                    posterUrl
                        ? `
                            <img
                                src="${escapeHtml(posterUrl)}"
                                alt="${safeTitle}"
                                loading="lazy"
                                onerror="this.style.display='none';"
                            >
                        `
                        : `
                            <div class="movie-card-empty">
                                <i
                                    data-lucide="image-off"
                                    class="h-8 w-8"
                                ></i>
                            </div>
                        `
                }


                <!-- PLAY OVERLAY -->

                <div class="movie-card-overlay">

                    <div class="movie-card-play">

                        <i
                            data-lucide="play"
                            class="h-4 w-4 fill-current"
                        ></i>

                    </div>

                </div>

            </div>


            <!-- CARD INFO -->

            <div class="movie-card-info">

                <!-- TITLE -->

                <div
                    class="movie-card-title"
                    title="${safeTitle}"
                >
                    ${safeTitle}
                </div>


                <!-- MOVIE / YEAR / RATING -->

                <div class="movie-card-meta">

                    <!-- TYPE -->

                    <span class="movie-type-badge">
                        ${typeLabel}
                    </span>


                    <!-- YEAR -->

                    ${
                        year
                            ? `
                                <span class="movie-year">
                                    <i
                                        data-lucide="clapperboard"
                                    ></i>

                                    ${escapeHtml(year)}
                                </span>
                            `
                            : ""
                    }


                    <!-- RATING -->

                    ${
                        rating !== null &&
                        rating !== undefined &&
                        !Number.isNaN(Number(rating))
                            ? `
                                <span class="movie-rating">

                                    <span class="rating-star">
                                        ★
                                    </span>

                                    ${Number(rating).toFixed(1)}

                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;
}
// ==============================
// START HERO SLIDER
// ==============================

function getHeroElement() {
    const backdrop = document.getElementById("home-hero-backdrop");

    if (backdrop) {
        const section = backdrop.closest("section");

        if (section) {
            return section;
        }
    }

    const home = document.getElementById("home-screen");

    if (home) {
        const section = home.querySelector("section");

        if (section) {
            return section;
        }
    }

    return null;
}


function startHeroSlider(movies) {
    heroMovies = Array.isArray(movies) ? movies : [];
    heroIndex = 0;

    stopHeroSlider();

    if (!heroMovies.length) {
        return;
    }

    buildHeroControls();
setupHeroTouch();

showHeroSlide(0, false);

// Show the new Hero only after its content is ready
const hero = getHeroElement();

if (hero) {
    hero.style.visibility = "visible";
}

    if (heroMovies.length > 1) {
        restartHeroTimer();
    }
}


function stopHeroSlider() {
    if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
    }
}


function buildHeroControls() {
    const hero = getHeroElement();

    if (!hero) {
        return;
    }

    const content = hero.querySelector(".relative.mx-auto");

    if (!content) {
        return;
    }

    const textWrapper = content.querySelector(".max-w-2xl");

    if (!textWrapper) {
        return;
    }

    // Remove old dynamically-created controls
    const oldMeta = textWrapper.querySelector("#hero-meta");
    const oldPremiumControls = textWrapper.querySelector(".premium-hero-controls");
    const oldWatchButton = textWrapper.querySelector("#hero-watch-button");

    if (oldMeta) {
        oldMeta.remove();
    }

    if (oldPremiumControls) {
        oldPremiumControls.remove();
    }

    if (oldWatchButton) {
        oldWatchButton.remove();
    }


    // Hero metadata
    const meta = document.createElement("div");

    meta.id = "hero-meta";
    meta.className = "mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70";

    textWrapper.appendChild(meta);


    // Watch button
    const buttonWrapper = textWrapper.querySelector(".mt-7");

    if (buttonWrapper) {
        const watchButton = document.createElement("button");

        watchButton.id = "hero-watch-button";
        watchButton.type = "button";
        watchButton.className =
            "inline-flex items-center gap-2 rounded-xl bg-[#ff4d00] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.03] hover:bg-[#ff5c19] active:scale-95";

        watchButton.innerHTML = `
            <span>▶</span>
            <span>Watch Now</span>
        `;

        watchButton.addEventListener("click", () => {
            const movie = heroMovies[heroIndex];

            if (!movie) {
                return;
            }

            if (typeof openMovieDetails === "function") {
                openMovieDetails(movie.id);
                return;
            }

            if (typeof navigateTo === "function") {
                navigateTo("movie", movie.id);
            }
        });

        buttonWrapper.prepend(watchButton);
    }


    // Premium hero controls
    const controls = document.createElement("div");

    controls.className =
        "premium-hero-controls mt-6 flex items-center gap-3";

    controls.innerHTML = `
        <div
            id="hero-dots"
            class="flex items-center gap-2"
            aria-label="Hero slides"
        ></div>
    `;

    textWrapper.appendChild(controls);

    updateHeroDots();
}


function showHeroSlide(index, animate = true) {
    if (!heroMovies.length) {
        return;
    }

    const hero = getHeroElement();

    if (!hero) {
        return;
    }

    // Keep index inside valid range
    heroIndex =
        ((index % heroMovies.length) + heroMovies.length) %
        heroMovies.length;

    const movie = heroMovies[heroIndex];

    if (!movie) {
        return;
    }


    const title = document.getElementById("hero-title");
    const description = document.getElementById("hero-description");
    const backdrop = document.getElementById("home-hero-backdrop");
    const meta = document.getElementById("hero-meta");
    const watchButton = document.getElementById("hero-watch-button");


    // Animation
    if (animate) {
        hero.classList.remove("hero-changing");

        // Force browser reflow so animation can restart
        void hero.offsetWidth;

        hero.classList.add("hero-changing");
    }


    // Title
    if (title) {
        title.textContent =
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            "Untitled";
    }


    // Description
    if (description) {
        description.textContent =
            movie.overview ||
            movie.description ||
            "Discover movies and series you'll love.";
    }


    // Backdrop
    if (backdrop) {
        const backdropPath =
            movie.backdrop_path ||
            movie.backdrop ||
            movie.poster_path ||
            movie.poster;

        if (backdropPath) {
            const imageUrl = getImageUrl(backdropPath);

            backdrop.style.backgroundImage = `
                linear-gradient(
                    to right,
                    #070709 0%,
                    rgba(7,7,9,.85) 35%,
                    rgba(7,7,9,.25) 70%,
                    #070709 100%
                ),
                linear-gradient(
                    to top,
                    #070709 0%,
                    transparent 50%
                ),
                url("${imageUrl}")
            `;
        } else {
            backdrop.style.backgroundImage = `
                linear-gradient(
                    to right,
                    #070709 0%,
                    rgba(7,7,9,.85) 35%,
                    rgba(7,7,9,.25) 70%,
                    #070709 100%
                ),
                linear-gradient(
                    to top,
                    #070709 0%,
                    transparent 50%
                )
            `;
        }
    }


    // Metadata
    if (meta) {
        const year =
            movie.release_date?.slice(0, 4) ||
            movie.first_air_date?.slice(0, 4) ||
            movie.year ||
            "";

        const runtime =
            movie.runtime ||
            (
                Array.isArray(movie.episode_run_time)
                    ? movie.episode_run_time[0]
                    : null
            );

        const rating =
            movie.vote_average ??
            movie.rating ??
            null;

        const mediaType =
            movie.media_type === "tv" ||
            movie.first_air_date ||
            movie.name
                ? "Series"
                : "Movie";


        const parts = [];

        if (year) {
            parts.push(`<span>${year}</span>`);
        }

        if (mediaType) {
            parts.push(`<span>${mediaType}</span>`);
        }

        if (runtime) {
            parts.push(`<span>${runtime} min</span>`);
        }

        if (rating !== null && rating !== undefined && rating !== "") {
            const numericRating = Number(rating);

            if (!Number.isNaN(numericRating)) {
                parts.push(
                    `<span>⭐ ${numericRating.toFixed(1)}</span>`
                );
            }
        }

        meta.innerHTML = parts
            .map((item) => `<span>${item}</span>`)
            .join(`<span class="text-white/30">•</span>`);
    }


    // Update watch button dataset
    if (watchButton) {
        watchButton.dataset.movieId = movie.id || "";
    }


    updateHeroDots();
}


function changeHeroSlide(direction) {
    if (!heroMovies.length) {
        return;
    }

    const nextIndex =
        heroIndex + direction;

    showHeroSlide(nextIndex, true);

    restartHeroTimer();
}


function restartHeroTimer() {
    stopHeroSlider();

    if (heroMovies.length <= 1) {
        return;
    }

    heroTimer = setInterval(() => {
        showHeroSlide(heroIndex + 1, true);
    }, 6000);
}


function updateHeroDots() {
    const dotsContainer =
        document.getElementById("hero-dots");

    if (!dotsContainer) {
        return;
    }

    dotsContainer.innerHTML = "";

    heroMovies.forEach((movie, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "hero-dot";

        dot.setAttribute(
            "aria-label",
            `Go to slide ${index + 1}`
        );

        dot.setAttribute(
            "aria-current",
            index === heroIndex ? "true" : "false"
        );

        if (index === heroIndex) {
            dot.classList.add("active");
        }

        dot.addEventListener("click", () => {
            goToHeroSlide(index);
        });

        dotsContainer.appendChild(dot);
    });
}


function goToHeroSlide(index) {
    if (!heroMovies.length) {
        return;
    }

    showHeroSlide(index, true);

    restartHeroTimer();
}


function setupHeroTouch() {
    const hero = getHeroElement();

    if (!hero) {
        return;
    }

    // Prevent duplicate listeners
    if (hero.dataset.sliderReady === "true") {
        return;
    }

    hero.dataset.sliderReady = "true";


    // ==========================
    // TOUCH SWIPE
    // ==========================

    hero.addEventListener(
        "touchstart",
        (event) => {
            const touch = event.touches[0];

            heroTouchStartX = touch.clientX;
            heroTouchStartY = touch.clientY;
        },
        { passive: true }
    );


    hero.addEventListener(
        "touchend",
        (event) => {
            const touch = event.changedTouches[0];

            const deltaX =
                touch.clientX - heroTouchStartX;

            const deltaY =
                touch.clientY - heroTouchStartY;

            // Ignore mostly vertical swipes
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                return;
            }

            // Minimum swipe distance
            if (Math.abs(deltaX) < 50) {
                return;
            }

            if (deltaX < 0) {
                changeHeroSlide(1);
            } else {
                changeHeroSlide(-1);
            }
        },
        { passive: true }
    );


    // ==========================
    // MOUSE DRAG
    // ==========================

    let mouseStartX = 0;
    let mouseDragging = false;


    hero.addEventListener("mousedown", (event) => {
        mouseStartX = event.clientX;
        mouseDragging = true;
    });


    hero.addEventListener("mousemove", (event) => {
        if (!mouseDragging) {
            return;
        }

        const deltaX =
            event.clientX - mouseStartX;

        if (Math.abs(deltaX) < 60) {
            return;
        }

        mouseDragging = false;

        if (deltaX < 0) {
            changeHeroSlide(1);
        } else {
            changeHeroSlide(-1);
        }
    });


    hero.addEventListener("mouseup", () => {
        mouseDragging = false;
    });


    hero.addEventListener("mouseleave", () => {
        mouseDragging = false;
    });
}


// ==============================
// END HERO SLIDER
// ==============================


// =========================
// STOP HERO
// =========================

function stopHeroSlider() {

    if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
    }

}


// =========================
// BUILD HERO CONTROLS
// =========================

function buildHeroControls() {

    const hero = getHeroElement();

    if (!hero) {
        return;
    }


    // ---------------------------------
    // REMOVE OLD HERO BUTTONS
    // ---------------------------------

    const oldExploreButton =
        hero.querySelector(
            '[onclick*="scrollToLatest"]'
        );

    if (oldExploreButton) {
        oldExploreButton.remove();
    }


    const oldBrowseButton =
        hero.querySelector(
            '[onclick*="navigateTo(\'movies\')"]'
        );

    if (oldBrowseButton) {
        oldBrowseButton.remove();
    }


    // Also remove any old button
    // except Watch Now
    const buttonArea =
        hero.querySelector(".hero-button-area") ||
        hero.querySelector(".mt-7");


    if (buttonArea) {

        Array.from(
            buttonArea.querySelectorAll("button")
        ).forEach(button => {

            if (
                button.id !== "hero-watch-button"
            ) {
                button.remove();
            }

        });

    }


    // ---------------------------------
    // WATCH NOW BUTTON
    // ---------------------------------

    let watchButton =
        document.getElementById(
            "hero-watch-button"
        );


    if (!watchButton) {

        watchButton =
            document.createElement("button");

        watchButton.id =
            "hero-watch-button";


        if (buttonArea) {
            buttonArea.appendChild(
                watchButton
            );
        }

    }


    watchButton.type = "button";

    watchButton.className =
        "hero-watch-button inline-flex items-center justify-center gap-3 rounded-2xl font-bold text-white";


    watchButton.innerHTML = `
        <i
            data-lucide="play"
            class="h-5 w-5 fill-current"
        ></i>

        <span>Watch Now</span>
    `;


    // ---------------------------------
    // WATCH CURRENT MOVIE
    // ---------------------------------

    watchButton.onclick = () => {

        const movie =
            heroMovies[heroIndex];

        if (!movie) {
            return;
        }


        const id =
            movie.id ||
            movie.tmdbId ||
            movie.tmdb_id ||
            movie.movieId;


        if (!id) {
            return;
        }


        const mediaType =
            movie.media_type ||
            movie.mediaType ||
            (
                movie.first_air_date ||
                movie.name ||
                movie.original_name
                    ? "tv"
                    : "movie"
            );


        if (
            typeof openMovie === "function"
        ) {

            openMovie(
                String(id),
                mediaType
            );

        }

    };


    // ---------------------------------
    // HERO META / IMDb
    // ---------------------------------

    let meta =
        document.getElementById(
            "hero-meta"
        );


    if (!meta) {

        meta =
            document.createElement("div");

        meta.id = "hero-meta";


        const title =
            document.getElementById(
                "hero-title"
            );


        if (title) {
            title.before(meta);
        }

    }


    // ---------------------------------
    // REMOVE OLD DOT CONTROLS
    // ---------------------------------

    hero
        .querySelector(
            ".premium-hero-controls"
        )
        ?.remove();


    // ---------------------------------
    // CREATE DOTS
    // ---------------------------------

    const controls =
        document.createElement("div");

    controls.className =
        "premium-hero-controls";


    controls.innerHTML = `
        <div
            id="hero-dots"
            class="hero-dots"
            aria-label="Hero slider navigation"
        ></div>
    `;


    hero.appendChild(
        controls
    );


    updateHeroDots();


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// =========================
// SHOW HERO SLIDE
// =========================

function showHeroSlide(
    index,
    animate = true
) {

    if (!heroMovies.length) {
        return;
    }


    const title =
        document.getElementById(
            "hero-title"
        );


    const description =
        document.getElementById(
            "hero-description"
        );


    const backdrop =
        document.getElementById(
            "home-hero-backdrop"
        );


    const meta =
        document.getElementById(
            "hero-meta"
        );


    if (
        !title ||
        !description ||
        !backdrop
    ) {

        return;

    }


    // Keep index inside 0-4
    heroIndex =
        (
            (
                index %
                heroMovies.length
            ) +
            heroMovies.length
        ) %
        heroMovies.length;


    const movie =
        heroMovies[heroIndex];


    if (!movie) {
        return;
    }


    const updateContent = () => {

        // ---------------------------------
        // TITLE
        // ---------------------------------

        const movieTitle =
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            "Untitled";


        // ---------------------------------
        // DESCRIPTION
        // ---------------------------------

        const overview =
            movie.overview ||
            movie.description ||
            "No description available.";


        title.textContent =
            movieTitle;


        description.textContent =
            overview;


        // ---------------------------------
        // BACKDROP
        // ---------------------------------

        const backdropPath =
            movie.backdrop_path ||
            movie.backdrop ||
            movie.backdropUrl ||
            movie.backdrop_url;


        let imageUrl =
            backdropPath || "";


        if (
            imageUrl &&
            typeof imageUrl === "string" &&
            imageUrl.startsWith("/")
        ) {

            imageUrl =
                `https://image.tmdb.org/t/p/original${imageUrl}`;

        }


        if (imageUrl) {

            backdrop.style.backgroundImage = `
                linear-gradient(
                    to bottom,
                    rgba(7,7,9,0.05) 20%,
                    rgba(7,7,9,0.15) 45%,
                    rgba(7,7,9,0.88) 82%,
                    #070709 100%
                ),
                url("${imageUrl}")
            `;

        } else {

            backdrop.style.backgroundImage = `
                linear-gradient(
                    to bottom,
                    rgba(7,7,9,0.05),
                    #070709 100%
                )
            `;

        }


        // ---------------------------------
        // IMDb
        // ---------------------------------

        if (meta) {

            const rating =
                movie.imdb_rating ??
                movie.imdbRating ??
                movie.vote_average ??
                movie.rating ??
                movie.score ??
                null;


            if (
                rating !== null &&
                rating !== undefined &&
                !Number.isNaN(
                    Number(rating)
                )
            ) {

                meta.innerHTML = `
                    <span class="hero-imdb">
                        IMDb ${Number(
                            rating
                        ).toFixed(1)}
                    </span>
                `;

            } else {

                meta.innerHTML = "";

            }

        }


        // Update 5 dots
        updateHeroDots();

    };


    if (!animate) {

        updateContent();

        return;

    }


    const hero =
        getHeroElement();


    if (hero) {

        hero.classList.add(
            "hero-changing"
        );

    }


    setTimeout(() => {

        updateContent();


        requestAnimationFrame(() => {

            if (hero) {

                hero.classList.remove(
                    "hero-changing"
                );

            }

        });

    }, 150);

}


// =========================
// CHANGE SLIDE
// =========================

function changeHeroSlide(index) {

    if (!heroMovies.length) {
        return;
    }


    showHeroSlide(
        index,
        true
    );


    restartHeroTimer();

}


// =========================
// AUTO SLIDER
// =========================

function restartHeroTimer() {

    stopHeroSlider();


    if (
        heroMovies.length <= 1
    ) {

        return;

    }


    heroTimer =
        setInterval(() => {

            changeHeroSlide(
                heroIndex + 1
            );

        }, 6000);

}


// =========================
// UPDATE DOTS
// =========================

function updateHeroDots() {

    const dotsContainer =
        document.getElementById(
            "hero-dots"
        );


    if (!dotsContainer) {
        return;
    }


    dotsContainer.innerHTML = "";


    // EXACTLY 5 DOTS MAXIMUM
    const totalDots =
        Math.min(
            heroMovies.length,
            5
        );


    for (
        let index = 0;
        index < totalDots;
        index++
    ) {

        const dot =
            document.createElement(
                "button"
            );


        dot.type = "button";

        dot.className =
            "hero-dot";


        if (
            index === heroIndex
        ) {

            dot.classList.add(
                "active"
            );

        }


        dot.setAttribute(
            "aria-label",
            `Go to slide ${index + 1}`
        );


        dot.addEventListener(
            "click",
            () => {

                goToHeroSlide(
                    index
                );

            }
        );


        dotsContainer.appendChild(
            dot
        );

    }

}


// =========================
// GO TO SLIDE
// =========================

function goToHeroSlide(index) {

    if (!heroMovies.length) {
        return;
    }


    changeHeroSlide(index);

}


// =========================
// TOUCH SWIPE
// =========================

function setupHeroTouch() {

    const hero =
        getHeroElement();


    if (!hero) {
        return;
    }


    if (
        hero.dataset.sliderReady === "true"
    ) {

        return;

    }


    hero.dataset.sliderReady =
        "true";


    hero.addEventListener(
        "touchstart",
        (event) => {

            const touch =
                event.touches[0];


            if (!touch) {
                return;
            }


            heroTouchStartX =
                touch.clientX;


            heroTouchStartY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    hero.addEventListener(
        "touchend",
        (event) => {

            const touch =
                event.changedTouches[0];


            if (!touch) {
                return;
            }


            const deltaX =
                touch.clientX -
                heroTouchStartX;


            const deltaY =
                touch.clientY -
                heroTouchStartY;


            // Ignore vertical swipe
            if (
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {

                return;

            }


            // Small movement = no slide
            if (
                Math.abs(deltaX) < 50
            ) {

                return;

            }


            if (deltaX < 0) {

                changeHeroSlide(
                    heroIndex + 1
                );

            } else {

                changeHeroSlide(
                    heroIndex - 1
                );

            }

        },
        {
            passive: true
        }
    );

}

// ==================== END HERO SLIDER ====================

/* =========================================
   LOADING UI
========================================= */

function showHomeLoading() {

    // Hide old/static hero while Home data is loading
    const hero = getHeroElement();

    if (hero) {
        hero.style.visibility = "hidden";
    }

    const sections = [

        "popular-movies-grid",
        "trending-tv-grid",
        "new-releases-grid",
        "top-movies-grid",
        "top-shows-grid",
        "romance-grid",
"thriller-grid",
        "horror-grid",
        "comedy-grid",
        "action-grid",
        "scifi-grid"

    ];


    sections.forEach(id => {

        const container =
            document.getElementById(id);


        if (!container) {
            return;
        }


        container.innerHTML =
            Array.from(
                { length: 6 },
                () => `
                    <div class="loading-card">

                        <div class="loading-poster"></div>

                        <div class="loading-info">

                            <div class="loading-line"></div>

                            <div class="loading-line short"></div>

                        </div>

                    </div>
                `
            ).join("");

    });

}


/* =========================================
   ERROR UI
========================================= */

function showHomeError() {

    const sections = [

        "popular-movies-grid",
        "trending-tv-grid",
        "new-releases-grid",
        "top-movies-grid",
        "top-shows-grid",
        "horror-grid",
        "comedy-grid",
        "action-grid",
        "scifi-grid"

    ];


    sections.forEach(id => {

        const container =
            document.getElementById(id);


        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="col-span-full py-8">

                <div class="font-semibold text-white/60">
                    Unable to load content
                </div>

                <div class="mt-1 text-xs text-white/30">
                    Please make sure the MovieBox backend is running.
                </div>

            </div>
        `;

    });

}


/* =========================================
   SCROLL TO LATEST
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
   REFRESH LUCIDE ICONS
========================================= */

function refreshIcons() {

    if (
        typeof lucide !== "undefined" &&
        typeof lucide.createIcons === "function"
    ) {

        lucide.createIcons();

    }

}


/* =========================================
   START HOME
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const hasDirectContent =
            params.has("movie") ||
            params.has("tv");

        if (hasDirectContent) {

            console.log(
                "MovieBox: Direct content detected — Home skipped."
            );

            return;
        }

        initHome();

    }
);
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.anime-card');

    cards.forEach(card => {
        card.addEventListener('click', function (e) {

            // Spam clicking rokne ke liye
            if (this.classList.contains('shatter-shake')) return;

            this.classList.add('shatter-shake');

            const targets = this.querySelectorAll('.explode-target');

            const colorPalette = (
                this.getAttribute('data-shatter-colors') ||
                '#ffffff,#ff2222'
            ).split(',');

            const cardRect = this.getBoundingClientRect();

            targets.forEach(target => {

                target.classList.remove('icon-exploding');

                // Force reflow
                void target.offsetWidth;

                target.classList.add('icon-exploding');

                const targetRect = target.getBoundingClientRect();

                const originX =
                    (targetRect.left - cardRect.left) +
                    targetRect.width / 2;

                const originY =
                    (targetRect.top - cardRect.top) +
                    targetRect.height / 2;

                createShatterBlast(
                    this,
                    originX,
                    originY,
                    colorPalette
                );
            });

            setTimeout(() => {

                this.classList.remove('shatter-shake');

                targets.forEach(target => {
                    target.classList.remove('icon-exploding');
                });

            }, 750);
        });
    });


    function createShatterBlast(parentCard, originX, originY, colors) {

        const pieceCount = 14;

        for (let i = 0; i < pieceCount; i++) {

            const piece = document.createElement('div');

            piece.classList.add('shatter-piece');

            const w = Math.floor(Math.random() * 6) + 3;
            const h = Math.floor(Math.random() * 6) + 3;

            piece.style.width = w + 'px';
            piece.style.height = h + 'px';

            const color =
                colors[Math.floor(Math.random() * colors.length)];

            piece.style.background = color;
            piece.style.boxShadow = `0 0 5px ${color}`;

            piece.style.left =
                (originX - w / 2) + 'px';

            piece.style.top =
                (originY - h / 2) + 'px';

            parentCard.appendChild(piece);

            const angle = Math.random() * Math.PI * 2;

            const blastForce =
                Math.random() * 60 + 25;

            const destX =
                Math.cos(angle) * blastForce;

            const destY =
                Math.sin(angle) * blastForce;

            const rotate =
                Math.random() * 720 - 360;

            const anim = piece.animate(
                [
                    {
                        transform:
                            'translate(0px, 0px) scale(1) rotate(0deg)',
                        opacity: 1
                    },
                    {
                        transform:
                            `translate(${destX * 0.5}px, ${destY * 0.5}px) scale(1.2) rotate(${rotate / 2}deg)`,
                        opacity: 0.9,
                        offset: 0.3
                    },
                    {
                        transform:
                            `translate(${destX}px, ${destY}px) scale(0) rotate(${rotate}deg)`,
                        opacity: 0
                    }
                ],
                {
                    duration: Math.random() * 200 + 400,
                    easing: 'cubic-bezier(0.12, 0.85, 0.3, 1)',
                    fill: 'forwards'
                }
            );

            anim.onfinish = () => piece.remove();
        }
    }
});
// =========================================
// FEATURED LIST NAVIGATION
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const card =
            event.target.closest(
                "[data-featured-list]"
            );


        if (!card) {
            return;
        }


        const type =
            card.getAttribute(
                "data-featured-list"
            );


        if (!type) {
            return;
        }


        window.location.href =
            `featured-list.html?type=${encodeURIComponent(type)}`;

    }
);