# Colombo Associates — Corporate Web Platform & Backend Engine

> **Premier Corporate, Commercial & Dispute Resolution Law Firm — Colombo, Sri Lanka**  
> Modern, ultra-responsive web platform featuring full backend API services, recruitment vault, client matter intake, and zero external runtime dependencies.

---

## 🏛️ Overview

Colombo Associates is a top-tier corporate legal practice in Sri Lanka. This platform delivers a premier digital presence engineered for high performance, accessibility, mobile responsiveness, and bank-grade client inquiry handling.

### Key Capabilities
- **10 Core Firm Pages**:
  - `index.html` — Homepage with dynamic practice areas, trust metrics, and global capability overview.
  - `about.html` — Firm heritage, leadership philosophy, and multi-jurisdictional reach.
  - `services.html` — Detailed practice areas covering 15 corporate and dispute specializations.
  - `international-desk.html` — Foreign direct investment (FDI), cross-border taxation, and international arbitration.
  - `people.html` — Partner biographies, bar admissions, and practice focus.
  - `insights.html` — Legal briefings, regulatory alerts, and judicial commentaries with interactive filter tags.
  - `careers.html` — Career opportunities, pupillage programs, and integrated digital application portal.
  - `contact.html` — Interactive conflict-checked enquiry intake form, office locations, and direct channels.
  - `privacy.html` — Comprehensive data privacy notice and client confidentiality statements.
  - `terms.html` — Terms of engagement, regulatory disclaimers, and website terms of use.

- **Backend & Database (`server.js`)**:
  - **Zero external dependencies**: Built using standard Node.js libraries (`http`, `fs`, `path`, `crypto`) for maximum portability, speed, and security.
  - **Matter Enquiry Intake API** (`POST /api/enquiry`): Captures prospective client matters with sanitization, practice validation, conflict clearance markers, and anti-spam protection.
  - **Recruitment Vault API** (`POST /api/careers/apply`): Accepts applicant CVs and Cover Letters with magic-byte document validation (PDF, DOC, DOCX up to 5MB), SHA-256 integrity checksums, and structured JSON record storage.
  - **Health & Monitoring** (`GET /api/health`): Ready for health checks across modern cloud hosts (Render, Railway, Docker, AWS).
  - **Security Hardened**: Path traversal mitigation, honeypot spam detection, strict rate limiting, and restricted access to vault data.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16.0.0 or higher)
- Git

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/Dilsath0512/colombo-associates.git
cd colombo-associates

# 2. Start the server
npm start
# or: node server.js
```

The application will be live at:
- **Local:** `http://localhost:3000/`
- **Network:** `http://0.0.0.0:3000/`

---

## 📁 Repository Structure

```
colombo-associates/
├── assets/                  # High-resolution logos, partner portraits, SVG icons
├── css/
│   └── style.css            # Unified design system, typography & mobile responsiveness
├── data/                    # Encrypted / secure database store
│   ├── enquiries/           # Client enquiry records (enquiries.json)
│   └── recruitment/         # Candidate applications (applications.json) & docs
├── js/
│   ├── main.js              # Navigation, mobile menus, animations & page interactions
│   ├── careers.js           # Document upload handling & recruitment form validation
│   ├── contact.js           # Client matter enquiry submission & UI feedback
│   └── insights.js          # Client-side filtering & search for briefings
├── index.html               # Main homepage
├── about.html               # About the firm
├── services.html            # Practice areas
├── international-desk.html  # Cross-border & foreign investment
├── people.html              # Partners & legal team
├── insights.html            # Publications & briefings
├── careers.html             # Careers & pupillages
├── contact.html             # Contact & matter intake
├── privacy.html             # Privacy policy
├── terms.html               # Terms of use
├── server.js                # Core HTTP & API server
├── package.json             # Project metadata & npm scripts
├── .gitignore               # Ignored dependencies & confidential uploads
└── README.md                # Documentation
```

---

## 🌐 Cloud Deployment

This application can be deployed instantly to any cloud hosting provider:

### Render / Railway / Heroku
1. Connect your GitHub repository (`Dilsath0512/colombo-associates`).
2. Set Build Command: *(Leave blank or `npm install`)*
3. Set Start Command: `npm start`
4. Set Environment Variable: `PORT=3000` (automatically detected on most platforms).

---

## ⚖️ Legal & Copyright

© 2026 Colombo Associates. All rights reserved.  
Maintained by Mohamed Dilsath.
