const header      = document.getElementById("principal-menu");
const menu_toggle = document.querySelector('.menu-toggle');
const menu        = document.getElementById('menu-links');

document.addEventListener("DOMContentLoaded", function () {
    if (!menu_toggle || !menu) return;

    function openMenu() {
        menu.classList.add('open');
        menu_toggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        menu.classList.remove('open');
        menu_toggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        menu.classList.contains('open') ? closeMenu() : openMenu();
    }

    menu_toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    /* Fecha ao clicar em qualquer link do menu */
    menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
    });

    /* Fecha ao clicar fora */
    document.addEventListener("click", function (e) {
        if (!menu.classList.contains("open")) return;
        if (menu.contains(e.target) || menu_toggle.contains(e.target)) return;
        closeMenu();
    });

    /* Fecha com ESC */
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
    });

    /* Ao voltar para desktop, garante que o menu não fique "preso" aberto */
    window.addEventListener("resize", function () {
        if (window.innerWidth > 760) closeMenu();
    });

    /* Header ganha sombra ao rolar (fica "fixo" e destacado) */
    if (header) {
        const onScroll = () =>
            header.classList.toggle("is-scrolled", window.scrollY > 4);

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }
});