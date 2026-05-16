import { readFileSync, writeFileSync, copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "images", "logo-icon.svg");
const svg = readFileSync(svgPath);

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function resizePng(size) {
  return sharp(svg)
    .resize(size, size, { fit: "contain", background: transparent })
    .png()
    .toBuffer();
}

const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(icoSizes.map((size) => resizePng(size)));
writeFileSync(path.join(root, "app", "favicon.ico"), await pngToIco(icoBuffers));

await sharp(svg)
  .resize(32, 32, { fit: "contain", background: transparent })
  .png()
  .toFile(path.join(root, "app", "icon.png"));

await sharp(svg)
  .resize(180, 180, { fit: "contain", background: transparent })
  .png()
  .toFile(path.join(root, "app", "apple-icon.png"));

copyFileSync(svgPath, path.join(root, "app", "icon.svg"));

console.log("Generated app/favicon.ico, app/icon.png, app/apple-icon.png, app/icon.svg");
