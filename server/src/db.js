import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'uploads');
const DATA_FILE = path.join(DATA_DIR, 'portfolios.json');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readPortfolios() {
  await ensureDir(DATA_DIR);
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
      return [];
    }
    throw error;
  }
}

async function writePortfolios(portfolios) {
  await ensureDir(DATA_DIR);
  await fs.writeFile(DATA_FILE, JSON.stringify(portfolios, null, 2), 'utf8');
}

export async function savePortfolio(portfolio) {
  const portfolios = await readPortfolios();
  portfolios.push(portfolio);
  await writePortfolios(portfolios);
  return portfolio;
}

export async function updatePortfolio(updated) {
  const portfolios = await readPortfolios();
  const idx = portfolios.findIndex((item) => item.id === updated.id);
  if (idx === -1) {
    throw new Error('Portfolio not found');
  }
  portfolios[idx] = updated;
  await writePortfolios(portfolios);
  return updated;
}

export async function findPortfolioById(id) {
  const portfolios = await readPortfolios();
  return portfolios.find((item) => item.id === id) || null;
}

export async function listPortfolios() {
  return readPortfolios();
}
