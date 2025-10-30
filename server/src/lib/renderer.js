const TEMPLATE_REGEX = /<%[\s\S]+?%>/g;

function createRenderer(template) {
  let cursor = 0;
  let functionBody = "let output = '';\nconst print = (...args) => { output += args.join(''); };\nwith (locals) {\n";

  template.replace(TEMPLATE_REGEX, (match, index) => {
    const preceding = template.slice(cursor, index);
    if (preceding) {
      functionBody += `output += ${JSON.stringify(preceding)};\n`;
    }

    const isOutput = match.startsWith('<%=');
    const isRawOutput = match.startsWith('<%-');
    const startIndex = isOutput || isRawOutput ? 3 : 2;
    const content = match.slice(startIndex, -2);
    const trimmed = content.trim();

    if (isOutput || isRawOutput) {
      functionBody += `output += (${trimmed});\n`;
    } else if (trimmed) {
    const content = match.slice(2, -2);
    const trimmed = content.trim();

    if (match.startsWith('<%=')) {
      functionBody += `output += (${trimmed});\n`;
    } else if (match.startsWith('<%-')) {
      functionBody += `output += (${trimmed});\n`;
    } else {
      functionBody += `${trimmed}\n`;
    }

    cursor = index + match.length;
    return match;
  });

  const remaining = template.slice(cursor);
  if (remaining) {
    functionBody += `output += ${JSON.stringify(remaining)};\n`;
  }

  functionBody += '}\nreturn output;';

  return new Function('locals', functionBody);
}

export function renderTemplate(template, locals = {}) {
  try {
    const renderer = createRenderer(template);
    return renderer(locals);
  } catch (error) {
    error.message = `Template render error: ${error.message}`;
    throw error;
  }
}
