import path from 'path';
import { promises as fs } from 'fs';

export async function writePortfolioAssets(outputDir, { html, css }) {
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8'),
    fs.writeFile(path.join(outputDir, 'style.css'), css, 'utf8'),
  ]);
}

export async function prepareDownloadDirectory(baseDir, id) {
  const target = path.join(baseDir, id);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  return target;
}
