/* Only the interactions used by this static offer; no WordPress runtime. */
(function () {
 function init() {
  // Imported animation and background markers must be visible without Elementor.
  document.querySelectorAll('.elementor-invisible').forEach(function(el){el.classList.remove('elementor-invisible');});
  document.querySelectorAll('.e-con.e-parent').forEach(function(el){el.classList.add('e-lazyloaded');});
  var root=document.querySelector('.elementor-element-cd572b4');
  var viewport=root&&root.querySelector('.elementor-main-swiper');
  if(!viewport)return;
  function carousel(){
   var script=document.createElement('script');
   script.src='/mirror/engeteles.com.br/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.qtr70a4.js';
   script.onload=function(){
    if(!window.Swiper)return;
    var swiper=new Swiper(viewport,{
     slidesPerView:1,spaceBetween:10,speed:500,loop:true,autoHeight:true,
     autoplay:{delay:5000,disableOnInteraction:true,pauseOnMouseEnter:true},
     navigation:{prevEl:root.querySelector('.elementor-swiper-button-prev'),nextEl:root.querySelector('.elementor-swiper-button-next')},
     pagination:{el:root.querySelector('.swiper-pagination'),clickable:true},
     a11y:{enabled:true,prevSlideMessage:'Slide anterior',nextSlideMessage:'Próximo slide'}
    });
    root.addEventListener('load',function(){swiper.updateAutoHeight();},true);
    if(document.fonts)document.fonts.ready.then(function(){swiper.updateAutoHeight();});
   };
   document.head.appendChild(script);
  }
  if('IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting;})){observer.disconnect();carousel();}},{rootMargin:'600px'});observer.observe(root);}else carousel();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
