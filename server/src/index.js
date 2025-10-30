import './lib/env.js';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';

import applyCors from './middleware/cors.js';
import { getTemplates } from './routes/templates.js';
import {
  createPortfolioRecord,
  getPortfolioRecord,
  updatePortfolioRecord,
} from './routes/portfolios.js';
import { buildPortfolioBundle, cleanBundleArtifacts } from './routes/build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.join(__dirname, 'templates');
const PORT = Number(process.env.PORT) || 4000;

const server = http.createServer(async (req, res) => {
  try {
    if (applyCors(req, res)) {
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/templates') {
      const payload = await getTemplates();
      sendJson(res, 200, payload);
      return;
    }

    if (pathname === '/api/portfolios' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const payload = await createPortfolioRecord(body);
      sendJson(res, 201, payload);
      return;
    }

    if (pathname.startsWith('/api/portfolios/')) {
      const id = decodeURIComponent(pathname.slice('/api/portfolios/'.length));
      if (!id) {
        notFound(res);
        return;
      }

      if (req.method === 'GET') {
        const payload = await getPortfolioRecord(id);
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === 'PUT') {
        const body = await readJsonBody(req);
        const payload = await updatePortfolioRecord(id, body);
        sendJson(res, 200, payload);
        return;
      }

      methodNotAllowed(res, ['GET', 'PUT']);
      return;
    }

    if (pathname === '/api/build' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const bundle = await buildPortfolioBundle(body);

      try {
        await streamDownload(res, bundle);
      } finally {
        try {
          await cleanBundleArtifacts(bundle);
        } catch (cleanupError) {
          console.error(cleanupError);
        }
      }
      return;
    }

    if (pathname.startsWith('/previews/')) {
      await servePreview(pathname, res);
      return;
    }

    notFound(res);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Portfolio generator server listening on ${PORT}`);
  });
}

export default server;

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  const limit = 1024 * 1024; // 1MB

  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error('Payload too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const parseError = new Error('Invalid JSON payload');
    parseError.status = 400;
    throw parseError;
  }
}

function sendJson(res, statusCode, payload) {
  if (res.headersSent || res.writableEnded) {
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  sendJson(res, 404, { message: 'Not found' });
}

function methodNotAllowed(res, allowed) {
  if (!res.headersSent) {
    res.setHeader('Allow', allowed.join(', '));
  }
  sendJson(res, 405, { message: `Method not allowed. Allowed: ${allowed.join(', ')}` });
}

async function streamDownload(res, bundle) {
  const { zipPath, downloadName } = bundle;
  const stream = createReadStream(zipPath);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

  await pipeline(stream, res);
}

async function servePreview(pathname, res) {
  const relative = pathname.slice('/previews/'.length);
  const safePath = path.resolve(TEMPLATE_ROOT, relative);
  const rootWithSlash = TEMPLATE_ROOT.endsWith(path.sep)
    ? TEMPLATE_ROOT
    : `${TEMPLATE_ROOT}${path.sep}`;

  if (!safePath.startsWith(rootWithSlash)) {
    notFound(res);
    return;
  }

  let stats;
  try {
    stats = await fs.stat(safePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      notFound(res);
      return;
    }
    throw error;
  }

  if (!stats.isFile()) {
    notFound(res);
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Content-Type', getMimeType(safePath));

  const stream = createReadStream(safePath);
  await pipeline(stream, res);
}

function getMimeType(filePath) {
  if (filePath.endsWith('.png')) {
    return 'image/png';
  }
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (filePath.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  return 'application/octet-stream';
}

function handleError(res, error) {
  if (res.headersSent || res.writableEnded) {
    res.destroy();
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? 'Unexpected error' : error.message || 'Unexpected error';
  sendJson(res, status, { message });
}
