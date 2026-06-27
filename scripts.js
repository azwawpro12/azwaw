// Variables globales pour données dynamiques
let projects = [];
let certifications = [];
let veilles = [];
let procedures = [];

function renderSkeleton(gridId, count = 3) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text-short"></div>
    </div>
  `).join('');
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
  renderSkeleton('projectsGrid', 3);
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
// Rendu projets — clic = page dédiée projet-detail.html
function renderProjects(projs, category = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const filtered = (category === 'all')
    ? projs
    : projs.filter(p => p.category === category);

  const categoryLabel = { school: 'TP École', personal: 'Personnel', professional: 'Professionnel' };

  grid.innerHTML = filtered.map(p => `
    <div class="project-card card" data-id="${p.id}" onclick="window.location.href='projet-detail.html?id=${p.id}'" style="cursor:pointer;">
      ${p.vitrine ? `
        <div class="vitrine-container">
          <img src="${p.vitrine}" alt="${p.title}" class="project-vitrine">
        </div>
      ` : ''}
      <div style="padding: 1rem 0 0.5rem;">
        ${p.category ? `<span style="background:rgba(14,116,144,0.1);color:#0E7490;padding:0.2rem 0.7rem;border-radius:6px;font-size:0.76rem;font-weight:600;border:1px solid rgba(14,116,144,0.2);">${categoryLabel[p.category] || p.category}</span>` : ''}
      </div>
      <h4>${p.title}</h4>
      <p>${p.description.substring(0, 110)}${p.description.length > 110 ? '...' : ''}</p>
      <div class="tags">${p.tags ? p.tags.map(t => `<span>${t}</span>`).join('') : ''}</div>
      ${p.related_procedures && p.related_procedures.length ? `
        <div style="margin-top:0.8rem; padding-top:0.8rem; border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:0.82rem; color:var(--text-secondary);"><i class="fas fa-file-pdf"></i> ${p.related_procedures.length} procédure${p.related_procedures.length > 1 ? 's' : ''} liée${p.related_procedures.length > 1 ? 's' : ''}</span>
        </div>` : ''}
      <div style="margin-top:1rem;">
        <span style="display:inline-flex;align-items:center;gap:0.4rem;background:var(--accent-primary);color:white;padding:0.45rem 1.1rem;border-radius:20px;font-size:0.88rem;font-weight:600;">
          Voir le projet <i class="fas fa-arrow-right"></i>
        </span>
      </div>
    </div>
  `).join('');
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
      <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
        <h4>Procédures liées (${p.related_procedures.length})</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
    `;

    p.related_procedures.forEach(procId => {
      const proc = procedures.find(pr => pr.id === procId);
      const procTitle = proc ? proc.title : "Procédure inconnue";
      if (proc && proc.file) {
        html += `
          <button onclick="openPdfModal('${proc.file}', '${procTitle}')" class="btn btn-primary">
            <i class="fas fa-file-pdf"></i> ${procTitle}
          </button>`;
      } else {
        html += `
          <span class="btn btn-primary" style="opacity:0.5;cursor:default;">
            <i class="fas fa-file-pdf"></i> ${procTitle}
          </span>`;
      }
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
             onclick="openPdfLink('${p.schema}');">
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
  renderSkeleton('certificationsGrid', 3);
  try {
    const res = await fetch('data_certifications.json');
    if (!res.ok) throw new Error('Erreur fetch certifications');
    const data = await res.json();
    certifications = data.certifications || [];
    document.getElementById('certificationsGrid').innerHTML = certifications.map(c => `
      <div class="cert-card card" onclick="window.location.href='certification-detail.html?id=${c.id}'" style="cursor:pointer;">
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

  if (c.link) {
    html += `
      <div style="text-align:center; margin-top:2rem;">
        <a href="${c.link}" ${c.link.toLowerCase().endsWith('.pdf') ? `onclick="event.preventDefault(); openPdfModal('${c.link}', '${c.title}')"` : 'target="_blank" rel="noopener noreferrer"'} class="btn btn-primary" style="font-size:1.1rem;">
          <i class="fas fa-external-link-alt"></i> Voir la certification
        </a>
      </div>`;
  }

  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.add('is-open');
}

async function loadProcedures() {
  renderSkeleton('proceduresGrid', 4);
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


function openPdfLink(url) {
  window.open(url, '_blank');
}

function presentPdf(url, title, e) {
  if (e) e.preventDefault();
  const prev = document.getElementById('pdf-present-modal');
  if (prev) prev.remove();
  const modal = document.createElement('div');
  modal.id = 'pdf-present-modal';
  modal.innerHTML = `
    <div class="ppm-header">
      <span class="ppm-title">${title || 'Document PDF'}</span>
      <div style="display:flex;gap:0.5rem;">
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="ppm-btn" title="Ouvrir dans un onglet">
          <i class="fas fa-external-link-alt"></i>
        </a>
        <button class="ppm-btn ppm-close" onclick="document.getElementById('pdf-present-modal').remove()" title="Fermer">✕</button>
      </div>
    </div>
    <iframe src="${url}" class="ppm-frame"></iframe>
  `;
  document.body.appendChild(modal);
}

function openProcedureModal(id) {
  const p = procedures.find(p => p.id === id);
  if (!p) return;
  if (p.file) openPdfLink(p.file);
}
function renderProcedures(procs) {
  document.getElementById('proceduresGrid').innerHTML = procs.map(p => {
    const href = p.file ? `href="${p.file}" target="_blank" rel="noopener noreferrer"` : '';
    return `
    <div class="pdf-card-wrap">
      <a class="procedure-card card" ${href} style="text-decoration:none;color:inherit;display:block;cursor:${p.file ? 'pointer' : 'default'};">
        ${p.vitrine ? `
          <div class="vitrine-container">
            <img src="${p.vitrine}" alt="${p.title}" class="procedure-vitrine">
          </div>
        ` : `
          <i class="${p.icon || 'fa-solid fa-file-pdf'} procedure-icon"></i>
        `}
        <div class="card-content">
          <h4>${p.title}</h4>
          <p class="card-date"><i class="fas fa-calendar-alt"></i> ${p.date}</p>
          <p>${p.description.substring(0, 120)}${p.description.length > 120 ? '...' : ''}</p>
        </div>
      </a>
      ${p.file ? `<button class="present-trigger" onclick="presentPdf('${p.file}','${p.title}',event)"><i class="fas fa-expand"></i> Présenter</button>` : ''}
    </div>`;
  }).join('');
}

// Chargement Veilles
async function loadVeilles() {
  if (!document.getElementById('veillesGrid')) return;
  renderSkeleton('veillesGrid', 4);
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
    <div class="procedure-card card veille-card" onclick="window.location.href='veille-detail.html?id=${v.id}'" style="cursor:pointer;">
      ${v.vitrine || v.image ? `
        <div class="vitrine-container">
          <img src="${v.vitrine || v.image}" alt="${v.title}" class="procedure-vitrine">
        </div>
      ` : `
        <i class="${v.icon || 'fas fa-rss'} procedure-icon"></i>
      `}
      <div class="card-content">
        <h4>${v.title}</h4>
        <p class="card-date"><i class="fas fa-calendar-alt"></i> ${v.date}</p>
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
// ====================== TABLEAU TCS E4 INTERACTIF ======================
async function loadTCS() {
  try {
    const res = await fetch('data_tcs.json');
    if (!res.ok) return;
    const data = await res.json();
    window._tcsData = data.tcs;
  } catch(e) { console.warn('TCS non chargé:', e); }
}

function openTCSModal() {
  openPdfLink('fi/TCS.pdf');
}
// Fermeture Modal
document.addEventListener('click', e => {
  const modal = document.getElementById('modal');
  if (e.target === modal || e.target.classList.contains('modal-close')) {
    modal.classList.remove('is-open');
    modal.classList.remove('modal--pdf');
  }
});

// Menu Mobile
const mobileToggleBtn = document.getElementById('mobileToggle');
mobileToggleBtn?.addEventListener('click', () => {
  document.querySelector('.nav-menu').classList.toggle('active');
  mobileToggleBtn.classList.toggle('open');
});

// Dropdown Navigation
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');
  const isMobile = () => window.innerWidth <= 900;

  dropdowns.forEach(dropdown => {
    let closeTimer;

    // Desktop : survol avec délai de fermeture (évite la fermeture accidentelle)
    dropdown.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      clearTimeout(closeTimer);
      dropdown.classList.add('open');
    });
    dropdown.addEventListener('mouseleave', () => {
      if (isMobile()) return;
      closeTimer = setTimeout(() => dropdown.classList.remove('open'), 150);
    });

    // Mobile : clic pour toggle
    const trigger = dropdown.querySelector('a');
    trigger?.addEventListener('click', (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      // ferme tous les autres
      dropdowns.forEach(d => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
  });

  // Fermeture sur clic extérieur
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });

  // Fermeture sur resize si on passe en desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });
}

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

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

  // EmailJS
  emailjs.init("PZ1SG6m4MUTM_Lhof");
  const serviceID = "service_puah3qe";
  const templateID = "template_oza7n4t";

  emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
      status.textContent = 'Message envoyé ! Je vous réponds bientôt.';
      status.style.color = 'var(--accent-primary)';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Envoyer';
      this.reset();
    }, (err) => {
      status.textContent = 'Erreur d\'envoi. Réessayez.';
      status.style.color = 'var(--accent-tertiary)';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Envoyer';
      console.error('EmailJS erreur:', err);
    });
});

// Scroll Animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.style.opacity = 1;
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section').forEach(sec => observer.observe(sec));


// ====================== FONCTIONNALITÉS PREMIUM ======================

// 1. Progress bar de scroll
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
}

// 2. Bouton Back to Top
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.title = 'Retour en haut';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// 3. Scroll reveal sur toutes les cartes
function initScrollReveal() {
  const selector = '.card, .project-card, .procedure-card, .cert-card, .skill-card, .veille-card, .reveal';
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

// 4. Stats animées dans le hero (seulement sur index.html)
async function initHeroStats() {
  const hero = document.querySelector('.hero-section .hero-inner') || document.querySelector('.hero-section .container');
  if (!hero || !document.querySelector('.hero-name, .hero-title')) return;
  try {
    const [projRes, certRes, procRes] = await Promise.all([
      fetch('data_projects.json'),
      fetch('data_certifications.json'),
      fetch('data_procedures.json')
    ]);
    const [pj, ce, pr] = await Promise.all([projRes.json(), certRes.json(), procRes.json()]);
    const stats = [
      { n: (pj.projects||[]).length, label: 'Projets' },
      { n: (ce.certifications||[]).length, label: 'Certifications' },
      { n: (pr.procedures||[]).length, label: 'Procédures' },
    ];
    const statsDiv = document.createElement('div');
    statsDiv.className = 'hero-stats';
    statsDiv.innerHTML = stats.map((s, i) => `
      ${i > 0 ? '<div class="hero-stat-separator"></div>' : ''}
      <div class="hero-stat">
        <div class="hero-stat-number" data-target="${s.n}">0</div>
        <div class="hero-stat-label">${s.label}</div>
      </div>`).join('');
    const btn = hero.querySelector('.btn');
    if (btn) hero.insertBefore(statsDiv, btn);
    else hero.appendChild(statsDiv);
    // Compteurs animés
    statsDiv.querySelectorAll('.hero-stat-number').forEach(el => {
      const target = +el.dataset.target;
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 20));
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(t);
      }, 60);
    });
  } catch(e) {}
}

// Remplissage de l'année dans les footers
function initCurrentYear() {
  document.querySelectorAll('#currentYear').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

// Init tout (appel des fonctions)
document.addEventListener('DOMContentLoaded', () => {
  // initGalaxy(); // Décommenter si fond animé voulu
  loadProjects();
  loadCerts();
  loadVeilles();
  loadCompetences();
  loadProcedures();
  loadTCS();
  initDropdowns();
  initScrollProgress();
  initBackToTop();
  initScrollReveal();
  initHeroStats();
  initCurrentYear();
});