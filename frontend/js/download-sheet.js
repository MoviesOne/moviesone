// ======================================================
// MOVIEBOX DOWNLOAD SHEET
// DOWNLOAD ENDPOINTS + SHATTER ANIMATION
// ======================================================
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
                "MovieBox: Download sheet not found."
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

(function () {

    let initialized = false;


    // ==================================================
    // INITIALIZE
    // ==================================================

    function initDownloadSheet() {

        if (initialized) {
            return;
        }

        const sheet =
            document.querySelector("#downloadSheet");

        if (!sheet) {
            return;
        }

        initialized = true;

        console.log(
            "MovieBox: Download Sheet Loaded"
        );


        // ==================================================
        // DOWNLOAD CARD CLICK
        // ==================================================

        document.addEventListener(
            "click",
            function (event) {
const closeButton =
    event.target.closest(
        "#downloadSheet [data-download-close]"
    );

if (closeButton) {

    if (
        typeof window.closeDownloadSheet ===
        "function"
    ) {
        window.closeDownloadSheet();
    }

    sessionStorage.removeItem(
        "movieboxDownloadContext"
    );

    return;
}
                const card =
                    event.target.closest(
                        "#downloadSheet .anime-card"
                    );

                if (!card) {
                    return;
                }


                const option =
                    Number(
                        card.getAttribute(
                            "data-download-option"
                        )
                    );


                if (
                    !option ||
                    option < 1 ||
                    option > 6
                ) {
                    console.warn(
                        "MovieBox: Invalid Download Option",
                        option
                    );

                    return;
                }


                console.log(
                    "MovieBox: Download Option",
                    option
                );


                // ==================================================
                // START SHATTER
                // ==================================================

                playDownloadCardShatter(card);


                // ==================================================
                // GET DOWNLOAD CONTEXT
                // ==================================================

                const context =
                    window.MovieBoxDownloadSheet?.context;


                    sessionStorage.setItem(
    "movieboxDownloadContext",
    JSON.stringify(context)
);
                if (!context) {

                    console.warn(
                        "MovieBox: Download Context Missing"
                    );

                    return;
                }


                // ==================================================
                // BUILD DOWNLOAD URL
                // ==================================================

                const url =
                    buildDownloadUrl(
                        option,
                        context
                    );


                if (!url) {

                    console.warn(
                        "MovieBox: Download URL Missing",
                        context
                    );

                    alert(
                        "Download option is not available."
                    );

                    return;
                }


                console.log(
                    "MovieBox: Download URL",
                    url
                );


    

                // ==================================================
                // OPEN DOWNLOAD
                // IMPORTANT:
                // NO 760ms DELAY HERE
                // ==================================================

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            },
            false
        );
    }


    // ==================================================
    // COMPONENT LOADED
    // ==================================================

    document.addEventListener(
        "download-options:loaded",
        initDownloadSheet
    );


    // ==================================================
    // NORMAL DOM LOAD
    // ==================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initDownloadSheet
        );

    } else {

        initDownloadSheet();

    }

})();



// ======================================================
// DOWNLOAD URL BUILDER
// ALL ENDPOINTS ARE HERE
// ======================================================

function buildDownloadUrl(
    option,
    context
) {

    const tmdbId =
        context?.tmdbId ||
        null;

    const imdbId =
        context?.imdbId ||
        null;

    const downloadId =
        tmdbId ||
        imdbId ||
        null;

    const season =
        context?.season;

    const episode =
        context?.episode;


    // ==================================================
    // 1. SCREENSCOPE
    // ==================================================

    if (option === 1) {

        if (!tmdbId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            return (
                "https://nxsha.screenscape.me/download/tv/" +
                encodeURIComponent(tmdbId)
            );

        }

        return (
            "https://nxsha.screenscape.me/download/movie/" +
            encodeURIComponent(tmdbId)
        );
    }


    // ==================================================
    // 2. 02 MDR
    // ==================================================

    if (option === 2) {

        if (!tmdbId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            if (
                season == null ||
                episode == null
            ) {
                return null;
            }

            return (
                "https://02moviedownloader.site/api/download/tv/" +
                encodeURIComponent(tmdbId) +
                "/" +
                encodeURIComponent(season) +
                "/" +
                encodeURIComponent(episode)
            );

        }

        return (
            "https://02moviedownloader.site/api/download/movie/" +
            encodeURIComponent(tmdbId)
        );
    }


    // ==================================================
    // 3. NHD
    // ==================================================

    if (option === 3) {

        if (!downloadId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            if (
                season == null ||
                episode == null
            ) {
                return null;
            }

            return (
                "https://nhdapi.com/dl/tv/" +
                encodeURIComponent(downloadId) +
                "/" +
                encodeURIComponent(season) +
                "/" +
                encodeURIComponent(episode)
            );

        }

        return (
            "https://nhdapi.com/dl/movie/" +
            encodeURIComponent(downloadId)
        );
    }


    // ==================================================
    // 4. STREAMRIP
    // ==================================================

    if (option === 4) {

        if (!tmdbId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            if (
                season == null ||
                episode == null
            ) {
                return null;
            }

            return (
                "https://streamrip.fun/tv/" +
                encodeURIComponent(tmdbId) +
                "/" +
                encodeURIComponent(season) +
                "/" +
                encodeURIComponent(episode)
            );

        }

        return (
            "https://streamrip.fun/movie/" +
            encodeURIComponent(tmdbId)
        );
    }


    // ==================================================
    // 5. DDL
    // ==================================================

    if (option === 5) {

        if (!tmdbId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            if (
                season == null ||
                episode == null
            ) {
                return null;
            }

            return (
                "https://ddl.cinextream.cc/tv/" +
                encodeURIComponent(tmdbId) +
                "/" +
                encodeURIComponent(season) +
                "/" +
                encodeURIComponent(episode)
            );

        }

        return (
            "https://ddl.cinextream.cc/movie/" +
            encodeURIComponent(tmdbId)
        );
    }


    // ==================================================
    // 6. NXSHA
    // ==================================================

    if (option === 6) {

        if (!downloadId) {
            return null;
        }

        if (
            context.type ===
            "series"
        ) {

            if (
                season == null ||
                episode == null
            ) {
                return null;
            }

            return (
                "https://nxsha.space/dl/tv/" +
                encodeURIComponent(downloadId) +
                "/" +
                encodeURIComponent(season) +
                "/" +
                encodeURIComponent(episode)
            );

        }

        return (
            "https://nxsha.space/dl/movie/" +
            encodeURIComponent(downloadId)
        );
    }


    return null;
}



// ======================================================
// SHATTER ANIMATION
// ======================================================

function playDownloadCardShatter(card) {

    if (!card) {
        return;
    }


    // ==================================================
    // CARD SHAKE
    // ==================================================

    card.classList.remove(
        "shatter-shake"
    );

    void card.offsetWidth;

    card.classList.add(
        "shatter-shake"
    );


    // ==================================================
    // OPTION 6 KUNAI
    // ==================================================

    if (
        card.classList.contains(
            "anime-kunai-card"
        )
    ) {

        card.classList.remove(
            "kunai-clashing"
        );

        void card.offsetWidth;

        card.classList.add(
            "kunai-clashing"
        );
    }


    // ==================================================
    // COLORS
    // ==================================================

    const colorPalette = (
        card.getAttribute(
            "data-shatter-colors"
        ) ||
        "#ffffff,#ff2222"
    )
        .split(",")
        .map(
            color => color.trim()
        )
        .filter(Boolean);


    // ==================================================
    // CARD POSITION
    // ==================================================

    const cardRect =
        card.getBoundingClientRect();


    // ==================================================
    // EXPLOSION TARGETS
    // ==================================================

    const targets =
        card.querySelectorAll(
            ".explode-target"
        );


    console.log(
        "MovieBox: Explosion Targets =",
        targets.length
    );


    // ==================================================
    // EXPLODE TARGETS
    // ==================================================

    targets.forEach(
        target => {

            target.classList.remove(
                "icon-exploding"
            );

            void target.offsetWidth;

            target.classList.add(
                "icon-exploding"
            );


            const targetRect =
                target.getBoundingClientRect();


            const originX =
                (
                    targetRect.left -
                    cardRect.left
                ) +
                targetRect.width / 2;


            const originY =
                (
                    targetRect.top -
                    cardRect.top
                ) +
                targetRect.height / 2;


            createShatterBlast(
                card,
                originX,
                originY,
                colorPalette
            );

        }
    );


    // ==================================================
    // FALLBACK EXPLOSION
    // ==================================================

    if (
        targets.length === 0
    ) {

        createShatterBlast(
            card,
            cardRect.width * 0.35,
            cardRect.height * 0.5,
            colorPalette
        );

    }


    // ==================================================
    // CLEANUP
    // ==================================================

    setTimeout(
        () => {

            card.classList.remove(
                "shatter-shake"
            );

            card.classList.remove(
                "kunai-clashing"
            );


            targets.forEach(
                target => {

                    target.classList.remove(
                        "icon-exploding"
                    );

                }
            );

        },
        760
    );
}



// ======================================================
// SHATTER PARTICLES
// ======================================================

function createShatterBlast(
    parentCard,
    originX,
    originY,
    colors
) {

    const pieceCount = 30;


    for (
        let i = 0;
        i < pieceCount;
        i++
    ) {

        const piece =
            document.createElement(
                "span"
            );


        piece.className =
            "shatter-piece";


        const width =
            Math.floor(
                Math.random() * 6
            ) + 3;


        const height =
            Math.floor(
                Math.random() * 6
            ) + 3;


        piece.style.width =
            width + "px";

        piece.style.height =
            height + "px";


        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        piece.style.background =
            color;


        piece.style.boxShadow =
            `0 0 5px ${color},
             0 0 10px ${color}`;


        piece.style.left =
            (
                originX -
                width / 2
            ) + "px";


        piece.style.top =
            (
                originY -
                height / 2
            ) + "px";


        parentCard.appendChild(
            piece
        );


        // ==================================================
        // RANDOM DIRECTION
        // ==================================================

        const angle =
            Math.random() *
            Math.PI *
            2;


        const blastForce =
            Math.random() *
            100 +
            40;


        const destX =
            Math.cos(angle) *
            blastForce;


        const destY =
            Math.sin(angle) *
            blastForce;


        const rotate =
            Math.random() *
            900 -
            450;


        // ==================================================
        // ANIMATION
        // ==================================================

        const animation =
            piece.animate(
                [
                    {
                        transform:
                            "translate3d(0,0,0) scale(1) rotate(0deg)",
                        opacity: 1
                    },

                    {
                        transform:
                            `translate3d(
                                ${destX * 0.35}px,
                                ${destY * 0.35}px,
                                0
                            )
                            scale(1.4)
                            rotate(${rotate * 0.4}deg)`,

                        opacity: 1,

                        offset: 0.25
                    },

                    {
                        transform:
                            `translate3d(
                                ${destX}px,
                                ${destY}px,
                                0
                            )
                            scale(0)
                            rotate(${rotate}deg)`,

                        opacity: 0
                    }
                ],
                {
                    duration:
                        Math.random() * 180 + 500,

                    easing:
                        "cubic-bezier(.12,.85,.3,1)",

                    fill: "forwards"
                }
            );


        animation.onfinish =
            () => {

                piece.remove();

            };

    }
}