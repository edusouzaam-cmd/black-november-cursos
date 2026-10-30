import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
const root = "kinghost-package";
const base = "/black-cursos/";
const production = `https://engeteles.com.br${base}`;
export function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = `${dir}/${name}`;
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
function paths(text) {
  // Handle HTML attributes, inline JSON/JS and CSS without touching external URLs.
  for (const directory of [
    "wp-content/plugins/elementor/assets/",
    "wp-content/plugins/elementor-pro/assets/",
    "wp-content/themes/blocksy/static/bundle/",
  ]) {
    const original = `https://engeteles.com.br/${directory}`;
    const local = `${base}mirror/engeteles.com.br/${directory}`;
    text = text
      .replaceAll(original, local)
      .replaceAll(original.replaceAll("/", "\\/"), local.replaceAll("/", "\\/"));
  }
  return text
    .replace(/(?<![\w/])\/(assets|mirror)\//g, `${base}$1/`)
    .replace(/(?<=["'=])\/(termos-de-uso|politica-de-privacidade)\.html/g, `${base}$1.html`)
    .replace(/(?<=["'=])\/favicon\.ico/g, `${base}favicon.ico`)
    .replace(/href=(['"])\/(#[^'"\s]*)?\1/g, (_, q, hash = "") => `href=${q}${base}${hash}${q}`)
    .replaceAll(
      `CDN_BASE_URL:"${base}mirror/connect.facebook.net/"`,
      'CDN_BASE_URL:"https://connect.facebook.net/"',
    )
    .replaceAll(
      `${base}mirror/connect.facebook.net/log/fbevents_telemetry/`,
      "https://connect.facebook.net/log/fbevents_telemetry/",
    )
    .replaceAll(`${base}mirror/px.ads.linkedin.com/collect`, "https://px.ads.linkedin.com/collect");
}
function metadata(html, page = "") {
  const url = production + page;
  html = html
    .replace(/<html\b[^>]*>/i, '<html lang="pt-BR">')
    .replace(/<link\b[^>]*rel=["']?canonical\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*property=["']?og:url\b[^>]*>/gi, "")
    .replace(/https:\/\/engeteles\.com\.br\/passaporte\//g, production)
    .replaceAll("https:\\/\\/engeteles.com.br\\/passaporte\\/", production.replaceAll("/", "\\/"));
  if (!page) {
    html = html.replace(/<meta\b[^>]*name=["']?description\b[^>]*>/gi, "");
    html = html.replace(
      "</head>",
      '<meta name="description" content="3 certificações completas pelo preço de uma! PCM, GFM e RCM + livro PCM Descomplicado. Conheça a oferta Black November ENGETELES."/>\n</head>',
    );
    // Legacy imported schema referred to a different 2024 offer; replace only
    // its metadata with the actual current page while retaining executable JS.
    html = html.replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Combo 3 Certificações | Black November ENGETELES", url, inLanguage: "pt-BR" })}</script>\n</head>`,
    );
  }
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] || "Black Cursos | ENGETELES";
  if (!/property=["']?og:title/.test(html))
    html = html.replace("</head>", `<meta property="og:title" content="${title}"/>\n</head>`);
  html = html.replace(
    "</head>",
    `<link rel="canonical" href="${url}"/>\n<meta property="og:url" content="${url}"/>\n</head>`,
  );
  // Social image must be absolute for link unfurlers.
  html = html.replace(
    /(<meta\b[^>]*property=["']?og:image["']?\s+content=["'])\/(?!\/)/g,
    "$1https://engeteles.com.br/",
  );
  html = html.replace(/(<script\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (all, before, src, quote) => {
    if (!src.startsWith(base) || /\.js(?:[?#]|$)/.test(src)) return all;
    const relative = src.slice(base.length).split(/[?#]/)[0];
    const file = `${root}/${relative}`;
    if (!existsSync(file)) throw new Error(`Script ausente: ${src}`);
    cpSync(file, `${file}.js`);
    return `${before}${base}${relative}.js${quote}`;
  });
  html = html.replace(/(<script[^>]*id=(?:jquery-bind-first-js|js-cookie-pys-js)) defer/g, "$1");
  return html;
}
rmSync(root, { recursive: true, force: true });
mkdirSync(root);
// The app's actual page is src/content/passaporte.html. Export it directly,
// preserving the exact CSS/JS used inside the Lovable iframe. No Node runtime.
for (const dir of ["assets", "mirror"])
  cpSync(`public/${dir}`, `${root}/${dir}`, { recursive: true });
cpSync("public/favicon.ico", `${root}/favicon.ico`);
// Keep support responses (tracking pixels/scripts) mirrored with their original names;
// unrelated archived site pages in public/pages are never exported.
for (const file of walk(root)) {
  if (/\.(?:php|map)$/i.test(file)) {
    rmSync(file);
    continue;
  }
  if (/\.(?:css|js|json|svg)$/.test(file)) {
    let text = paths(readFileSync(file, "utf8"));
    // Imported icon CSS includes an SVG fallback that was never mirrored.
    // Existing WOFF2/WOFF/TTF sources preserve the same icon glyphs.
    if (file.endsWith(".css"))
      text = text.replace(
        /,\s*url\([^)]*(?:eicons|fa-[a-z-]+[0-9]+)\.svg[^)]*\)\s*format\(['"]svg['"]\)/g,
        "",
      );
    writeFileSync(file, text);
  }
}
// Elementor resolves dynamic chunks by their original filenames; provide
// aliases for cache-hashed copies already stored in the repository.
for (const file of walk(root)) {
  const alias = file.replace(/\.q[a-z0-9]+(?=\.(?:js|css|woff2?|ttf|eot)$)/, "");
  if (alias !== file && !existsSync(alias)) cpSync(file, alias);
}
for (const page of ["", "termos-de-uso.html", "politica-de-privacidade.html"]) {
  const source = page ? `public/${page}` : "src/content/passaporte.html";
  writeFileSync(
    `${root}/${page || "index.html"}`,
    metadata(paths(readFileSync(source, "utf8")), page),
  );
}
writeFileSync(
  `${root}/htaccess`,
  `RewriteEngine On
RewriteBase /black-cursos/

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteRule ^ index.html [L]
`,
);
writeFileSync(
  `${root}/robots.txt`,
  `User-agent: *
Allow: /

Sitemap: ${production}sitemap.xml
`,
);
writeFileSync(
  `${root}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", "termos-de-uso.html", "politica-de-privacidade.html"].map((p) => `  <url><loc>${production}${p}</loc></url>`).join("\n")}
</urlset>
`,
);
console.log(
  `Exportado HTML existente para ${resolve(root)}; Vite compilado em dist/client, sem incluir runtime de servidor.`,
);
