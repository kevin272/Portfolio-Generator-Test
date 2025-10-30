import { listTemplates } from '../models/Template.js';

export async function getTemplates() {
  const templates = await listTemplates();
  return { templates };
}
