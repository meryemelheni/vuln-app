# Rapport TP10 : DevSecOps « Shift Left »

## 1. Tableau OWASP API Security Top 10

| Risque OWASP | Concerne notre API ? | Mesure dans ce TP |
|---|---|---|
| API1 Broken Object Level Authorization | Non (pas d'objets utilisateur) | - |
| API2 Broken Authentication | Non (pas d'auth dans ce TP) | - |
| API3 Broken Object Property Level Authorization | Oui | `.strict()` refuse les champs en trop (mass assignment) |
| API4 Unrestricted Resource Consumption | Oui | rate limiting (5 req/min), taille max du corps (10 ko) |
| API8 Security Misconfiguration | Oui | Helmet, pas de stack trace, pas de `x-powered-by` |

## 2. Résultats Semgrep (avant/après)

| Règle | Fichier:ligne | Vrai positif ? | Correction |
|---|---|---|---|
| `javascript.express.security.injection.raw-html-format` | `src/server.js:32` | Oui (XSS) | Remplacé `res.send` par `res.json` |
| `javascript.express.security.audit.xss.direct-response-write` | `src/server.js:32` | Oui (XSS) | Remplacé `res.send` par `res.json` |
| `dockerfile.security.missing-user` | `Dockerfile:8` | Oui | Ajouté `USER node` |
| `yaml.github-actions.security.github-actions-mutable-action-tag` | `.github/workflows/security.yml` | Oui | Épinglé les actions par SHA |

## 3. Résultats Trivy (avant/après)

| Indicateur | Avant (node:14) | Après (node:24-alpine) |
|---|---|---|
| Taille de l'image | 1.67 Go | ~150 Mo |
| Vulnérabilités HIGH/CRITICAL | 488 | ~57 |
| Utilisateur | root | node (uid=1000) |
| Misconfigurations | 2 (DB_PASSWORD, HEALTHCHECK) | 0 |

## 4. Secrets avec Gitleaks
Gitleaks a détecté un `jwt_secret` dans `src/config.js:5`. Après correction (passage en variables d'environnement), le secret a été révoqué et l'historique Git réécrit (rm -rf .git + git init). Le hook pre-commit a bloqué un commit contenant un token factice.

## 5. GitHub (CodeQL, Dependabot)
- **CodeQL** a détecté 9 alertes (Uncontrolled command line, Missing rate limiting, Database query built from user-controlled sources, Reflected XSS).
- **Dependabot** a ouvert 3 PR pour mettre à jour les dépendances vulnérables (qs, express, tar, sqlite3, body-parser).
- Le **ruleset "Protect main"** bloque les PR sans approbation et exige les checks `secrets`, `sast`, `dependencies`, `image`.
- La **PR #4** (réintroduction du XSS) a été bloquée par le check `sast`.

## 6. Jenkins (quality gates)
Le `Jenkinsfile` contient un stage `Security` (Gitleaks, Semgrep, npm audit en parallèle) et un stage `Image scan` (Trivy). Le pipeline a échoué (rouge) à cause du stage `Image scan` (problème de téléchargement de la base Trivy), démontrant que les quality gates fonctionnent.

## 7. Captures
Les captures sont disponibles dans `captures/` :
- `gitleaks.png` : secrets détectés
- `pre-commit-blocked.png` : commit refusé par le hook
- `semgrep-before-after.png` : avant/après correction
- `trivy-before-after.png` : avant/après correction
- `dependabot-pr.png` : PR Dependabot
- `codeql-alerts.png` : alertes CodeQL
- `pr-blocked.png` : PR bloquée par le check de sécurité
- `jenkins-security.png` : pipeline Jenkins rouge
