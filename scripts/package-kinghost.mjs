import {cpSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
const root='kinghost-package',base='/black-cursos/',origin='https://engeteles.com.br';
rmSync(root,{recursive:true,force:true});mkdirSync(root);
cpSync('public/assets',root+'/assets',{recursive:true});cpSync('public/favicon.ico',root+'/favicon.ico');
function paths(s){return s.replace(/(?<![\w/])\/assets\//g,base+'assets/').replace(/href="\/(termos-de-uso|politica-de-privacidade)\.html"/g,'href="'+base+'$1.html"').replaceAll('href="/favicon.ico"','href="'+base+'favicon.ico"').replace(/href="\/(#[^"]*)?"/g,(_,hash='')=>'href="'+base+hash+'"');}
for(const file of ['index.html','termos-de-uso.html','politica-de-privacidade.html']){
 let html=readFileSync(file==='index.html'?'src/content/passaporte.html':'public/'+file,'utf8');const url=origin+base+(file==='index.html'?'':file);
 html=html.replace(/<link\b[^>]*rel="canonical"[^>]*>/gi,'').replace(/<meta\b[^>]*property="og:url"[^>]*>/gi,'').replace('</head>',`<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`);
 writeFileSync(root+'/'+file,paths(html));
}
// CSS font URLs and custom script assets use the same installation base.
for(const file of ['offer.css','offer.js','marketing.js','bn-legal.css'])writeFileSync(root+'/assets/'+file,paths(readFileSync('public/assets/'+file,'utf8')));
writeFileSync(root+'/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}${base}sitemap.xml\n`);
writeFileSync(root+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','termos-de-uso.html','politica-de-privacidade.html'].map(p=>`<url><loc>${origin}${base}${p}</loc></url>`).join('')}</urlset>`);
writeFileSync(root+'/htaccess',`RewriteEngine On\nRewriteBase ${base}\nRewriteCond %{REQUEST_FILENAME} -f [OR]\nRewriteCond %{REQUEST_FILENAME} -d\nRewriteRule ^ - [L]\nRewriteRule ^ index.html [L]\n<IfModule mod_deflate.c>\nAddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml\n</IfModule>\n<IfModule mod_headers.c>\n<FilesMatch "\\.(webp|woff2|css|js|png|ico)$">\nHeader set Cache-Control "public, max-age=31536000, immutable"\n</FilesMatch>\n</IfModule>\n`);
console.log('Native HTML package generated without WordPress or Elementor.');
