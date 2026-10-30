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
    var root = document.querySelector(".bn-n137");
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

/* Ampliação em top layer: nunca herda o recorte lateral do carrossel. */
(function(){
 function init(){
  var root=document.querySelector(".bn-bonus--carousel");
  if(!root||!window.matchMedia("(hover:hover)").matches)return;
  var preview=document.createElement("div");
  preview.className="bn-bonus-preview";preview.setAttribute("popover","manual");
  document.body.appendChild(preview);
  var active=null,closeTimer=0,oldWidth=0;
  function close(){
   clearTimeout(closeTimer);
   if(preview.matches(":popover-open"))preview.hidePopover();
   root.classList.remove("bn-bonus--preview-open");active=null;
  }
  function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(function(){if(!preview.matches(":hover")&&!(active&&active.matches(":hover")))close();},140);}
  function position(){
   if(!active)return;
   var r=active.getBoundingClientRect(),margin=16;
   var width=Math.min(r.width*2,window.innerWidth-margin*2,680);
   preview.style.width=width+"px";
   preview.style.maxHeight=(window.innerHeight-margin*2)+"px";
   var height=preview.getBoundingClientRect().height;
   var left=Math.max(margin,Math.min(r.left+r.width/2-width/2,window.innerWidth-width-margin));
   var top=Math.max(margin,Math.min(r.top+r.height/2-height/2,window.innerHeight-height-margin));
   preview.style.left=left+"px";preview.style.top=top+"px";
  }
  function open(card){
   clearTimeout(closeTimer);
   if(active===card)return;
   active=card;
   preview.replaceChildren();
   var img=card.querySelector("img").cloneNode(true);
   img.loading="eager";img.removeAttribute("width");img.removeAttribute("height");
   preview.appendChild(img);
   preview.appendChild(card.querySelector("div").cloneNode(true));
   preview.setAttribute("aria-label",card.querySelector("h4").textContent);
   root.classList.add("bn-bonus--preview-open");
   if(!preview.matches(":popover-open"))preview.showPopover();
   position();
   img.addEventListener("load",position,{once:true});
  }
  root.querySelectorAll(".bn-bonus__card").forEach(function(card){
   card.addEventListener("pointerenter",function(event){if(event.pointerType!=="touch")open(card);});
   card.addEventListener("pointerleave",scheduleClose);
   card.addEventListener("focus",function(){open(card);});
   card.addEventListener("blur",scheduleClose);
  });
  preview.addEventListener("pointerenter",function(){clearTimeout(closeTimer);});
  preview.addEventListener("pointerleave",scheduleClose);
  preview.addEventListener("click",close);
  document.addEventListener("keydown",function(event){if(event.key==="Escape")close();});
  window.addEventListener("resize",close);
  window.addEventListener("scroll",close,{passive:true});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

/* Accessible testimonials with no carousel package. */
(function(){
 function init(){
  var root=document.querySelector('[data-testimonials]');if(!root)return;
  var viewport=root.querySelector('[data-testimonial-viewport]'),track=root.querySelector('[data-testimonial-track]'),slides=Array.from(root.querySelectorAll('[data-testimonial-slide]')),pagination=root.querySelector('[data-testimonial-pagination]');
  var index=0,timer=null,paused=false,startX=null;
  function height(){viewport.style.height=slides[index].getBoundingClientRect().height+'px';}
  function show(next){index=(next+slides.length)%slides.length;track.style.transform='translateX(-'+index*100+'%)';slides.forEach(function(s,i){s.setAttribute('aria-hidden',String(i!==index));s.inert=i!==index;});Array.from(pagination.children).forEach(function(b,i){b.setAttribute('aria-current',String(i===index));});height();}
  function schedule(){clearInterval(timer);if(!paused&&!matchMedia('(prefers-reduced-motion:reduce)').matches)timer=setInterval(function(){show(index+1);},5000);}
  slides.forEach(function(s,i){s.setAttribute('aria-label',(i+1)+' / '+slides.length);var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Ir ao depoimento '+(i+1));b.addEventListener('click',function(){show(i);schedule();});pagination.appendChild(b);});
  root.querySelector('[data-testimonial-prev]').addEventListener('click',function(){show(index-1);schedule();});root.querySelector('[data-testimonial-next]').addEventListener('click',function(){show(index+1);schedule();});
  root.addEventListener('pointerenter',function(){paused=true;clearInterval(timer);});root.addEventListener('pointerleave',function(){paused=false;schedule();});root.addEventListener('focusin',function(){clearInterval(timer);});root.addEventListener('focusout',schedule);
  viewport.addEventListener('touchstart',function(e){startX=e.touches[0].clientX;},{passive:true});viewport.addEventListener('touchend',function(e){if(startX!==null&&Math.abs(e.changedTouches[0].clientX-startX)>40){show(index+(e.changedTouches[0].clientX<startX?1:-1));schedule();}startX=null;},{passive:true});
  if(window.ResizeObserver)new ResizeObserver(height).observe(root);root.addEventListener('load',height,true);if(document.fonts)document.fonts.ready.then(height);show(0);
  if(window.IntersectionObserver)new IntersectionObserver(function(entries){paused=!entries[0].isIntersecting;schedule();}).observe(root);else schedule();
  document.addEventListener('visibilitychange',function(){paused=document.hidden;schedule();});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
