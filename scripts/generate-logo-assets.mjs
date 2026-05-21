import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "public", "images");

const transcriptPath =
  "C:/Users/Cheth/.cursor/projects/d-html-cursor-buildathon-2026-phish-sim/agent-transcripts/2336ca45-6fe6-4399-9dfb-b8cb357d19a5/2336ca45-6fe6-4399-9dfb-b8cb357d19a5.jsonl";

function extractMasterSvg() {
  const line = fs.readFileSync(transcriptPath, "utf8").split("\n")[0];
  const start = line.indexOf("<svg xmlns");
  const end = line.lastIndexOf("</svg>");
  if (start === -1 || end === -1) {
    throw new Error("Could not find SVG in transcript");
  }
  let svg = line.slice(start, end + 6);
  svg = svg.replace(/\\"/g, '"');
  return svg;
}

function stripWhiteBackground(svg) {
  return svg.replace(
    /<rect[^>]*fill="#ffffff"[^>]*\/>/gi,
    "",
  );
}

function setViewBox(svg, viewBox) {
  return svg.replace(
    /viewBox="[^"]*"/,
    `viewBox="${viewBox}"`,
  );
}

function removeTaglineSection(svg) {
  // Tagline block starts at clip-path be16163039 or transform at y=851
  const taglineStart = svg.indexOf('<clipPath id="be16163039">');
  if (taglineStart === -1) return svg;
  const taglineGroupStart = svg.indexOf(
    '<g clip-path="url(#be16163039)">',
    taglineStart,
  );
  if (taglineGroupStart === -1) return svg;
  const before = svg.slice(0, taglineGroupStart);
  const after = "</g></g></svg>";
  return before + after;
}

function extractIconOnly(svg) {
  const iconPathMatch = svg.match(
    /<g transform="matrix\(1, 0, 0, 1, 60, 292\)">[\s\S]*?<\/g><g transform="matrix\(1, 0, 0, 1, 231, 677\)">/,
  );
  if (!iconPathMatch) {
    throw new Error("Could not isolate icon group");
  }
  const iconInner = iconPathMatch[0].replace(
    /<g transform="matrix\(1, 0, 0, 1, 231, 677\)">$/,
    "",
  );
  const defsMatch = svg.match(/<defs>[\s\S]*?<\/defs>/);
  const defs = defsMatch ? defsMatch[0] : "<defs></defs>";
  const closed = iconInner.endsWith("</g>")
    ? iconInner
    : `${iconInner}</g></g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="336 292 660 380" preserveAspectRatio="xMidYMid meet">${defs}${closed}</svg>`;
}

const master = stripWhiteBackground(extractMasterSvg());
fs.mkdirSync(imagesDir, { recursive: true });
fs.writeFileSync(path.join(imagesDir, "logo.svg"), master);

const lockupBody = removeTaglineSection(master);
const lockup = setViewBox(lockupBody, "0 280 1500 620");
fs.writeFileSync(path.join(imagesDir, "logo-lockup.svg"), lockup);

const icon = extractIconOnly(master);
fs.writeFileSync(path.join(imagesDir, "logo-icon.svg"), icon);

console.log("Wrote logo.svg, logo-lockup.svg, logo-icon.svg");
