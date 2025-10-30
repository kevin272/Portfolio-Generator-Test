const REQUIRED_STRING_FIELDS = ['name', 'headline', 'about'];

function normaliseString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.trim();
}

function normaliseArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => normaliseString(item))
    .filter(Boolean);
}

export function validatePortfolioInput(input) {
  const result = { ...input };

  for (const field of REQUIRED_STRING_FIELDS) {
    result[field] = normaliseString(result[field]);
    if (!result[field]) {
      const error = new Error(`Field "${field}" is required`);
      error.status = 400;
      throw error;
    }
  }

  result.contact = normaliseString(result.contact);
  result.skills = normaliseArray(result.skills);
  result.projects = Array.isArray(result.projects)
    ? result.projects.map((project, index) => {
        const title = normaliseString(project?.title);
        const description = normaliseString(project?.description);
        const link = normaliseString(project?.link);
        if (!title) {
          const error = new Error(`Project ${index + 1} is missing a title`);
          error.status = 400;
          throw error;
        }
        return { title, description, link };
      })
    : [];

  return result;
}
