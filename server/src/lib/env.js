import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const defaultEnvPath = path.join(projectRoot, '.env');
const envPath = process.env.ENV_PATH || defaultEnvPath;

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalsIndex).trim();
  const rawValue = trimmed.slice(equalsIndex + 1).trim();
  const value = rawValue.replace(/^['"]|['"]$/g, '');

  if (!key) {
    return null;
  }

  return [key, value];
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  contents
    .split(/\r?\n/)
    .map(parseLine)
    .filter(Boolean)
    .forEach(([key, value]) => {
      if (typeof process.env[key] === 'undefined') {
        process.env[key] = value;
      }
    });
}

loadEnvFile(envPath);
