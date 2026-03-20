<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/icon.svg" />
  <img src="public/icon.svg" alt="WiFi Access Card Generator" width="96" />
</picture>

# WiFi Access Card Generator

**Create professional WiFi access cards, stickers, and information sheets with scannable QR codes.**

Manage multiple wireless networks, generate printable materials in 16 languages, and share credentials securely — all from your browser, no account required.

[![Live App](https://img.shields.io/badge/Live_App-wifi--access--cards.app.bauer--group.com-FF8500?style=for-the-badge&logo=wifi&logoColor=white)](https://wifi-access-cards.app.bauer-group.com)

[![Deploy to GitHub Pages](https://github.com/bauer-group/COM-WiFiAccessCardGenerator/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bauer-group/COM-WiFiAccessCardGenerator/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)

</div>
<!-- markdownlint-enable MD033 MD041 -->

---

## Features

### Network Management

- **Unlimited WiFi networks** stored locally in your browser (IndexedDB)
- Support for **Open**, **WPA/WPA2/WPA3 PSK**, and **WPA2/WPA3 Enterprise (EAP)** networks
- EAP configuration: PEAP, TLS, TTLS, LEAP, PWD with Phase 2 authentication
- PSK password validation enforcing WPA standard (8–63 characters)
- Search, edit, duplicate, and organize your networks

### Printable Materials

- **Information Sheets** (A4) — full-page layout with large QR code, ideal for laminating
- **Stickers** — compact 2-per-row layout, cut along dashed borders
- **Cards** — credit card size (85.6 x 54mm), perfect for laminated handouts
- Real-time print preview with layout selection
- Direct printing via browser (suppressed headers/footers)
- **PDF download** — generates actual PDF files with embedded metadata (author, title, keywords)

### Multilingual

- **16 languages**: English, Deutsch, Francais, Espanol, Italiano, Portugues, Turkce, Polski, Russkij, Arabic, Chinese, Japanese, Korean, Georgian, Thai, Vietnamese
- Separate UI language and print language settings
- **Multi-language printouts**: information sheets stack labels vertically per language; stickers and cards generate one per language per network
- Auto-detects browser language with fallback to English

### Secure Sharing

- **Share via link** — encode one or all networks into a URL fragment
- **Password protection** — AES-256-GCM encryption with PBKDF2 key derivation (310,000 iterations, SHA-256)
- All cryptography runs client-side via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — no data leaves the browser
- URL length monitoring with warnings when exceeding safe browser limits
- Import shared credentials with one click; decryption prompt for password-protected links

### Progressive Web App

- **Install on any device** — desktop, tablet, or phone
- **Works fully offline** after first load (Service Worker with Workbox precaching)
- Auto-updates via `skipWaiting` + `clientsClaim`
- Translation files cached with StaleWhileRevalidate strategy

---

## Quick Start

### Prerequisites

- [Node.js 24+](https://nodejs.org/) (see `.nvmrc`)
- npm (comes with Node.js)

### Development

```bash
# Clone the repository
git clone https://github.com/bauer-group/COM-WiFiAccessCardGenerator.git
cd COM-WiFiAccessCardGenerator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Deployment

### GitHub Pages (recommended)

Deployments are automated via GitHub Actions. Push to `main` and the workflow builds and deploys to GitHub Pages.

**Setup:** Repository Settings > Pages > Source > **GitHub Actions**

### Docker

```bash
# Build and run
docker compose up -d

# Access at http://localhost:8080
```

The Docker setup includes:

- Multi-stage build (Node.js > Nginx Alpine)
- Read-only root filesystem with minimal capabilities
- Resource limits (256MB memory, 1 CPU)
- Security headers (CSP, X-Frame-Options, HSTS-ready)
- Health check endpoint at `/health`
- Gzip compression and optimized caching

---

## Tech Stack

| Layer      | Technology                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)                                               |
| Build      | [Vite 7](https://vite.dev/) + [SWC](https://swc.rs/)                                                                             |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com/)                                                                                        |
| Components | [Radix UI](https://www.radix-ui.com/) primitives                                                                                  |
| Icons      | [Lucide React](https://lucide.dev/)                                                                                               |
| Database   | [Dexie.js](https://dexie.org/) (IndexedDB wrapper)                                                                                |
| i18n       | [i18next](https://www.i18next.com/) with browser language detection                                                               |
| QR Codes   | [qrcode.react](https://github.com/zpao/qrcode.react)                                                                             |
| PDF        | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas-pro](https://github.com/nicolo-ribaudo/html2canvas-pro) (lazy-loaded)   |
| PWA        | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + [Workbox](https://developer.chrome.com/docs/workbox/)                      |
| Crypto     | [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (PBKDF2 + AES-256-GCM)                         |
| Server     | [Nginx Alpine](https://hub.docker.com/_/nginx) (Docker)                                                                           |

---

## Project Structure

```text
src/
  components/       # React components
    ui/             # Radix-based design system (Button, Dialog, Select, ...)
    NetworkCard.tsx  # Network list item with QR code and actions
    NetworkForm.tsx  # Add/edit network form with validation
    PrintView.tsx    # Print layouts (Sheet, Sticker, Card)
    PrintDialog.tsx  # Print preview + PDF generation
    ShareDialog.tsx  # Share link generation with encryption
    ImportDialog.tsx # Import shared credentials
    SettingsPanel.tsx
  context/          # Theme context (light/dark/system)
  db/               # Dexie database schema and operations
  utils/
    crypto.ts       # AES-256-GCM encryption/decryption
    share.ts        # Share link encoding/decoding
    wifi-qr.ts      # WIFI: URI scheme generation
    print-labels.ts # Static print labels for all 16 languages
  i18n.ts           # i18next configuration
  types/            # TypeScript type definitions
public/
  locales/          # Translation files (16 languages)
  icon-*.png        # PWA icons
```

---

## Scripts

| Command                  | Description                      |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start development server         |
| `npm run build`          | Type-check and build for production |
| `npm run preview`        | Preview production build         |
| `npm run test`           | Run tests in watch mode          |
| `npm run test:run`       | Run tests once                   |
| `npm run type-check`     | TypeScript type checking         |
| `npm run generate-icons` | Generate PWA icons from SVG      |
| `npm run clean`          | Remove dist and Vite cache       |

---

## Security

- **No server, no tracking** — all data stays in your browser's IndexedDB
- **Encryption** — shared links can be protected with AES-256-GCM (PBKDF2 310k iterations)
- **CSP headers** — Content Security Policy configured in Nginx
- **Docker hardening** — read-only filesystem, dropped capabilities, no-new-privileges
- **Dependency auditing** — `npm audit` runs clean with zero vulnerabilities

---

## Corporate Identity

This project follows the [BAUER GROUP Corporate Identity](https://github.com/bauer-group) guidelines:

- **Primary color**: BAUER Orange `#FF8500`
- **Typography**: System font stack
- **Warm gray palette**: `#F9F8F6` to `#231F1C`

---

## License

[MIT](LICENSE) &copy; 2026 BAUER GROUP
