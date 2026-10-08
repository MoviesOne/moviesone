// =========================================
// TRENDING TV - INFINITE SCROLL
// =========================================

let currentPage = 1;
let isLoading = false;
let hasMore = true;

const loadedTVIds = new Set();


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "MovieBox Trending TV loading..."
    );


    const grid =
        document.getElementById(
            "trending-tv-grid"
        );


    if (!grid) {

        console.error(
            "Trending TV grid not found."
        );

        return;
    }


    loadTrendingTV(true);

    setupInfiniteScroll();

    setupSearch();

});


// =========================================
// LOAD TRENDING TV
// =========================================

async function loadTrendingTV(
    firstLoad = false
) {

    if (
        isLoading ||
        !hasMore
    ) {

        return;

    }


    const grid =
        document.getElementById(
            "trending-tv-grid"
        );


    const loading =
        document.getElementById(
            "trending-tv-loading"
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

        console.log(
            "Loading Trending TV page:",
            currentPage
        );


        const response =
            await apiGet(
                `/movies/trending-tv?page=${currentPage}`
            );


        const shows =
            normalizeTVResponse(
                response
            );


        console.log(
            `Received ${shows.length} TV shows`
        );


        if (firstLoad) {

            grid.innerHTML = "";

        }


        if (!shows.length) {

            hasMore = false;

            showEndMessage();

            return;

        }


        let html = "";

        let addedShows = 0;


        shows.forEach(show => {

            const id =
                show.tmdbId ||
                show.id ||
                show.tmdb_id ||
                show.seriesId;


            if (!id) {
                return;
            }


            const numericId =
                Number(id);


            if (!numericId) {
                return;
            }


            if (
                loadedTVIds.has(
                    numericId
                )
            ) {

                return;

            }


            loadedTVIds.add(
                numericId
            );


            html +=
                createTVCard(show);


            addedShows++;

        });


        if (html) {

            grid.insertAdjacentHTML(
                "beforeend",
                html
            );

        }


        console.log(
            `Added ${addedShows} TV shows from page ${currentPage}`
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
            "Trending TV API Error:",
            error
        );


        if (firstLoad) {

            grid.innerHTML = `
                <div class="col-span-full py-20 text-center">

                    <p class="text-lg font-semibold text-white/60">
                        Failed to load TV shows.
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

            loading.classList.add(
                "hidden"
            );

            loading.classList.remove(
                "flex"
            );

        }

    }

}


// =========================================
// INFINITE SCROLL
// =========================================

function setupInfiniteScroll() {

    const sentinel =
        document.getElementById(
            "trending-tv-sentinel"
        );


    if (!sentinel) {

        console.error(
            "Trending TV sentinel not found."
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

                    loadTrendingTV();

                }

            },
            {
                rootMargin:
                    "500px 0px"
            }
        );


    observer.observe(
        sentinel
    );

}


// =========================================
// END MESSAGE
// =========================================

function showEndMessage() {

    const end =
        document.getElementById(
            "trending-tv-end"
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

function normalizeTVResponse(data) {

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
        Array.isArray(data.shows)
    ) {

        return data.shows;

    }


    if (
        Array.isArray(data.tv)
    ) {

        return data.tv;

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
// TV CARD
// =========================================

function createTVCard(show) {

    const id =
        show.tmdbId ||
        show.id ||
        show.tmdb_id ||
        show.seriesId;


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
        show.title ||
        show.name ||
        show.original_title ||
        show.original_name ||
        "Unknown Title";


    // =========================
    // POSTER
    // =========================

    const poster =
        show.poster ||
        show.poster_path ||
        show.posterPath ||
        show.image ||
        "";


    const posterUrl =
        poster.startsWith("http")
            ? poster
            : `https://image.tmdb.org/t/p/w500${poster}`;


    // =========================
    // RATING
    // =========================

    const rating =
        show.imdb_rating ??
        show.imdbRating ??
        show.rating ??
        show.vote_average ??
        show.score ??
        null;


    // =========================
    // YEAR
    // =========================

    const releaseDate =
        show.first_air_date ||
        show.release_date ||
        show.releaseDate ||
        "";


    const year =
        releaseDate
            ? String(releaseDate).slice(0, 4)
            : (
                show.year ||
                ""
            );


    // =========================
    // TYPE
    // =========================

    const typeLabel = "SERIES";


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
            onclick="window.location.href='series.html?series=${safeId}&from=trending-tv'"
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
            "trending-tv-search"
        );


    if (!input) {
        return;
    }


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