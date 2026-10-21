/*
 * Contagens regressivas da Black November.
 * <div class="bn-countdown" data-start="..." data-end="..."> conta até o início
 * e, depois que a campanha começa, até o fim dela.
 */
(function () {
  var UNITS = ["days", "hours", "minutes", "seconds"];
  var LABELS = { days: "Dias", hours: "Horas", minutes: "Minutos", seconds: "Segundos" };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function setup(el) {
    var start = new Date(el.getAttribute("data-start")).getTime();
    var end = new Date(el.getAttribute("data-end")).getTime();
    var title = document.createElement("p");
    var items = document.createElement("div");
    var digits = {};

    title.className = "bn-countdown__title";
    items.className = "bn-countdown__items";
    UNITS.forEach(function (unit) {
      var item = document.createElement("div");
      item.className = "bn-countdown__item";
      item.innerHTML = '<span class="bn-countdown__digits">00</span><span class="bn-countdown__label">' + LABELS[unit] + "</span>";
      digits[unit] = item.firstChild;
      items.appendChild(item);
    });
    el.innerHTML = "";
    el.appendChild(title);
    el.appendChild(items);

    var phase;
    function tick() {
      var now = Date.now();
      var next = now < start ? "before" : now < end ? "during" : "after";
      if (next !== phase) {
        phase = next;
        title.innerHTML =
          phase === "before"
            ? "A <strong>Black November</strong> começa em:"
            : phase === "during"
              ? "A <strong>Black November</strong> termina em:"
              : "A <strong>Black November</strong> foi encerrada";
        items.style.display = phase === "after" ? "none" : "";
      }
      if (phase === "after") return clearInterval(timer);

      var s = Math.max(0, Math.floor(((phase === "before" ? start : end) - now) / 1000));
      digits.days.textContent = pad(Math.floor(s / 86400));
      digits.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      digits.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      digits.seconds.textContent = pad(s % 60);
    }

    var timer = setInterval(tick, 1000);
    tick();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(".bn-countdown"), setup);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/*
 * Pop-up "Saiba mais" dos cursos: cada card traz um <template id="bn-course-<id>">
 * com os detalhes, copiados para o modal ao clicar.
 */
(function () {
  function init() {
    var modal = document.getElementById("bn-course-modal");
    if (!modal) return;
    var image = modal.querySelector(".bn-modal__image");
    var title = modal.querySelector(".bn-modal__title");
    var content = modal.querySelector(".bn-modal__content");
    var opener = null;

    function open(button) {
      var card = button.closest(".bn-course");
      var source = card.querySelector(".bn-course__media img");
      var template = document.getElementById("bn-course-" + button.getAttribute("data-course"));
      image.src = source.src;
      image.alt = source.alt;
      title.textContent = card.querySelector(".bn-course__title").textContent;
      content.innerHTML = "";
      content.appendChild(template.content.cloneNode(true));
      opener = button;
      modal.hidden = false;
      document.documentElement.style.overflow = "hidden";
      modal.querySelector(".bn-modal__close").focus();
    }

    function close() {
      modal.hidden = true;
      document.documentElement.style.overflow = "";
      if (opener) opener.focus();
    }

    document.addEventListener("click", function (e) {
      var button = e.target.closest(".bn-course__button");
      if (button) return open(button);
      if (!modal.hidden && e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/*
 * O Swiper do Elementor inicia quando a seção entra em vista. Ativa autoHeight
 * após essa inicialização e mede novamente ao trocar de slide, carregar fotos,
 * fontes ou alterar a largura. Cada comentário mantém sua altura natural.
 */
(function () {
  function init() {
    var root = document.querySelector(".elementor-element-cd572b4");
    var viewport = root && root.querySelector(".elementor-main-swiper");
    if (!viewport) return;
    var bound = null;
    var frame = 0;
    var sizes = null;
    var options = { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] };

    function update() {
      frame = 0;
      if (bound && !bound.destroyed) bound.updateAutoHeight();
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function bind() {
      var swiper = viewport.swiper;
      if (!swiper || swiper.destroyed || bound === swiper) return;
      bound = swiper;
      observer.disconnect();
      swiper.params.autoHeight = true;
      swiper.originalParams.autoHeight = true;
      viewport.classList.add("swiper-autoheight");
      ["slideChange", "slideChangeTransitionStart", "transitionEnd", "resize", "observerUpdate"].forEach(function (event) {
        swiper.on(event, schedule);
      });
      root.addEventListener("load", schedule, true);
      if (window.ResizeObserver) {
        sizes = new ResizeObserver(schedule);
        root.querySelectorAll(".elementor-testimonial").forEach(function (card) {
          sizes.observe(card);
        });
      }
      if (document.fonts) document.fonts.ready.then(schedule);
      swiper.on("destroy", function () {
        if (sizes) sizes.disconnect();
        root.removeEventListener("load", schedule, true);
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        bound = null;
        observer.observe(viewport, options);
      });
      schedule();
    }

    var observer = new MutationObserver(bind);
    observer.observe(viewport, options);
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
