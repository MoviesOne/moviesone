
const APP_THEMES = {
    classic: "#ff4d00",
    ocean: "#0891b2",
    sunset: "#f97316",
    forest: "#16a34a",
    violet: "#a855f7",
    candy: "#ec4899",
    midnight: "#4f46e5",
    "indigo-mist": "#6366f1",
    "emerald-forest": "#0d9488",
    rosewood: "#e11d48",
    bubblegum: "#f472b6"
};

function saveAppearance(key, value) {
    try {
        localStorage.setItem("moviebox-" + key, value);
    } catch (error) {
        console.warn("Could not save appearance setting:", error);
    }
}

function setDisplayMode(mode) {
    if (!["light", "dark"].includes(mode)) return;

    document.body.dataset.displayMode = mode;
    saveAppearance("display-mode", mode);

    document.querySelectorAll(".appearance-choice").forEach(button => {
        button.classList.toggle("selected", button.dataset.mode === mode);
    });
}

function setTheme(theme) {
    if (!Object.prototype.hasOwnProperty.call(APP_THEMES, theme)) return;

    const color = APP_THEMES[theme];
    document.documentElement.style.setProperty("--app-accent", color);
    document.body.dataset.theme = theme;
    saveAppearance("theme", theme);

    document.querySelectorAll(".theme-choice").forEach(button => {
        button.classList.toggle("selected", button.dataset.theme === theme);
    });
}

function setCustomTheme(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;

    document.documentElement.style.setProperty("--app-accent", color);
    document.body.dataset.theme = "custom";
    saveAppearance("custom-color", color);
    saveAppearance("theme", "custom");

    document.querySelectorAll(".theme-choice").forEach(button => {
        button.classList.remove("selected");
    });
}

function setAppFont(font) {
    const allowedFonts = [
        "Outfit",
        "Plus Jakarta Sans",
        "Rajdhani",
        "Arial",
        "Georgia"
    ];

    if (!allowedFonts.includes(font)) return;

    document.documentElement.style.setProperty(
        "--app-font",
        `"${font}", sans-serif`
    );
    document.body.style.fontFamily = "var(--app-font)";
    saveAppearance("font", font);

    const fontSelect = document.getElementById("app-font");
    if (fontSelect) fontSelect.value = font;

    if (font === "Outfit") {
        loadGoogleFont("Outfit");
    } else if (font === "Rajdhani") {
        loadGoogleFont("Rajdhani");
    }
}

function loadGoogleFont(font) {
    const fontUrls = {
        Outfit: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap",
        Rajdhani: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap"
    };

    if (!fontUrls[font]) return;

    const id = "google-font-" + font.toLowerCase().replace(/\s+/g, "-");
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontUrls[font];
    document.head.appendChild(link);
}

function loadAppearanceSettings() {
    let mode = "dark";
    let theme = "classic";
    let font = "Outfit";
    let customColor = "#ff4d00";

    try {
        mode = localStorage.getItem("moviebox-display-mode") || mode;
        theme = localStorage.getItem("moviebox-theme") || theme;
        font = localStorage.getItem("moviebox-font") || font;
        customColor = localStorage.getItem("moviebox-custom-color") || customColor;
    } catch (error) {
        console.warn("Could not load appearance settings:", error);
    }

    setDisplayMode(mode);
    if (theme === "custom") {
        setCustomTheme(customColor);
    } else {
        setTheme(theme);
    }
    setAppFont(font);

    const customInput = document.getElementById("custom-color");
    if (customInput) customInput.value = customColor;
}

document.addEventListener("DOMContentLoaded", loadAppearanceSettings);