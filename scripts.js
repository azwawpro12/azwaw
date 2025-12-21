// Variables globales pour données dynamiques (évolutivité)
let projects = [];
let certifications = [];
let veilles = [];

// Init Galaxy (optionnel, décommenter si voulu pour fond animé)
// function initGalaxy() {
//   const canvas = document.getElementById('bgCanvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   canvas.width = innerWidth; canvas.height = innerHeight;
//   // ... (ton code original complet pour stars, draw, etc.)
//   window.addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; });
// }

// Typing pour hero
function initTyping() {
  if (!document.querySelector('.dynamic-text')) return;
  const words = ['VLANs & cafés ☕', 'Pare-feux & pizzas 🍕', 'Scripts & musique 🎵'];
  let i = 0, j = 0, deleting = false;
  const el = document.querySelector('.dynamic-text');
  function type() {
    const word = words[i];
    el.textContent = deleting ? word.substring(0, j - 1) : word.substring(0, j + 1);
    j += deleting ? -1 : 1;
    if (!deleting && j === word.length) { deleting = true; setTimeout(type, 1500); return; }
    if (deleting && j === 0) { deleting = false; i = (i + 1) % words.length; setTimeout(type, 500); return; }
    setTimeout(type, deleting ? 60 : 100);
  }
  setTimeout(type, 800);
}

// Dark/Light Mode
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme') || 'light';
body.classList.toggle('dark', savedTheme === 'dark');
updateToggleIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const newTheme = body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    updateToggleIcon(newTheme);
  });
}

function updateToggleIcon(theme) {
  themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Chargement Projets
async function loadProjects() {
  if (!document.getElementById('projectsGrid')) return;
  try {
    const res = await fetch('data_projects.json');
    if (!res.ok) throw new Error('Erreur fetch projets');
    projects = (await res.json()).projects || [];
    const urlCat = new URLSearchParams(location.search).get('cat') || 'all';
    const filtered = urlCat === 'all' ? projects : projects.filter(p => p.category === urlCat);
    renderProjects(filtered);
    document.getElementById('projectFilter').value = urlCat;
  } catch (err) {
    console.error(err);
    document.getElementById('projectsGrid').innerHTML = '<p>Erreur de chargement des projets.</p>';
  }
}

function renderProjects(projs) {
  document.getElementById('projectsGrid').innerHTML = projs.map(p => `
    <div class="project-card card" onclick="openModal('${p.id}')">
      <i class="${p.icon || 'fas fa-project-diagram'}"></i>
      <h4>${p.title}</h4>
      <p>${p.description.substring(0, 100)}...</p>
      <div class="tags">${p.tags ? p.tags.map(t => `<span>${t}</span>`).join('') : ''}</div>
    </div>
  `).join('');
}

function openModal(id) {
  const p = projects.find(p => p.id === id);
  if (!p) return;
  document.getElementById('modalContent').innerHTML = `
    <h3 style="color:var(--accent-primary);">${p.title}</h3>
    <p>${p.description}</p>
    ${p.images ? `<img src="${p.images}" alt="${p.title}" style="width:100%; border-radius:8px; margin:1rem 0;">` : ''}
    ${p.links && p.links.github ? `<a href="${p.links.github}" target="_blank" class="btn">GitHub</a>` : ''}
    ${p.links && p.links.demo ? `<a href="${p.links.demo}" target="_blank" class="btn">Démo</a>` : ''}
  `;
  document.getElementById('modal').classList.add('is-open');
}

// Chargement Certifications
async function loadCerts() {
  if (!document.getElementById('certificationsGrid')) return;
  try {
    const res = await fetch('data_certifications.json');
    if (!res.ok) throw new Error('Erreur fetch certifications');
    const data = await res.json();
    certifications = data.certifications || [];
    document.getElementById('certificationsGrid').innerHTML = certifications.map(c => `
      <div class="cert-card card" onclick="openCertModal('${c.id}')">
        <i class="${c.icon || 'fas fa-certificate'}"></i>
        <h4>${c.title}</h4>
        <p>${c.issuer} – ${c.date}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('certificationsGrid').innerHTML = '<p>Erreur de chargement des certifications.</p>';
  }
}

function openCertModal(id) {
  const c = certifications.find(c => c.id === id);
  if (!c) return;
  document.getElementById('modalContent').innerHTML = `
    <h3 style="color:var(--accent-primary);">${c.title}</h3>
    <p><strong>${c.issuer}</strong> – ${c.date}</p>
    <p>${c.description}</p>
    ${c.image ? `<img src="${c.image}" alt="${c.title}" style="width:100%; border-radius:8px; margin:1rem 0;">` : ''}
    ${c.link ? `<a href="${c.link}" target="_blank" class="btn">Voir</a>` : ''}
  `;
  document.getElementById('modal').classList.add('is-open');
}

// Chargement Veilles
async function loadVeilles() {
  if (!document.getElementById('veillesGrid')) return;
  try {
    const res = await fetch('data_veilles.json');
    if (!res.ok) throw new Error('Erreur fetch veilles');
    const data = await res.json();
    veilles = data.veilles || [];
    document.getElementById('veillesGrid').innerHTML = veilles.map(v => `
      <div class="veille-item card">
        <i class="${v.icon || 'fas fa-rss'}"></i>
        <h4>${v.title}</h4>
        <p>${v.description}</p>
        <a href="${v.link}" target="_blank">Lire →</a>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('veillesGrid').innerHTML = '<p>Erreur de chargement des veilles.</p>';
  }
}

// Chargement Compétences (avec animation sur progress bars)
async function loadCompetences() {
  if (!document.getElementById('skillsGrid')) return;
  try {
    const res = await fetch('data_competences.json');
    if (!res.ok) throw new Error('Erreur fetch compétences');
    const data = await res.json();
    document.getElementById('skillsGrid').innerHTML = data.competences.map(skill => `
      <div class="skill-card card">
        <h3><i class="${skill.icon}"></i> ${skill.title}</h3>
        <p>${skill.description}</p>
        <div class="skill-bar"><div class="skill-progress" data-level="${skill.level}"></div></div>
        <span class="skill-percent">${skill.level}%</span>
      </div>
    `).join('');
    // Animation des bars après load
    document.querySelectorAll('.skill-progress').forEach(bar => {
      bar.style.width = `${bar.dataset.level}%`;
    });
  } catch (err) {
    console.error(err);
    document.getElementById('skillsGrid').innerHTML = '<p>Erreur de chargement des compétences.</p>';
  }
}

// Fermeture Modal & Menu Mobile
document.addEventListener('click', e => {
  const modal = document.getElementById('modal');
  if (e.target === modal || e.target.classList.contains('modal-close')) {
    modal.classList.remove('is-open');
  }
});
document.getElementById('mobileToggle')?.addEventListener('click', () => {
  document.querySelector('.nav-menu').classList.toggle('active');
});

// Formulaire Contact avec Validation
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const subject = this.subject.value.trim();
  const message = this.message.value.trim();
  const status = document.getElementById('status');

  // Validation client
  if (!name || !email || !subject || !message) {
    status.textContent = 'Tous les champs sont requis.';
    status.style.color = 'var(--accent-tertiary)';
    return;
  }
  if (!email.match(/^\S+@\S+\.\S+$/)) {
    status.textContent = 'Email invalide.';
    status.style.color = 'var(--accent-tertiary)';
    return;
  }

  status.textContent = 'Envoi en cours...';
  status.style.color = 'var(--accent-secondary)';

  // EmailJS (Remplace par tes IDs réels !)
  emailjs.init("PZ1SG6m4MUTM_Lhof"); // Ton public key EmailJS
  const serviceID = "service_puah3qe";
  const templateID = "template_oza7n4t";

  emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
      status.textContent = 'Message envoyé ! Je vous réponds bientôt.';
      status.style.color = 'var(--accent-primary)';
      this.reset();
    }, (err) => {
      status.textContent = 'Erreur d\'envoi. Réessayez.';
      status.style.color = 'var(--accent-tertiary)';
      console.error('EmailJS erreur:', err);
    });
});

// Typing blagues/motivation (mélange)
const words = ['Réseaux & cybersécurité 🔒', 'Virtualisation Proxmox 🖥️', 'Admin sys passionné ⚙️', 'Sécuriser l’avenir 🚀'];

// Scroll Animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.style.opacity = 1;
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section').forEach(sec => observer.observe(sec));

// Init tout (appel des fonctions)
document.addEventListener('DOMContentLoaded', () => {
  // initGalaxy(); // Décommenter si fond animé voulu
  initTyping();
  loadProjects();
  loadCerts();
  loadVeilles();
  loadCompetences();

  // Filtre projets
  document.getElementById('projectFilter')?.addEventListener('change', e => {
    const filtered = e.target.value === 'all' ? projects : projects.filter(p => p.category === e.target.value);
    renderProjects(filtered);
  });

});