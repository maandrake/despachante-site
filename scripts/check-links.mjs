import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pages = ["index.html", "privacidade.html", "termos-de-uso.html", "404.html"];
const failures = new Set();
const idsByPage = new Map();
let checkedReferences = 0;

function isExternal(value) {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(value) ||
    /^(?:mailto|tel|data|javascript):/i.test(value);
}

function normalizeLocalTarget(sourceFile, value) {
  const hashAt = value.indexOf("#");
  const rawFragment = hashAt >= 0 ? value.slice(hashAt + 1) : "";
  const withoutFragment = hashAt >= 0 ? value.slice(0, hashAt) : value;
  const queryAt = withoutFragment.indexOf("?");
  let rawPath = queryAt >= 0 ? withoutFragment.slice(0, queryAt) : withoutFragment;

  try {
    rawPath = decodeURIComponent(rawPath);
  } catch {
    failures.add(`${sourceFile}: endereço não pode ser decodificado: ${value}`);
    return null;
  }

  let targetFile;
  if (!rawPath) {
    targetFile = sourceFile;
  } else if (rawPath.startsWith("/")) {
    targetFile = rawPath.slice(1);
  } else {
    targetFile = path.posix.join(path.posix.dirname(sourceFile), rawPath);
  }

  targetFile = path.posix.normalize(targetFile || "index.html");
  if (targetFile.endsWith("/")) targetFile += "index.html";
  if (targetFile === ".") targetFile = "index.html";

  if (targetFile === ".." || targetFile.startsWith("../")) {
    failures.add(`${sourceFile}: destino fora do projeto: ${value}`);
    return null;
  }

  let fragment = rawFragment;
  try {
    fragment = decodeURIComponent(rawFragment);
  } catch {
    failures.add(`${sourceFile}: fragmento não pode ser decodificado: ${value}`);
    return null;
  }

  return { targetFile, fragment };
}

async function fileExists(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) return false;
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function validateReference(sourceFile, value) {
  const cleanValue = value.trim();
  if (!cleanValue || isExternal(cleanValue)) return;

  const target = normalizeLocalTarget(sourceFile, cleanValue);
  if (!target) return;
  checkedReferences += 1;

  if (!(await fileExists(target.targetFile))) {
    failures.add(`${sourceFile}: arquivo não encontrado: ${cleanValue}`);
    return;
  }

  if (target.fragment) {
    const targetIds = idsByPage.get(target.targetFile);
    if (!targetIds || !targetIds.has(target.fragment)) {
      failures.add(`${sourceFile}: destino #${target.fragment} não encontrado em ${target.targetFile}`);
    }
  }
}

for (const page of pages) {
  const html = await readFile(path.join(root, page), "utf8");
  const ids = new Set(
    Array.from(html.matchAll(/\sid=(["'])(.*?)\1/gi), (match) => match[2])
  );
  idsByPage.set(page, ids);
}

for (const page of pages) {
  const html = await readFile(path.join(root, page), "utf8");
  const references = [];

  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
    references.push(match[2]);
  }

  for (const match of html.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi)) {
    for (const candidate of match[2].split(",")) {
      const candidateUrl = candidate.trim().split(/\s+/)[0];
      if (candidateUrl) references.push(candidateUrl);
    }
  }

  for (const reference of references) {
    await validateReference(page, reference);
  }
}

const css = await readFile(path.join(root, "styles.css"), "utf8");
for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
  await validateReference("styles.css", match[2]);
}

if (failures.size > 0) {
  console.error("Links internos inválidos:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`✓ ${checkedReferences} referências internas verificadas sem erros.`);
