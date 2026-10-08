// =========================================
// POPULAR MOVIES - INFINITE SCROLL
// =========================================

let currentPage = 1;
let isLoading = false;
let hasMore = true;

const loadedMovieIds = new Set();


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("MovieBox Popular Movies loading...");

    const grid =
        document.getElementById("popular-grid");

    if (!grid) {

        console.error(
            "Popular Movies grid not found."
        );

        return;
    }


    loadPopularMovies(true);

    setupInfiniteScroll();

    setupSearch();

});


// =========================================
// LOAD POPULAR
// =========================================

async function loadPopularMovies(firstLoad = false) {

    if (isLoading || !hasMore) {
        return;
    }


    const grid =
        document.getElementById("popular-grid");

    const loading =
        document.getElementById("popular-loading");


    if (!grid) {
        return;
    }


    isLoading = true;


    if (loading) {

        loading.classList.remove("hidden");

        loading.classList.add("flex");

    }


    try {

        console.log(
            "Loading Popular Movies page:",
            currentPage
        );


        const response =
            await apiGet(
                `/movies?page=${currentPage}`
            );


        const movies =
            normalizeMoviesResponse(response);


        console.log(
            `Received ${movies.length} popular movies`
        );


        if (firstLoad) {
            grid.innerHTML = "";
        }


        if (!movies.length) {

            hasMore = false;

            showEndMessage();

            return;

        }


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


            const numericId =
                Number(id);


            if (!numericId) {
                return;
            }


            if (
                loadedMovieIds.has(
                    numericId
                )
            ) {
                return;
            }


            loadedMovieIds.add(
                numericId
            );


            html +=
                createPopularMovieCard(
                    movie
                );


            addedMovies++;

        });


        if (html) {

            grid.insertAdjacentHTML(
                "beforeend",
                html
            );

        }


        console.log(
            `Added ${addedMovies} movies from page ${currentPage}`
        );


        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }


        currentPage++;


        if (
            response &&
            response.total_pages &&
            currentPage >
                response.total_pages
        ) {

            hasMore = false;

            showEndMessage();

        }


    } catch (error) {

        console.error(
            "Popular Movies API Error:",
            error
        );


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
            "popular-sentinel"
        );


    if (!sentinel) {

        console.error(
            "Popular Movies sentinel not found."
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

                    loadPopularMovies();

                }

            },
            {
                rootMargin:
                    "500px 0px"
            }
        );


    observer.observe(sentinel);

}


// =========================================
// END
// =========================================

function showEndMessage() {

    const end =
        document.getElementById(
            "popular-end"
        );


    if (!end) {
        return;
    }


    end.classList.remove(
        "hidden"
    );

}


// =========================================
// NORMALIZE
// =========================================

function normalizeMoviesResponse(data) {

    if (!data) {
        return [];
    }


    if (Array.isArray(data)) {
        return data;
    }


    if (
        Array.isArray(data.results)
    ) {

        return data.results;

    }


    if (
        Array.isArray(data.movies)
    ) {

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


function createPopularMovieCard(movie) {

    const id =
        movie.tmdbId ||
        movie.id ||
        movie.tmdb_id ||
        movie.movieId;


    if (!id) {
        return "";
    }


    const safeId =
        Number(id);


    if (!safeId) {
        return "";
    }


    // =========================
    // TITLE
    // =========================

    const title =
        movie.title ||
        movie.name ||
        movie.original_title ||
        movie.original_name ||
        "Unknown Title";


    // =========================
    // POSTER
    // =========================

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
    // MOVIE / SERIES TYPE
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
    // SAFE TITLE
    // =========================

    const safeTitle =
        escapeHtml(
            String(title)
        );


    // =========================
    // CARD
    // =========================

    return `
        <article
            class="movie-card group cursor-pointer"
            onclick="window.location.href='index.html?movie=${safeId}&from=popular'"
        >

            <!-- POSTER -->

            <div class="relative overflow-hidden rounded-xl bg-white/5">

                ${
                    posterUrl
                        ? `
                            <img
                                src="${escapeHtml(posterUrl)}"
                                alt="${safeTitle}"
                                class="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                                onerror="this.style.display='none';"
                            >
                        `
                        : ""
                }


                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"
                ></div>


                <!-- RATING -->

                ${
                    rating !== null &&
                    rating !== undefined &&
                    !Number.isNaN(Number(rating))
                        ? `
                            <div
                                class="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold"
                            >
                                <span class="text-yellow-400">
                                    ★
                                </span>

                                <span>
                                    ${Number(rating).toFixed(1)}
                                </span>
                            </div>
                        `
                        : ""
                }

            </div>


            <!-- INFO -->

            <div class="mt-3">

                <!-- TITLE -->

                <h3
                    class="line-clamp-2 text-sm font-bold text-white transition group-hover:text-orange-400"
                    title="${safeTitle}"
                >
                    ${safeTitle}
                </h3>


                <!-- META -->

                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">

                    <!-- TYPE -->

                    <span
                        class="rounded-md bg-purple-500/15 px-2 py-1 font-bold text-purple-300"
                    >
                        ${typeLabel}
                    </span>


                    <!-- YEAR -->

                    ${
                        year
                            ? `
                                <span
                                    class="flex items-center gap-1 text-white/60"
                                >
                                    <i
                                        data-lucide="clapperboard"
                                        class="h-3.5 w-3.5"
                                    ></i>

                                    ${escapeHtml(year)}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;

}


// =========================================
// SEARCH
// =========================================

function setupSearch() {

    const input =
        document.getElementById(
            "popular-search"
        );


    if (!input) {
        return;
    }


    let timer;


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {
                return;
            }


            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            window.location.href =
                `index.html?screen=search&query=${encodeURIComponent(query)}`;

        }
    );

}