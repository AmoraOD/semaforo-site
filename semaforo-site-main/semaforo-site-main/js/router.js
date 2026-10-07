const fragmentCache = new Map();

async function loadFragment(path) {
    if (fragmentCache.has(path)) return fragmentCache.get(path);

    const res = await fetch(path);
    if (!res.ok)
        throw new Error(`Erro ${res.status} ao carregar ${path}`);

    const html = await res.text();
    fragmentCache.set(path, html);

    return html;
}

class Router {
    constructor(routes) {
        this.routes = routes;
        this.root = document.getElementById("root");
        this.defaultRoute = "/";
        this.init();
    }

    init() {
        window.addEventListener("hashchange", () => this.handleRouteChange());

        if (!window.location.hash) {
            window.location.replace("#" + this.defaultRoute);
        }

        queueMicrotask(() => this.handleRouteChange());
    }

    /* Devolve a rota atual normalizada: "/", "/jogo", etc. */
    getCurrentPath() {
        const raw = window.location.hash.slice(1); // remove "#"
        return raw === "" ? "/" : raw;
    }

    updateActiveLinks(path) {
        document.querySelectorAll("a[data-route]").forEach((a) => {
            const href = a.getAttribute("href") || "";
            const isActive = href === `#${path}`;
            a.classList.toggle("active", isActive);
            if (isActive) a.setAttribute("aria-current", "page");
            else a.removeAttribute("aria-current");
        });
    }

    async handleRouteChange() {
        const currentPath = this.getCurrentPath();
        const route = this.routes[currentPath] || this.routes["/404"];

        if (!route) {
            console.error(`Rota "${currentPath}" não encontrada e sem fallback "/404".`);
            return;
        }

        this.updateActiveLinks(currentPath);

        try {
            await route();
            window.scrollTo({ top: 0, behavior: "auto" });
        } catch (err) {
            console.error(err);
            this.root.innerHTML =
                `<section class="frame"><h2>Ops!</h2>
                 <p>Não foi possível carregar esta página.</p></section>`;
        }
    }
}

const router = new Router({
    "/": async () => {
        document.getElementById("root").innerHTML =
            await loadFragment("pages/inicio.html");
    },

    "/como-funciona": async () => {
        document.getElementById("root").innerHTML =
            await loadFragment("pages/como-funciona.html");
    },

    "/jogo": async () => {
        document.getElementById("root").innerHTML =
            await loadFragment("pages/jogo.html");

        if (window.pageInit && typeof window.pageInit.jogo === "function") {
            window.pageInit.jogo();
        }
    },

    "/informacoes": async () => {
        document.getElementById("root").innerHTML =
            await loadFragment("pages/informativos.html");
    },

    "/404": () => {
        document.getElementById("root").innerHTML =
            `<section class="frame"><h2>404</h2>
             <p>Página não encontrada.</p></section>`;
    }
});