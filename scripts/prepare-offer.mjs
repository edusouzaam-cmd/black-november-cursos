import {copyFileSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
// Query fingerprints invalidate cached public assets whenever their bytes change.
let html=readFileSync('src/content/passaporte.html','utf8');
for(const file of ['offer.css','offer.js','marketing.js']){
 const version=createHash('sha256').update(readFileSync('public/assets/'+file)).digest('hex').slice(0,12);
 html=html.replace(new RegExp('/assets/'+file.replace('.','\\.')+'(?:\\?v=[a-f0-9]+)?','g'),'/assets/'+file+'?v='+version);
}
writeFileSync('src/content/passaporte.html',html);copyFileSync('src/content/passaporte.html','public/offer.html');
