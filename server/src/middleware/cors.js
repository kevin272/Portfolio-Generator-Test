export default function applyCors(req, res, options = {}) {
  const {
    origin = '*',
    methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders = 'Content-Type,Authorization',
    exposedHeaders = '',
    credentials = false,
    maxAge,
  } = options;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method'] || methods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || allowedHeaders
  );

  if (exposedHeaders) {
    res.setHeader('Access-Control-Expose-Headers', exposedHeaders);
  }

  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (typeof maxAge === 'number') {
    res.setHeader('Access-Control-Max-Age', String(maxAge));
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
