import { randomUUID } from 'crypto';
import { findPortfolioById, savePortfolio, updatePortfolio } from '../db.js';
import { validatePortfolioInput } from '../lib/validate.js';

export async function createPortfolio(input) {
  const id = randomUUID().replace(/-/g, '').slice(0, 10);
  const portfolio = validatePortfolioInput({ ...input, id });
  await savePortfolio(portfolio);
  return portfolio;
}

export async function updatePortfolioById(id, input) {
  const existing = await findPortfolioById(id);
  if (!existing) {
    const error = new Error('Portfolio not found');
    error.status = 404;
    throw error;
  }
  const portfolio = validatePortfolioInput({ ...existing, ...input, id });
  await updatePortfolio(portfolio);
  return portfolio;
}

export async function getPortfolio(id) {
  const portfolio = await findPortfolioById(id);
  if (!portfolio) {
    const error = new Error('Portfolio not found');
    error.status = 404;
    throw error;
  }
  return portfolio;
}
