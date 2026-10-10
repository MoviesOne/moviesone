/* =========================================
   MOVIEBOX SEO HELPERS
   ========================================= */
(function () {
    const params = new URLSearchParams(window.location.search);

    const STATIC_SEO = {
        "index.html": {
            title: "MoviesOne - Movies & TV Series",
            description: "Discover movies and TV series on MovieBox with trending, popular, new releases, genres and streaming options."
        },
        "popular.html": {
            title: "Popular Movies - MoviesOne",
            description: "Browse popular movies on MovieBox, with ratings, release information and movie details."
        },
        "new-releases.html": {
            title: "New Releases - MovieOne",
            description: "Explore the latest movie releases on MovieBox and discover recently added titles."
        },
        "trending-tv.html": {
            title: "Trending TV Shows - MovieOne",
            description: "Discover trending TV shows and series on MovieBox, including ratings, release dates and details."
        },
        "featured-list.html": {
            title: "Featured Lists - MoviesOne",
            description: "Explore curated movie and TV collections on MovieBox."
        },
        "series.html": {
            title: "TV Series - MoviesOne",
            description: "Watch and explore TV series on MovieBox with seasons, episodes and streaming options."
        }
    };

    function upsertMeta(name, content) {
        if (!content) return;
        let node = document.querySelector(`meta[name="${name}"]`);
        if (!node) {
            node = document.createElement("meta");
            node.setAttribute("name", name);
            document.head.appendChild(node);
        }
        node.setAttribute("content", content);
    }

    function upsertProperty(property, content) {
        if (!content) return;
        let node = document.querySelector(`meta[property="${property}"]`);
        if (!node) {
            node = document.createElement("meta");
            node.setAttribute("property", property);
            document.head.appendChild(node);
        }
        node.setAttribute("content", content);
    }

    function upsertCanonical(url) {
        let node = document.querySelector('link[rel="canonical"]');
        if (!node) {
            node = document.createElement("link");
            node.setAttribute("rel", "canonical");
            document.head.appendChild(node);
        }
        node.setAttribute("href", url);
    }

    function upsertJsonLd(data) {
        let node = document.getElementById("moviebox-seo-jsonld");
        if (!node) {
            node = document.createElement("script");
            node.id = "moviebox-seo-jsonld";
            node.type = "application/ld+json";
            document.head.appendChild(node);
        }
        node.textContent = JSON.stringify(data);
    }

    function cleanText(value, fallback = "") {
        return String(value || fallback).replace(/\s+/g, " ").trim();
    }

    function getBaseUrl() {
        return window.location.origin;
    }

    function getCanonicalForCurrentPage() {
        const url = new URL(window.location.href);
        const pathname = url.pathname || "/";
        const movieId = params.get("movie");
        const seriesId = params.get("series");
        const tvId = params.get("tv");

        if (movieId) {
            return `${getBaseUrl()}${pathname}?movie=${encodeURIComponent(movieId)}`;
        }

        if (seriesId) {
            return `${getBaseUrl()}${pathname}?series=${encodeURIComponent(seriesId)}`;
        }

        if (tvId) {
            return `${getBaseUrl()}${pathname}?tv=${encodeURIComponent(tvId)}`;
        }

        return `${getBaseUrl()}${pathname === "/index.html" ? "/" : pathname}`;
    }

    function applyStaticSeo() {
        const key = window.location.pathname.split("/").pop() || "index.html";
        const config = STATIC_SEO[key] || STATIC_SEO["index.html"];
        const isDynamic = params.has("movie") || params.has("series") || params.has("tv");

        if (!isDynamic) {
            document.title = config.title;
            upsertMeta("description", config.description);
        }

        upsertMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
        upsertCanonical(getCanonicalForCurrentPage());

        upsertProperty("og:type", "website");
        upsertProperty("og:title", document.title || config.title);
        upsertProperty("og:description", config.description);
        upsertProperty("og:url", getCanonicalForCurrentPage());
        upsertProperty("og:site_name", "MovieBox");

        upsertJsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MoviesOne",
            "url": getBaseUrl(),
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${getBaseUrl()}/index.html?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        });
    }

    function applyMovieSeo(movie, mediaType = "movie") {
        if (!movie) return;

        const title = cleanText(movie.title || movie.name || movie.original_title, "Movie");
        const overview = cleanText(movie.overview || movie.description, `Explore ${title} on MovieBox.`);
        const releaseDate = cleanText(movie.release_date || movie.first_air_date);
        const year = releaseDate.slice(0, 4);
        const rating = movie.vote_average ?? movie.rating;
        const description = cleanText(
            overview.length > 155 ? `${overview.slice(0, 152)}...` : overview
        );
        const canonical = getCanonicalForCurrentPage();
        const poster = movie.poster || movie.poster_path || movie.posterUrl || "";
        const image = poster.startsWith("http") ? poster : "";
        const isTv = mediaType === "tv" || movie.media_type === "tv";
        const schemaType = isTv ? "TVSeries" : "Movie";

        document.title = `${title}${year ? ` (${year})` : ""} - MoviesOne`;
        upsertMeta("description", description);
        upsertCanonical(canonical);
        upsertProperty("og:type", "video.tv_show");
        upsertProperty("og:title", document.title);
        upsertProperty("og:description", description);
        upsertProperty("og:url", canonical);
        if (image) upsertProperty("og:image", image);

        const schema = {
            "@context": "https://schema.org",
            "@type": schemaType,
            "name": title,
            "description": overview,
            "url": canonical,
            "image": image || undefined,
            "dateCreated": releaseDate || undefined,
            "aggregateRating": rating != null && Number.isFinite(Number(rating)) ? {
                "@type": "AggregateRating",
                "ratingValue": Number(rating).toFixed(1),
                "bestRating": "10",
                "worstRating": "0",
                "ratingCount": movie.vote_count || movie.voteCount || undefined
            } : undefined
        };

        if (!schema.aggregateRating?.ratingCount) {
            delete schema.aggregateRating;
        }
        if (!schema.image) delete schema.image;
        if (!schema.dateCreated) delete schema.dateCreated;

        upsertJsonLd(schema);
    }

    window.MoviesOneSEO = {
        applyStaticSeo,
        applyMovieSeo,
        getCanonicalForCurrentPage
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyStaticSeo, { once: true });
    } else {
        applyStaticSeo();
    }
})();
