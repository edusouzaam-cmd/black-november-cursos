/* Current checkout attribution: initialize once, after document rendering. */
(function(){
 function start(){
  window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','AW-666388917');gtag('config','AW-470010628');
  var ads=document.createElement('script');ads.async=true;ads.src='https://www.googletagmanager.com/gtag/js?id=AW-666388917';document.head.appendChild(ads);
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','3018542305084132');fbq('track','PageView');
 }
 function schedule(){if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:2000});else setTimeout(start,200);}
 if(document.readyState==='complete')schedule();else addEventListener('load',schedule,{once:true});
})();
