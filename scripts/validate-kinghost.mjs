import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
const root = "kinghost-package",
  base = "/black-cursos/",
  origin = "https://engeteles.com.br";
const pages = ["index.html", "termos-de-uso.html", "politica-de-privacidade.html"];
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = `${dir}/${n}`;
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const f of [...pages, "favicon.ico", "robots.txt", "sitemap.xml", "htaccess", "assets"])
  assert(existsSync(`${root}/${f}`), `Ausente: ${f}`);
assert(!existsSync(`${root}/.htaccess`));
const files = walk(root);
for (const file of files) {
  const relative = file.slice(root.length + 1);
  assert(relative.length <= 140, `Caminho longo demais para extração: ${relative}`);
  assert(
    relative.split("/").every((part) => part.length <= 64),
    `Nome longo demais: ${relative}`,
  );
}
for (const f of files)
  assert(
    !/(?:^|\/)(?:src|node_modules|\.git|\.env[^/]*)(?:\/|$)|\.(?:tsx?|php|map|zip)$/.test(f),
    `Arquivo indevido: ${f}`,
  );
assert.equal(readFileSync(`${root}/favicon.ico`).compare(readFileSync("public/favicon.ico")), 0);
const visited = new Set();
let resources = 0;
function check(raw, from) {
  raw = raw.replaceAll("&amp;", "&");
  if (!raw || /^(?:#|data:|mailto:|tel:|javascript:)/i.test(raw)) return;
  const u = new URL(raw, `${origin}${base}${from}`);
  if (u.origin !== origin) return;
  // Remote WordPress AJAX, external website links and services are not package resources.
  if (!u.pathname.startsWith(base)) {
    if (/\/(?:assets|mirror)\//.test(u.pathname)) throw Error(`Base incorreto ${raw}`);
    return;
  }
  assert(!u.pathname.includes(`${base}black-cursos/`), `Base duplicado: ${raw}`);
  let p = decodeURIComponent(u.pathname.slice(base.length));
  if (!p || p.endsWith("/")) p += "index.html";
  assert(existsSync(`${root}/${p}`), `Recurso ausente: ${raw} (${from})`);
  resources++;
  if (p.endsWith(".css")) css(p);
}
function css(p) {
  if (visited.has(p)) return;
  visited.add(p);
  const s = readFileSync(`${root}/${p}`, "utf8");
  for (const m of s.matchAll(/url\(\s*["']?([^\s)'"\n]+)["']?\s*\)/g)) check(m[1], p);
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m?.[1] ?? m?.[2] ?? m?.[3];
}
for (const p of pages) {
  const html = readFileSync(`${root}/${p}`, "utf8"),
    url = origin + base + (p === "index.html" ? "" : p);
  assert(html.includes('<html lang="pt-BR">'));
  assert(html.includes(`rel="canonical" href="${url}"`));
  assert(html.includes(`property="og:url" content="${url}"`));
  assert(!/Lovable Generated|Lovable App|\/black-cursos\/black-cursos\//.test(html));
  for (const tag of html.matchAll(/<(?:script|link|img|source|a)\b[^>]*>/gi)) {
    const raw = attr(tag[0], /^<a\b|^<link\b/i.test(tag[0]) ? "href" : "src");
    if (raw) check(raw, p);
    const set = attr(tag[0], "srcset");
    if (set) for (const x of set.split(",")) check(x.trim().split(/\s+/)[0], p);
  }
  for (const m of html.matchAll(/url\(\s*["']?([^\s)'"\n]+)["']?\s*\)/g)) check(m[1], p);
}
const expected = ["", "termos-de-uso.html", "politica-de-privacidade.html"].map(
  (p) => origin + base + p,
);
assert.deepEqual(
  [...readFileSync(`${root}/sitemap.xml`, "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]),
  expected,
);
assert.equal(
  readFileSync(`${root}/robots.txt`, "utf8"),
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}${base}sitemap.xml\n`,
);
assert(readFileSync(`${root}/htaccess`, "utf8").includes(`RewriteBase ${base}`));
assert(!existsSync(`${root}/pages`));
console.log(
  `OK: ${files.length} arquivos, 3 páginas HTML, ${resources} recursos locais e ${visited.size} CSS; metadados, sitemap, base e favicon original válidos.`,
);
