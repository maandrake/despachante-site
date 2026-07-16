import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const root = process.cwd();
const reportDirectory = path.join(root, "relatorios-lighthouse");
const categories = ["performance", "accessibility", "best-practices", "seo"];
const thresholds = {
  performance: 0.75,
  accessibility: 0.9,
  "best-practices": 0.85,
  seo: 0.9
};
const pages = [
  { name: "Página principal", slug: "index", pathname: "/" },
  { name: "Política de Privacidade", slug: "privacidade", pathname: "/privacidade.html" }
];
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.resolve(root, "." + pathname);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return null;
  return filePath;
}

const server = createServer(async (request, response) => {
  let filePath;
  try {
    filePath = resolveRequestPath(request.url || "/");
  } catch {
    response.writeHead(400).end("Requisição inválida");
    return;
  }

  if (!filePath) {
    response.writeHead(403).end("Acesso negado");
    return;
  }

  try {
    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Arquivo não encontrado");
  }
});

let chrome;
const failures = [];

try {
  await mkdir(reportDirectory, { recursive: true });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Porta local não disponível");

  chrome = await launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"]
  });

  for (const page of pages) {
    const url = `http://127.0.0.1:${address.port}${page.pathname}`;
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "html",
      logLevel: "error",
      onlyCategories: categories
    });

    if (!result) throw new Error(`Lighthouse não retornou resultado para ${page.name}`);

    const htmlReport = Array.isArray(result.report) ? result.report[0] : result.report;
    await writeFile(path.join(reportDirectory, `${page.slug}.html`), htmlReport, "utf8");
    await writeFile(
      path.join(reportDirectory, `${page.slug}.json`),
      JSON.stringify(result.lhr, null, 2),
      "utf8"
    );

    console.log(`\n${page.name}:`);
    for (const category of categories) {
      const score = result.lhr.categories[category]?.score ?? 0;
      const scorePercent = Math.round(score * 100);
      const minimumPercent = Math.round(thresholds[category] * 100);
      console.log(`- ${category}: ${scorePercent} (mínimo ${minimumPercent})`);
      if (score < thresholds[category]) {
        failures.push(`${page.name}: ${category} ficou em ${scorePercent}, mínimo ${minimumPercent}`);
      }
    }
  }
} finally {
  if (chrome) await chrome.kill();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length > 0) {
  console.error("\nLimites do Lighthouse não atingidos:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\n✓ Todas as páginas atingiram os limites do Lighthouse.");
