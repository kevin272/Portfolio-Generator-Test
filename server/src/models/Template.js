import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

async function buildTemplateSummary(dirName) {
  const templatePath = path.join(TEMPLATE_DIR, dirName);
  const manifestPath = path.join(templatePath, 'manifest.json');
  let manifest = {};
  if (await fileExists(manifestPath)) {
    const manifestContents = await fs.readFile(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContents);
  }
  const previewPath = path.join(templatePath, 'preview.png');
  const hasPreview = await fileExists(previewPath);

  return {
    id: dirName,
    name: manifest.name || dirName,
    description: manifest.description || 'Customisable portfolio layout.',
    previewUrl: hasPreview ? `/previews/${dirName}/preview.png` : null,
    fields: manifest.fields || ['name', 'headline', 'about', 'skills', 'projects', 'contact'],
  };
}

export async function listTemplates() {
  const entries = await fs.readdir(TEMPLATE_DIR);
  const dirs = [];
  for (const entry of entries) {
    const entryPath = path.join(TEMPLATE_DIR, entry);
    const stat = await fs.stat(entryPath);
    if (stat.isDirectory()) {
      dirs.push(entry);
    }
  }
  const summaries = await Promise.all(dirs.map(buildTemplateSummary));
  return summaries.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadTemplateAssets(id) {
  const dir = path.join(TEMPLATE_DIR, id);
  const [markup, styles] = await Promise.all([
    fs.readFile(path.join(dir, 'index.ejs'), 'utf8'),
    fs.readFile(path.join(dir, 'style.css'), 'utf8'),
  ]);
  return { markup, styles };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
