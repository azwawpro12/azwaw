// Variables globales pour données dynamiques (évolutivité)
let projects = [];
let certifications = [];
let veilles = [];
let procedures = [];  // Nouveau

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

// Rendu des cartes (avec event listener fiable)
// Chargement (ajoute du log pour vérifier)

// Chargement projets avec logs
async function loadProjects() {
  if (!document.getElementById('projectsGrid')) return;

  try {
    const res = await fetch('data_projects.json');
    if (!res.ok) throw new Error(`Erreur fetch projets : ${res.status}`);
    const data = await res.json();
    projects = Array.isArray(data.projects) ? data.projects : [];
    console.log(`Projets chargés : ${projects.length}`);

    // Récupère la catégorie depuis l'URL si présente (ex: projets.html?cat=school)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat') || 'all';

    // Affiche avec le filtre initial
    renderProjects(projects, initialCat);

    // Sélectionne la bonne option dans le dropdown
    const select = document.getElementById('projectFilter');
    if (select) {
      select.value = initialCat;

      // Écouteur de changement
      select.addEventListener('change', function () {
        const selected = this.value;
        console.log(`Filtre changé vers : ${selected}`);
        renderProjects(projects, selected);
      });
    }
  } catch (err) {
    console.error("Erreur chargement projets :", err);
  }
}
// Rendu + clic attaché après (méthode la plus stable)
function renderProjects(projs, category = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const filtered = (category === 'all')
    ? projs
    : projs.filter(p => p.category === category);

  grid.innerHTML = filtered.map(p => `
    <div class="project-card card" data-id="${p.id}">
      ${p.vitrine ? `
        <div class="vitrine-container">
          <img src="${p.vitrine}" alt="${p.title}" class="project-vitrine">
        </div>
      ` : ''}
      
      <i class="${p.icon || 'fas fa-project-diagram'}"></i>
      <h4>${p.title}</h4>
      <p>${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}</p>
      <div class="tags">${p.tags ? p.tags.map(t => `<span>${t}</span>`).join('') : ''}</div>
    </div>
  `).join('');

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function () {
      const id = this.dataset.id;
      openModal(id);
    });
  });
}

// Modal robuste
function openModal(id) {
  console.log(`openModal appelé pour ID: ${id}`);
  if (!Array.isArray(projects) || projects.length === 0) {
    console.error("Tableau projects vide ou non chargé");
    return;
  }
  const p = projects.find(proj => proj.id === id);
  if (!p) {
    console.error(`Projet non trouvé pour ID: ${id}`);
    return;
  }

   let html = `
    <h3>${p.title}</h3>
    <p class="modal-date">${p.date || ''}</p>

    <!-- Description structurée et belle -->
    <div class="project-description" style="margin: 1.5rem 0; line-height: 1.7; font-size: 1.05rem; color: var(--text-primary);">
      ${p.description
        .split('\n')                          // Respecte les sauts de ligne que tu mets dans le JSON
        .map(line => `<p style="margin: 0.8rem 0;">${line.trim()}</p>`)
        .join('')
      }
    </div>`;

  // Liens juste sous la description (GitHub, Demo, etc.)
  if (p.links) {
    html += `
      <div style="margin: 1.5rem 0; text-align:center;">
    `;
    Object.entries(p.links).forEach(([key, url]) => {
      html += `
        <a href="${url}" class="btn" target="_blank" style="margin:0 0.5rem;">
          <i class="fas fa-external-link-alt"></i> ${key.toUpperCase()}
        </a>`;
    });
    html += `</div>`;
  }

  // Procédures liées (comme avant)
  if (p.related_procedures && Array.isArray(p.related_procedures) && p.related_procedures.length > 0) {
    html += `
      <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
        <h4>Procédures liées (${p.related_procedures.length})</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
    `;

    p.related_procedures.forEach(procId => {
      const proc = procedures.find(pr => pr.id === procId);
      const procTitle = proc ? proc.title : "Procédure inconnue";
      html += `
        <button class="btn btn-primary" onclick="openProcedureModal('${procId}')">
          <i class="fas fa-file-pdf"></i> ${procTitle}
        </button>`;
    });

    html += `
        </div>
      </div>`;
  }

  // Image du schéma (cliquable pour agrandir)
  if (p.schema) {
    html += `
      <div style="text-align:center; margin:2rem 0;">
        <h4 style="margin-bottom:0.8rem; color:var(--accent-primary);">Schéma Technique</h4>
        <img src="${p.schema}" alt="Schéma ${p.title}" 
             style="max-width:100%; max-height:65vh; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.3s ease;"
             onmouseover="this.style.transform='scale(1.08)'"
             onmouseout="this.style.transform='scale(1)'"
             onclick="window.open('${p.schema}', '_blank');">
        <p style="margin-top:0.6rem; font-size:0.9rem; color:var(--text-secondary);">
          Survolez pour zoomer • Cliquez pour agrandir
        </p>
      </div>`;
  }

  const content = document.getElementById('modalContent');
  if (content) {
    content.innerHTML = html;
    document.getElementById('modal').classList.add('is-open');
  } else {
    console.error("#modalContent introuvable");
  }
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

  let html = `
    <div style="text-align:center; margin-bottom:1.5rem;">
      <!-- Logo petit et centré -->
      ${c.image ? `
        <img src="${c.image}" alt="${c.title}" 
             style="max-width:180px; height:auto; border-radius:50%; box-shadow:0 4px 15px rgba(0,0,0,0.15); margin-bottom:1rem;">
      ` : ''}
      <h3 style="margin:0.5rem 0;">${c.title}</h3>
      <p class="modal-date">${c.date}</p>
    </div>

    <p style="margin:1rem 0; line-height:1.6;">${c.description}</p>`;

  // Iframe PDF grand
  if (c.link && c.link.toLowerCase().endsWith('.pdf')) {
    html += `
      <div style="position:relative; height:85vh; margin-top:1.5rem;">
        <iframe src="${c.link}#toolbar=1&navpanes=1&scrollbar=1" 
                width="100%" 
                height="100%" 
                style="border:none; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.2);">
        </iframe>
      </div>`;
  } else if (c.link) {
    html += `
      <div style="text-align:center; margin-top:2rem;">
        <a href="${c.link}" target="_blank" class="btn btn-primary" style="font-size:1.1rem;">
          <i class="fas fa-external-link-alt"></i> Voir la certification
        </a>
      </div>`;
  }

  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.add('is-open');
}

async function loadProcedures() {
  try {
    const res = await fetch('data_procedures.json');
    if (!res.ok) throw new Error('Fichier data_procedures.json introuvable');
    
    const data = await res.json();
    procedures = data.procedures || [];
    
    console.log('✅ Procédures chargées :', procedures.length, 'éléments');
    
    // Rendu seulement si la grille existe (page procédures)
    if (document.getElementById('proceduresGrid')) {
      renderProcedures(procedures);
    }
  } catch (err) {
    console.error('Erreur loadProcedures :', err);
  }
}


function openProcedureModal(id) {
  const p = procedures.find(p => p.id === id);
  if (!p) return;
  
  let html = `
    <h3 style="margin-bottom:0.5rem;">${p.title}</h3>
    <p class="modal-date" style="margin-bottom:1rem; font-size:0.9rem;">${p.date || ''}</p>`;
  
  if (p.file) {
    html += `
      <div style="position:relative; height:85vh;">  <!-- Grand conteneur pour PDF -->
        <iframe src="${p.file}" width="100%" height="100%" style="border:none; border-radius:8px;"></iframe>
      </div>`;
  } else {
    html += `<p style="color:var(--accent-tertiary);">Aucun PDF disponible pour cette procédure.</p>`;
  }
  
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.add('is-open');
}
function renderProcedures(procs) {
  document.getElementById('proceduresGrid').innerHTML = procs.map(p => `
    <div class="procedure-card card" onclick="openProcedureModal('${p.id}')">
      ${p.vitrine ? `
        <div class="vitrine-container">
          <img src="${p.vitrine}" alt="${p.title}" class="procedure-vitrine">
        </div>
      ` : `
        <i class="${p.icon || 'fa-solid fa-file-pdf'} procedure-icon"></i>
      `}
      <div class="card-content">
        <h4>${p.title}</h4>
        <p class="card-date">📅 ${p.date}</p>
        <p>${p.description.substring(0, 120)}${p.description.length > 120 ? '...' : ''}</p>
      </div>
    </div>
  `).join('');
}

// Chargement Veilles
// Chargement Veilles
async function loadVeilles() {
  if (!document.getElementById('veillesGrid')) return;
  try {
    const res = await fetch('data_veilles.json');
    if (!res.ok) throw new Error('Erreur fetch veilles');
    const data = await res.json();
    veilles = data.veilles || [];
    renderVeilles(veilles);
    console.log('✅ Veilles chargées :', veilles.length);
  } catch (err) {
    console.error(err);
    document.getElementById('veillesGrid').innerHTML = '<p>Erreur de chargement des veilles.</p>';
  }
}

// Rendu des cartes Veilles (même style que Procédures)
function renderVeilles(veils) {
  document.getElementById('veillesGrid').innerHTML = veils.map(v => `
    <div class="procedure-card card veille-card" onclick="openVeilleModal('${v.id}')">
      ${v.vitrine || v.image ? `
        <div class="vitrine-container">
          <img src="${v.vitrine || v.image}" alt="${v.title}" class="procedure-vitrine">
        </div>
      ` : `
        <i class="${v.icon || 'fas fa-rss'} procedure-icon"></i>
      `}
      <div class="card-content">
        <h4>${v.title}</h4>
        <p class="card-date">📅 ${v.date}</p>
        <p>${v.description}</p>
      </div>
    </div>
  `).join('');
}

// Modal Veille (avec gros bouton lien externe)
// Chargement Veilles
// Chargement Veilles
async function loadVeilles() {
  if (!document.getElementById('veillesGrid')) return;
  try {
    const res = await fetch('data_veilles.json');
    if (!res.ok) throw new Error('Erreur fetch veilles');
    const data = await res.json();
    veilles = data.veilles || [];
    renderVeilles(veilles);
    console.log('✅ Veilles chargées :', veilles.length);
  } catch (err) {
    console.error(err);
    document.getElementById('veillesGrid').innerHTML = '<p>Erreur de chargement des veilles.</p>';
  }
}

// Rendu des cartes (exactement le même style que Procédures)
function renderVeilles(veils) {
  document.getElementById('veillesGrid').innerHTML = veils.map(v => `
    <div class="procedure-card card veille-card" onclick="openVeilleModal('${v.id}')">
      ${v.vitrine ? `
        <div class="vitrine-container">
          <img src="${v.vitrine}" alt="${v.title}" class="procedure-vitrine">
        </div>
      ` : `
        <i class="${v.icon || 'fas fa-rss'} procedure-icon"></i>
      `}
      <div class="card-content">
        <h4>${v.title}</h4>
        <p class="card-date">📅 ${v.date}</p>
        <p>${v.description}</p>
      </div>
    </div>
  `).join('');
}

// Modal Veille (avec gros lien externe)
function openVeilleModal(id) {
  const v = veilles.find(v => v.id === id);
  if (!v) return;

  let html = `
    <h3>${v.title}</h3>
    <p class="modal-date">${v.date || ''}</p>
    <p style="margin:1.5rem 0; line-height:1.6;">${v.fullDescription || v.description}</p>`;

  // Image vitrine dans le modal (optionnelle, mais recommandée)
  if (v.vitrine) {
    html += `
      <div style="text-align:center; margin:1.5rem 0;">
        <img src="${v.vitrine}" alt="${v.title}" 
             style="max-width:100%; max-height:45vh; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.15);">
      </div>`;
  }

  // Gros bouton lien externe
  if (v.link) {
    html += `
      <div style="text-align:center; margin:2rem 0;">
        <a href="${v.link}" target="_blank" rel="noopener noreferrer" 
           class="btn btn-primary" style="font-size:1.2rem; padding:16px 40px; display:inline-flex; align-items:center; gap:10px;">
          <i class="fas fa-external-link-alt"></i> Lire l'article / Podcast
        </a>
      </div>`;
  }

  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.add('is-open');
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
// ====================== TABLEAU TCS E4 ======================
function openTCSModal() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');

  if (!modal || !content) {
    console.error("Modal non trouvé sur cette page");
    return;
  }

  let html = `
    <h3 style="text-align:center; margin-bottom:1rem;">Tableau de Synthèse E4</h3>
    <div style="height:90vh; position:relative;">
      <iframe src="Images/TCS.pdf#toolbar=1&navpanes=1&scrollbar=1" 
              width="100%" 
              height="100%" 
              style="border:none; border-radius:12px;">
      </iframe>
    </div>`;

  content.innerHTML = html;
  modal.classList.add('is-open');
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
  loadProcedures();
  loadTCS();
});