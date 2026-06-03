# Portfolio Azwaw

## Projet
Portfolio d'un étudiant BTS SIO SISR (réseaux, systèmes, cybersécurité).
Site statique HTML/CSS/JS, données dans des fichiers JSON, hébergé sur
GitHub Pages, affiché aussi dans Wix via un iframe.

## Structure
- Pages : index.html, about.html, competences.html, projets.html,
  procedures.html, veilles.html, certifications.html, cv.html
- Pages détail : projet-detail.html, certification-detail.html, veille-detail.html
- Données : data_projects.json, data_certifications.json, data_procedures.json,
  data_competences.json, data_tcs.json, data_veilles.json
- Style global : style.css — Scripts : scripts.js

## Design — objectif
Look "template Wix professionnel" : propre, aéré, équilibré, fait par un designer.
PAS un rendu générique d'IA.

## Design — règles strictes
- Palette restreinte : vert émeraude profond + neutres (blanc cassé, gris clair) +
  texte presque noir. Maximum 3 couleurs.
- Espacements généreux et cohérents (échelle 8/16/24/32/48/64/96px). Ça doit respirer.
- Typo : 2 polices soignées (un titre à caractère + un texte lisible), via Google Fonts.
  JAMAIS Inter / Poppins / Montserrat.
- Sections pleine largeur qui alternent (fonds clair/coloré), hiérarchie typo nette.
- INTERDIT : dégradés violet/bleu, emojis comme icônes, tout arrondi à 20px,
  cartes identiques sans hiérarchie, symétrie parfaite partout.

## Règles techniques
- Noms de fichiers : minuscules, SANS accents (ex: procedures.html, pas Procédures.html).
- Les PDF des procédures doivent s'ouvrir dans un NOUVEL ONGLET (target="_blank"),
  jamais dans une popup/iframe (sinon ça casse quand le site est embarqué dans Wix).
- Tu PEUX changer le HTML, la mise en page, la composition, les sections, les grilles.
  Garde uniquement le même CONTENU (textes, infos, données JSON) et les mêmes pages.
  Le design (layout ET style) peut changer radicalement.