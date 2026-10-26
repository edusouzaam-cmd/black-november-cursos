/* Contagem regressiva até o encerramento da oferta. */
(function () {
  var UNITS = ["days", "hours", "minutes", "seconds"];
  var LABELS = { days: "Dias", hours: "Horas", minutes: "Minutos", seconds: "Segundos" };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function setup(el) {
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
      var next = now < end ? "during" : "after";
      if (next !== phase) {
        phase = next;
        title.innerHTML =
          phase === "during" ? "A oferta finaliza em:" : "Oferta encerrada";
        items.style.display = phase === "after" ? "none" : "";
      }
      if (phase === "after") return clearInterval(timer);

      var s = Math.max(0, Math.floor((end - now) / 1000));
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

/* Janelas do conteúdo programático dos cursos. */
(function () {
 function init() {
  document.querySelectorAll("[data-curriculum]").forEach(function(opener) {
   var id = opener.getAttribute("data-curriculum");
   var dialog = document.getElementById("bn-" + id + "-curriculum");
   if (!dialog || typeof dialog.showModal !== "function") return;
   var previousOverflow;
   opener.addEventListener("click", function(event) {
    event.preventDefault(); previousOverflow = document.documentElement.style.overflow;
    dialog.showModal(); dialog.scrollTop = 0; document.documentElement.style.overflow = "hidden";
   });
   dialog.querySelector("[data-curriculum-close], [data-pcm-close]").addEventListener("click", function() { dialog.close(); });
   dialog.addEventListener("click", function(event) {
    if(event.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
   });
   dialog.addEventListener("close", function() { document.documentElement.style.overflow = previousOverflow || ""; opener.focus(); });
  });
 }
 if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

/* Abre qualquer bônus por inteiro na camada superior, fora do recorte do carrossel. */
(function () {
 function init() {
  var root=document.querySelector(".bn-bonus--carousel");
  if(!root)return;
  var dialog=document.createElement("dialog");
  dialog.className="bn-bonus-dialog";
  dialog.setAttribute("aria-labelledby","bn-bonus-dialog-title");
  dialog.innerHTML='<button class="bn-bonus-dialog__close" type="button" aria-label="Fechar detalhes do bônus" autofocus>×</button><img class="bn-bonus-dialog__image" alt=""><div class="bn-bonus-dialog__body"><span class="bn-bonus-dialog__meta"></span><h3 id="bn-bonus-dialog-title"></h3><p></p></div>';
  document.body.appendChild(dialog);
  var opener=null,previousOverflow="";
  function open(card) {
   var img=card.querySelector("img"),title=card.querySelector("h4"),description=card.querySelector("p"),meta=card.querySelector(".bn-bonus__meta");
   dialog.querySelector("img").src=img.currentSrc||img.src;
   dialog.querySelector("img").alt=img.alt;
   dialog.querySelector("h3").textContent=title.textContent;
   dialog.querySelector("p").textContent=description?description.textContent:"";
   dialog.querySelector(".bn-bonus-dialog__meta").textContent=meta?meta.textContent:"";
   opener=card;previousOverflow=document.documentElement.style.overflow;
   dialog.showModal();dialog.scrollTop=0;document.documentElement.style.overflow="hidden";
  }
  root.querySelectorAll(".bn-bonus__sequence[inert]").forEach(function(sequence){
   sequence.removeAttribute("inert");
   sequence.querySelectorAll(".bn-bonus__card").forEach(function(card){card.tabIndex=-1;});
  });
  root.querySelectorAll(".bn-bonus__card").forEach(function(card){
   card.setAttribute("role","button");card.setAttribute("aria-haspopup","dialog");
   card.setAttribute("aria-label","Ver detalhes: "+card.querySelector("h4").textContent);
   card.addEventListener("click",function(){open(card);});
   card.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();open(card);}});
  });
  dialog.querySelector("button").addEventListener("click",function(){dialog.close();});
  dialog.addEventListener("click",function(event){
   if(event.target!==dialog)return;
   var r=dialog.getBoundingClientRect();
   if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  dialog.addEventListener("close",function(){document.documentElement.style.overflow=previousOverflow;if(opener)opener.focus({preventScroll:true});});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
