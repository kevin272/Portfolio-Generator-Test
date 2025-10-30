import { createPortfolio, getPortfolio, updatePortfolioById } from '../models/Portfolio.js';

export async function createPortfolioRecord(payload) {
  const portfolio = await createPortfolio(payload);
  return { portfolio };
}

export async function getPortfolioRecord(id) {
  const portfolio = await getPortfolio(id);
  return { portfolio };
}

export async function updatePortfolioRecord(id, payload) {
  const portfolio = await updatePortfolioById(id, payload);
  return { portfolio };
}
