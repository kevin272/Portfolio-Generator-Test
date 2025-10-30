const API_BASE = resolveApiBase();

export async function fetchTemplates() {
  const response = await fetch(`${API_BASE}/api/templates`);
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }

  const data = await response.json();
  return data.templates.map((template) => ({
    ...template,
    previewUrl:
      template.previewUrl && !/^https?:\/\//i.test(template.previewUrl)
        ? `${API_BASE}${template.previewUrl}`
        : template.previewUrl,
  }));
}

export async function buildPortfolio(templateId, portfolio) {
  const response = await fetch(`${API_BASE}/api/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ templateId, portfolio })
  });

  if (!response.ok) {
    throw new Error('Failed to build portfolio');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${templateId}-portfolio.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function resolveApiBase() {
  if (typeof window === 'undefined') {
    return '';
  }

  const override = window.__PORTFOLIO_API_ORIGIN__;
  if (override) {
    return String(override).replace(/\/$/, '');
  }

  const { protocol, hostname, port } = window.location;

  if (protocol === 'http:' || protocol === 'https:') {
    if (!port || port === '4000') {
      const origin = `${protocol}//${hostname}`;
      return port ? `${origin}:${port}` : origin;
    }

    return `${protocol}//${hostname}:4000`;
  }

  return 'http://localhost:4000';
}
