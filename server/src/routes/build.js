import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

import { getPortfolio } from '../models/Portfolio.js';
import { loadTemplateAssets } from '../models/Template.js';
import { prepareDownloadDirectory, writePortfolioAssets } from '../lib/file.js';
import { createZipFromDirectory } from '../lib/archiver.js';
import { validatePortfolioInput } from '../lib/validate.js';
import { renderTemplate } from '../lib/renderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

export async function buildPortfolioBundle({ templateId, portfolioId, portfolio: inlinePortfolio }) {
  if (!templateId) {
    const error = new Error('templateId is required');
    error.status = 400;
    throw error;
  }

  let portfolio = inlinePortfolio;
  if (portfolioId) {
    portfolio = await getPortfolio(portfolioId);
  }

  if (!portfolio) {
    const error = new Error('A portfolio payload or portfolioId must be supplied');
    error.status = 400;
    throw error;
  }

  const safePortfolio = validatePortfolioInput({ ...portfolio, id: portfolio.id || 'draft' });
  const { markup, styles } = await loadTemplateAssets(templateId);
  const html = renderTemplate(markup, { portfolio: safePortfolio });

  const dirId = `${templateId}-${safePortfolio.id}`;
  const targetDir = await prepareDownloadDirectory(DOWNLOAD_DIR, dirId);
  await writePortfolioAssets(targetDir, { html, css: styles });

  const zipPath = path.join(DOWNLOAD_DIR, `${dirId}.zip`);
  await createZipFromDirectory(targetDir, zipPath);

  return {
    zipPath,
    targetDir,
    downloadName: `${dirId}.zip`,
  };
}

export async function cleanBundleArtifacts(paths) {
  const { zipPath, targetDir } = paths;
  await Promise.all([
    fs.rm(zipPath, { force: true }),
    fs.rm(targetDir, { recursive: true, force: true }),
  ]);
}
