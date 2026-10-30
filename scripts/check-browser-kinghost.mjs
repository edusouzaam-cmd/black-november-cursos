import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
const { chromium } = await import(process.env["PLAYWRIGHT_MODULE"] || "playwright");
const root = resolve("kinghost-package");
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith("/black-cursos/")) {
    res.writeHead(404).end();
    return;
  }
  let file = resolve(root, decodeURIComponent(url.pathname.slice("/black-cursos/".length)));
  if (file !== root && !file.startsWith(root + "/")) {
    res.writeHead(403).end();
    return;
  }
  try {
    if (statSync(file).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        res.writeHead(301, { Location: url.pathname + "/" + url.search }).end();
        return;
      }
      file += "/index.html";
    }
    const type =
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".ico": "image/x-icon",
      }[extname(file)] ||
      (file.includes("/gtag/") || /\.q[a-z0-9]+$/.test(file)
        ? "text/javascript"
        : file.includes("dc.ads.linkedin")
          ? "image/gif"
          : "application/octet-stream");
    res.writeHead(200, { "Content-Type": type }).end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [],
    missing = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.log("PAGEERROR", e.message);
  });
  page.on("response", (r) => {
    if (r.url().startsWith(origin) && r.status() >= 400) missing.push(r.url());
  });
  // Third-party services remain external; avoid depending on them for this check.
  await page.route(/https:\/\/.*/, (route) => {
    if (["fetch", "xhr"].includes(route.request().resourceType()))
      return route.fulfill({ contentType: "application/json", body: "{}" });
    return route.abort();
  });
  await page.goto(`${origin}/black-cursos/`, { waitUntil: "load" });
  await page.locator(".bn-countdown__digits").first().waitFor();
  for (const [path, title] of [
    ["termos-de-uso", "Termos de Uso"],
    ["politica-de-privacidade", "Política de Privacidade"],
  ]) {
    await page.getByRole("link", { name: title, exact: true }).first().click();
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    assert(new URL(page.url()).pathname.startsWith(`/black-cursos/${path}.html`));
    await page.reload({ waitUntil: "load" });
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute("href"),
      `https://engeteles.com.br/black-cursos/${path}.html`,
    );
  }
  await page.getByRole("link", { name: "← Voltar à oferta" }).first().click();
  await page.waitForURL(`${origin}/black-cursos/`);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload({ waitUntil: "load" });
    await page.evaluate(async () => {
      for (const img of document.images) {
        img.loading = "eager";
        await img.decode().catch(() => {});
      }
    });
    assert.deepEqual(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter(
              (img) => (img.getAttribute("src") || img.getAttribute("srcset")) && !img.naturalWidth,
            )
            .map((img) => img.src),
        ),
      [],
    );
    assert.equal((await page.locator('a[href*="hotmart.com"]').count()) > 0, true);
  }
  console.log(JSON.stringify({ errors, missing }));
  assert.deepEqual(errors, [], "Erros JavaScript");
  assert.deepEqual(missing, [], "Recursos locais com erro HTTP");
  console.log(
    "OK: navegação, atualização direta das subpáginas, canonical, imagens e checkout em desktop/mobile.",
  );
} finally {
  await browser.close();
  server.close();
}
