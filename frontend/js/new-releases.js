// =========================================
// NEW RELEASES - OPTIMIZED INFINITE SCROLL
// =========================================

let currentPage = 1;
let isLoading = false;
let hasMore = true;

const loadedMovieIds = new Set();


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("MovieBox New Releases loading...");

    const grid =
        document.getElementById("new-releases-grid");

    if (!grid) {
        console.error("New Releases grid not found.");
        return;
    }

    // First page
    loadNewReleases(true);

    // Infinite scroll
    setupInfiniteScroll();

});


// =========================================
// LOAD NEW RELEASES
// =========================================

async function loadNewReleases(firstLoad = false) {

    if (isLoading || !hasMore) {
        return;
    }

    const grid =
        document.getElementById("new-releases-grid");

    const loading =
        document.getElementById("new-releases-loading");

    if (!grid) {
        return;
    }

    isLoading = true;


    // =========================================
    // SHOW LOADING
    // =========================================

    if (loading) {
        loading.classList.remove("hidden");
        loading.classList.add("flex");
    }


    try {

        console.log(
            "Loading New Releases page:",
            currentPage
        );


        // =========================================
        // API
        // =========================================

        const response = await apiGet(
            `/movies/new-releases?page=${currentPage}`
        );


        // =========================================
        // NORMALIZE
        // =========================================

        const movies =
            normalizeMoviesResponse(response);


        console.log(
            `Received ${movies.length} movies`
        );


        // =========================================
        // FIRST LOAD
        // =========================================

        if (firstLoad) {
            grid.innerHTML = "";
        }


        // =========================================
        // NO MOVIES
        // =========================================

        if (!movies.length) {

            hasMore = false;

            showEndMessage();

            return;
        }


        // =========================================
        // BUILD HTML FIRST
        // =========================================

        let html = "";
        let addedMovies = 0;


        movies.forEach(movie => {

            const id =
                movie.tmdbId ||
                movie.id ||
                movie.tmdb_id ||
                movie.movieId;


            if (!id) {
                return;
            }


            const numericId = Number(id);


            if (!numericId) {
                return;
            }


            // =========================================
            // DUPLICATE PROTECTION
            // =========================================

            if (loadedMovieIds.has(numericId)) {
                return;
            }


            loadedMovieIds.add(numericId);


            // Build HTML in memory
            html += createMovieCard(movie);

            addedMovies++;

        });


        // =========================================
        // INSERT ALL MOVIES AT ONCE
        // =========================================

        if (html) {

            grid.insertAdjacentHTML(
                "beforeend",
                html
            );

        }


        console.log(
            `Added ${addedMovies} movies from page ${currentPage}`
        );


        // =========================================
        // LUCIDE ICONS
        // =========================================

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }


        // =========================================
        // NEXT PAGE
        // =========================================

        currentPage++;


        // =========================================
        // CHECK LAST PAGE
        // =========================================

        if (
            response &&
            response.total_pages &&
            currentPage > response.total_pages
        ) {

            hasMore = false;

            showEndMessage();

        }


    } catch (error) {

        console.error(
            "New Releases API Error:",
            error
        );


        // =========================================
        // FIRST PAGE ERROR
        // =========================================

        if (firstLoad) {

            grid.innerHTML = `
                <div class="col-span-full py-20 text-center">

                    <p class="text-lg font-semibold text-white/60">
                        Failed to load movies.
                    </p>

                    <button
                        onclick="location.reload()"
                        class="mt-4 rounded-xl bg-[#ff4d00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5f1a]"
                    >
                        Try Again
                    </button>

                </div>
            `;

        }


    } finally {

        isLoading = false;


        // =========================================
        // HIDE LOADING
        // =========================================

        if (loading) {

            loading.classList.add("hidden");
            loading.classList.remove("flex");

        }

    }

}


// =========================================
// INFINITE SCROLL
// =========================================

function setupInfiniteScroll() {

    const sentinel =
        document.getElementById(
            "new-releases-sentinel"
        );


    if (!sentinel) {

        console.error(
            "New Releases sentinel not found."
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                const entry =
                    entries[0];


                if (
                    entry.isIntersecting &&
                    !isLoading &&
                    hasMore
                ) {

                    loadNewReleases();

                }

            },
            {
                // Load next page before reaching bottom
                rootMargin: "500px 0px"
            }
        );


    observer.observe(sentinel);

}


// =========================================
// END MESSAGE
// =========================================

function showEndMessage() {

    const end =
        document.getElementById(
            "new-releases-end"
        );


    if (!end) {
        return;
    }


    end.classList.remove("hidden");

}


// =========================================
// NORMALIZE RESPONSE
// =========================================

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

// =========================================
// MOVIE CARD
// =========================================

function createMovieCard(movie) {

    const id =
        movie.tmdbId ||
        movie.id ||
        movie.tmdb_id ||
        movie.movieId;


    if (!id) {

        console.warn(
            "MovieBox: Invalid movie ID:",
            movie
        );

        return "";
    }


    const safeId = Number(id);


    if (!safeId) {

        console.warn(
            "MovieBox: Invalid numeric movie ID:",
            id
        );

        return "";
    }


    // =========================================
    // TITLE
    // =========================================

    const title =
        movie.title ||
        movie.name ||
        movie.original_title ||
        movie.original_name ||
        "Unknown Title";


    // =========================================
    // POSTER
    // =========================================

    const poster =
        movie.poster ||
        movie.poster_path ||
        movie.posterPath ||
        movie.image ||
        "";


    const posterUrl =
        poster.startsWith("http")
            ? poster
            : `https://image.tmdb.org/t/p/w500${poster}`;


    // =========================================
    // RATING
    // =========================================

    const rating =
        movie.imdb_rating ??
        movie.imdbRating ??
        movie.rating ??
        movie.vote_average ??
        movie.score ??
        null;


    // =========================================
    // YEAR
    // =========================================

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


    // =========================================
    // MOVIE / TV TYPE
    // =========================================

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


    // =========================================
    // SAFE TITLE
    // =========================================

    const safeTitle =
        String(title)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");


    // =========================================
    // CARD
    // =========================================

    return `
        <article
            class="movie-card premium-movie-card"
            onclick="window.location.href='index.html?movie=${safeId}&from=new-releases'"
        >

            <!-- POSTER -->

            <div class="movie-card-poster">

                ${
                    posterUrl
                        ? `
                            <img
                                src="${posterUrl}"
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


                <!-- TYPE / YEAR / RATING -->

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

                                    ${year}

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