// =========================================
// MOVIEBOX FEATURED LIST
// =========================================

let currentPage = 1;

let isLoading = false;

let hasMore = true;

const loadedMovieIds =
    new Set();

let featuredImageCount = 0;

let featuredObserver = null;


// =========================================
// FEATURED LIST CONFIG
// =========================================

const featuredLists = {

    "anime-series": {
        title: "Anime Series",
        description:
            "Explore popular anime series.",
        endpoint:
            "/movies/anime-series",
        type: "tv"
    },

    "animation": {
        title: "Animation",
        description:
            "Explore animated movies.",
        endpoint:
            "/movies/animation",
        type: "movie"
    },

    "korean": {
        title:
            "Korean Drama & Movies",
        description:
            "Explore Korean movies.",
        endpoint:
            "/movies/korean",
        type: "movie"
    },

    "marvel": {
        title:
            "The Marvel Universe",
        description:
            "Explore Marvel movies.",
        endpoint:
            "/movies/marvel",
        type: "movie"
    },

    "dc": {
        title:
            "The DC Universe",
        description:
            "Explore DC movies.",
        endpoint:
            "/movies/dc",
        type: "movie"
    }

};


// =========================================
// GET CURRENT LIST
// =========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const listType =
    params.get("type") ||
    "animation";

const currentList =
    featuredLists[listType];


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!currentList) {
            return;
        }

        document.getElementById(
            "featured-list-title"
        ).textContent =
            currentList.title;


        document.getElementById(
            "featured-list-description"
        ).textContent =
            currentList.description;


        loadFeaturedList(true);

        setupInfiniteScroll();


        if (
            typeof lucide !==
            "undefined"
        ) {

            lucide.createIcons();

        }

    }
);


// =========================================
// LOAD FEATURED LIST
// =========================================

async function loadFeaturedList(
    firstLoad = false
) {

    if (
        isLoading ||
        !hasMore ||
        !currentList
    ) {
        return;
    }


    const grid =
        document.getElementById(
            "featured-list-grid"
        );


    const loading =
        document.getElementById(
            "featured-list-loading"
        );


    if (!grid) {
        return;
    }


    isLoading = true;


    if (loading) {

        loading.classList.remove(
            "hidden"
        );

        loading.classList.add(
            "flex"
        );

    }


    try {

        if (firstLoad) {
            currentPage = 1;
            hasMore = true;
            loadedMovieIds.clear();
            featuredImageCount = 0;
        }

        const response =
            await apiGet(
                `${currentList.endpoint}?page=${currentPage}`
            );


        const movies =
            normalizeFeaturedResponse(
                response
            );


        if (firstLoad) {
            grid.innerHTML = "";
        }


        if (!movies.length) {

            hasMore = false;

            showFeaturedEnd();

            return;

        }


        let html = "";


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
                createFeaturedCard(
                    movie
                );

        });


        if (html) {

            grid.insertAdjacentHTML(
                "beforeend",
                html
            );

        }


        if (
            typeof lucide !==
            "undefined"
        ) {

            lucide.createIcons();

        }


        currentPage++;


        if (
            response &&
            Number.isFinite(Number(response.total_pages))
        ) {

            const pageLoaded =
                Number(response.page) ||
                currentPage - 1;

            hasMore =
                pageLoaded <
                Number(response.total_pages);

            if (!hasMore) {
                showFeaturedEnd();
            }

        }


    } catch (error) {

        console.error(
            "Featured List API Error:",
            error
        );

    } finally {

        isLoading = false;


        if (loading) {

            loading.classList.add(
                "hidden"
            );

            loading.classList.remove(
                "flex"
            );

        }

        // Re-arm after each request. If the sentinel stayed visible while
        // the previous request was loading, IntersectionObserver may not
        // emit another intersection event by itself.
        if (hasMore) {
            setupInfiniteScroll();
        }

    }

}
// =========================================
// NORMALIZE RESPONSE
// =========================================

function normalizeFeaturedResponse(data) {

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
// CREATE FEATURED CARD
// =========================================

function createFeaturedCard(movie) {

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
    // MOVIE / SERIES
    // =========================

    const isTV =
        movie.media_type === "tv" ||
        movie.mediaType === "tv" ||
        !!movie.first_air_date ||
        !!movie.number_of_seasons;


    const typeLabel =
        isTV
            ? "SERIES"
            : "MOVIE";


    // =========================
    // TARGET URL
    // =========================

    let targetUrl;


    if (isTV) {

        targetUrl =
            `series.html?series=${safeId}&from=featured-list&type=${encodeURIComponent(listType)}`;

    } else {

        targetUrl =
            `index.html?movie=${safeId}&from=featured-list&type=${encodeURIComponent(listType)}`;

    }


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

    const imagePriority = featuredImageCount < 6 ? 'eager' : 'lazy';
    const fetchPriority = featuredImageCount < 4 ? 'high' : 'auto';
    featuredImageCount++;

    return `
        <article
            class="movie-card group cursor-pointer"
            onclick="window.location.replace('${targetUrl}')"
        >

            <!-- POSTER -->

            <div
                class="relative overflow-hidden rounded-xl bg-white/5"
            >

                ${
                    posterUrl
                        ? `
                            <img
                                src="${escapeHtml(posterUrl)}"
                                alt="${safeTitle}"
                                class="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="${imagePriority}"
                                fetchpriority="${fetchPriority}"
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


                <!-- TYPE + YEAR -->

                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">

                    <!-- TYPE -->

                    <span
                        class="rounded-md ${
                            isTV
                                ? "bg-purple-500/15 text-purple-300"
                                : "bg-orange-500/15 text-orange-300"
                        } px-2 py-1 font-bold"
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
// INFINITE SCROLL
// =========================================

function setupInfiniteScroll() {

    const sentinel =
        document.getElementById(
            "featured-list-sentinel"
        );


    if (!sentinel) {

        console.error(
            "Featured List sentinel not found."
        );

        return;

    }


    if (featuredObserver) {
        featuredObserver.disconnect();
        featuredObserver = null;
    }


    if (!hasMore) {
        return;
    }


    featuredObserver =
        new IntersectionObserver(
            entries => {

                const entry = entries[0];

                if (
                    entry &&
                    entry.isIntersecting &&
                    !isLoading &&
                    hasMore
                ) {

                    loadFeaturedList();

                }

            },
            {
                root: null,
                rootMargin: "1200px 0px",
                threshold: 0
            }
        );


    featuredObserver.observe(sentinel);

}
// =========================================
// END MESSAGE
// =========================================

function showFeaturedEnd() {

    const end =
        document.getElementById(
            "featured-list-end"
        );


    if (!end) {
        return;
    }


    end.classList.remove(
        "hidden"
    );

}