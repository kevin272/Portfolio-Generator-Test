import { fetchTemplates, buildPortfolio } from './api.js';

const DEFAULT_PORTFOLIO = {
  name: 'Ada Lovelace',
  headline: 'Pioneer of computer programming',
  about:
    'I love solving complex problems with elegant algorithms. My work explores the intersection of creativity and computation.',
  contact: 'ada@example.com',
  skills: ['JavaScript', 'Node.js', 'React', 'CSS'],
  projects: [
    {
      title: 'Analytical Engine Simulator',
      description: 'An interactive model demonstrating the capabilities of the analytical engine.',
      link: 'https://example.com/analytical-engine',
    },
    {
      title: 'Notes on the Difference Engine',
      description: 'A series of essays exploring modern applications of difference engines.',
      link: '',
    },
  ],
};

const state = {
  templates: [],
  selectedTemplate: 'minimal',
  portfolio: JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO)),
  status: null,
};

const templatePicker = document.getElementById('template-picker');
const downloadButton = document.getElementById('download-button');
const statusMessage = document.getElementById('status-message');
const formContainer = document.getElementById('form-container');
const previewContainer = document.getElementById('preview-container');

initialise();

function initialise() {
  renderForm();
  renderTemplatePicker();
  renderPreview();
  renderStatus();
  updateDownloadButton();
  loadTemplates();
}

async function loadTemplates() {
  try {
    const templates = await fetchTemplates();
    state.templates = templates;
    if (templates.length && !templates.find((item) => item.id === state.selectedTemplate)) {
      state.selectedTemplate = templates[0].id;
    }
    renderTemplatePicker();
    renderPreview();
    updateDownloadButton();
  } catch (error) {
    setStatus({ type: 'error', message: error.message });
  }
}

function renderTemplatePicker() {
  templatePicker.innerHTML = '<h2>Templates</h2>';
  const list = document.createElement('ul');

  state.templates.forEach((template) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    if (state.selectedTemplate === template.id) {
      button.classList.add('active');
    }

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = template.name;

    const description = document.createElement('span');
    description.className = 'description';
    description.textContent = template.description;

    button.append(name, description);
    button.addEventListener('click', () => {
      state.selectedTemplate = template.id;
      renderTemplatePicker();
      renderPreview();
      updateDownloadButton();
    });

    item.appendChild(button);

    if (template.previewUrl) {
      const image = document.createElement('img');
      image.src = template.previewUrl;
      image.alt = `${template.name} preview`;
      item.appendChild(image);
    }

    list.appendChild(item);
  });

  templatePicker.appendChild(list);
}

function renderForm() {
  formContainer.innerHTML = '';
  const form = document.createElement('form');
  form.className = 'portfolio-form';
  form.addEventListener('submit', (event) => event.preventDefault());

  form.append(
    createTextField('Name', state.portfolio.name, (value) => updatePortfolioField('name', value)),
    createTextField('Headline', state.portfolio.headline, (value) => updatePortfolioField('headline', value)),
    createTextArea('About', state.portfolio.about, (value) => updatePortfolioField('about', value)),
    createTextField('Contact', state.portfolio.contact, (value) => updatePortfolioField('contact', value))
  );

  form.appendChild(createSkillsSection());
  form.appendChild(createProjectsSection());

  formContainer.appendChild(form);
}

function createTextField(labelText, value, onInput) {
  const label = document.createElement('label');
  label.textContent = labelText;

  const input = document.createElement('input');
  input.value = value;
  input.addEventListener('input', (event) => {
    onInput(event.target.value);
    renderPreview();
  });

  label.appendChild(input);
  return label;
}

function createTextArea(labelText, value, onInput) {
  const label = document.createElement('label');
  label.textContent = labelText;

  const textarea = document.createElement('textarea');
  textarea.rows = 5;
  textarea.value = value;
  textarea.addEventListener('input', (event) => {
    onInput(event.target.value);
    renderPreview();
  });

  label.appendChild(textarea);
  return label;
}

function createSkillsSection() {
  const section = document.createElement('section');
  section.className = 'skills';

  const header = document.createElement('header');
  const title = document.createElement('h3');
  title.textContent = 'Skills';
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = '+ Add skill';
  addButton.addEventListener('click', () => {
    state.portfolio.skills.push('New Skill');
    renderSkillsList(list);
    renderPreview();
  });

  header.append(title, addButton);

  const list = document.createElement('ul');
  list.className = 'pill-list';

  section.append(header, list);
  renderSkillsList(list);
  return section;
}

function renderSkillsList(list) {
  list.innerHTML = '';

  state.portfolio.skills.forEach((skill, index) => {
    const item = document.createElement('li');

    const input = document.createElement('input');
    input.value = skill;
    input.addEventListener('input', (event) => {
      state.portfolio.skills[index] = event.target.value;
      renderPreview();
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      state.portfolio.skills.splice(index, 1);
      renderSkillsList(list);
      renderPreview();
    });

    item.append(input, removeButton);
    list.appendChild(item);
  });
}

function createProjectsSection() {
  const section = document.createElement('section');
  section.className = 'projects';

  const header = document.createElement('header');
  const title = document.createElement('h3');
  title.textContent = 'Projects';
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = '+ Add project';
  addButton.addEventListener('click', () => {
    state.portfolio.projects.push({ title: 'New Project', description: '', link: '' });
    renderProjectsList(list);
    renderPreview();
  });

  header.append(title, addButton);

  const list = document.createElement('ul');
  list.className = 'project-list';

  section.append(header, list);
  renderProjectsList(list);
  return section;
}

function renderProjectsList(list) {
  list.innerHTML = '';

  state.portfolio.projects.forEach((project, index) => {
    const item = document.createElement('li');

    const titleInput = document.createElement('input');
    titleInput.value = project.title;
    titleInput.placeholder = 'Project title';
    titleInput.addEventListener('input', (event) => {
      state.portfolio.projects[index].title = event.target.value;
      renderPreview();
    });

    const descriptionInput = document.createElement('textarea');
    descriptionInput.rows = 3;
    descriptionInput.value = project.description;
    descriptionInput.placeholder = 'Describe the project';
    descriptionInput.addEventListener('input', (event) => {
      state.portfolio.projects[index].description = event.target.value;
      renderPreview();
    });

    const linkInput = document.createElement('input');
    linkInput.value = project.link || '';
    linkInput.placeholder = 'https://…';
    linkInput.addEventListener('input', (event) => {
      state.portfolio.projects[index].link = event.target.value;
      renderPreview();
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      state.portfolio.projects.splice(index, 1);
      renderProjectsList(list);
      renderPreview();
    });

    item.append(titleInput, descriptionInput, linkInput, removeButton);
    list.appendChild(item);
  });
}

function updatePortfolioField(field, value) {
  state.portfolio[field] = value;
}

function renderPreview() {
  const templateId = state.selectedTemplate || 'minimal';
  const { portfolio } = state;

  const skillsList = portfolio.skills
    .map((skill) => `<li>${escapeHtml(skill)}</li>`)
    .join('');

  const projectsContent = portfolio.projects.length
    ? `<ul class="preview-projects">${portfolio.projects
        .map(
          (project) => `
            <li>
              <h4>${escapeHtml(project.title)}</h4>
              <p>${escapeHtml(project.description)}</p>
              ${project.link ? `<a href="${escapeAttribute(project.link)}" target="_blank" rel="noreferrer">${escapeHtml(project.link)}</a>` : ''}
            </li>
          `
        )
        .join('')}</ul>`
    : '<p class="empty">Add projects to see them here.</p>';

  previewContainer.innerHTML = `
    <section class="live-preview">
      <h2>Live preview</h2>
      <div class="preview preview--${templateId}">
        <header>
          <h3>${escapeHtml(portfolio.name)}</h3>
          <p class="headline">${escapeHtml(portfolio.headline)}</p>
          <p class="contact">${escapeHtml(portfolio.contact)}</p>
        </header>
        <article>
          <h4>About</h4>
          <p>${escapeHtml(portfolio.about)}</p>
        </article>
        <article>
          <h4>Skills</h4>
          <ul class="preview-skills">${skillsList}</ul>
        </article>
        <article>
          <h4>Projects</h4>
          ${projectsContent}
        </article>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

downloadButton.addEventListener('click', async () => {
  if (!state.selectedTemplate || state.status?.type === 'loading') {
    return;
  }

  setStatus({ type: 'loading', message: 'Building your portfolio…' });
  try {
    await buildPortfolio(state.selectedTemplate, state.portfolio);
    setStatus({ type: 'success', message: 'Portfolio downloaded successfully.' });
  } catch (error) {
    setStatus({ type: 'error', message: error.message });
  }
});

function setStatus(nextStatus) {
  state.status = nextStatus;
  renderStatus();
  updateDownloadButton();
}

function renderStatus() {
  if (!state.status) {
    statusMessage.textContent = '';
    statusMessage.className = 'status';
    statusMessage.hidden = true;
    return;
  }

  const { type, message } = state.status;
  const prefix = type === 'loading' ? '⏳' : type === 'error' ? '⚠️' : '✅';
  statusMessage.textContent = `${prefix} ${message}`;
  statusMessage.className = `status status--${type}`;
  statusMessage.hidden = false;
}

function updateDownloadButton() {
  const disabled = !state.selectedTemplate || !state.templates.length || state.status?.type === 'loading';
  downloadButton.disabled = disabled;
}
