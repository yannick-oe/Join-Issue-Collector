## Overview

Join 360 is an advanced project management platform built on top of the Developer Akademie Join Kanban base and extended into a production-grade workflow automation system. It bridges the gap between external stakeholders and internal development teams by automating the entire request lifecycle — from a stakeholder sending an email to a fully structured AI-generated ticket appearing on the Kanban board in real time.

Core capabilities at a glance:

- **Stakeholder request system** — a public-facing, multi-screen entry flow for external users, requiring no board account
- **Automated email parsing** via Gmail integration and n8n workflow orchestration
- **AI task generation** using Google Gemini — titles, descriptions, subtasks, priorities, and due dates
- **Firebase Realtime Database sync** — tasks appear on the board the moment they are written
- **Responsive project management dashboard** optimized for desktop, tablet, and 320 px mobile

---

## Features

### Kanban & Task Management
- **Five-column Kanban board** — Triage, To Do, In Progress, Await Feedback, Done
- **Drag & Drop** — smooth column-to-column card movement with touch support
- **Task priorities & subtasks** — configurable priority levels and checkable sub-items
- **Dynamic overlays** — full task detail, edit, and creation panels rendered without page reloads
- **AI badge** — visual indicator on tickets created through the automated pipeline

### Workflow Automation
- **AI-generated tickets** — Gemini AI produces complete, structured task objects from raw email text
- **Gmail + n8n pipeline** — email trigger automatically starts the n8n orchestration workflow
- **Smart duplicate detection** — identical or near-identical requests are identified before ticket creation
- **Daily request limiter** — configurable cap with localStorage-backed counter and graceful fallback flow
- **Automated feedback mail** — submitters receive a confirmation email upon successful ticket creation

### Platform
- **Firebase Realtime Database** — low-latency storage and live board synchronization
- **Firebase Authentication** — secure member login and session management
- **Stakeholder request system** — three-screen public flow (Welcome → Request → Limit Reached)
- **Contact management** — assignee directory with avatar generation and inline editing
- **Responsive UI** — pixel-perfect layouts across all breakpoints, down to 320 px

---

## AI Workflow

The following pipeline simulates a modern enterprise workflow automation architecture, replacing manual ticket triage entirely.

```
Stakeholder
    │
    ▼
[1] Submits request via Join 360 stakeholder page
    │
    ▼
[2] Email client opens with pre-filled template → stakeholder sends email
    │
    ▼
[3] Gmail Trigger fires → n8n workflow starts
    │
    ▼
[4] Email content is normalized and parsed
    │
    ├──[5] Duplicate check against existing Firebase tasks
    │
    └──[6] Daily request limit validated (Firebase + timestamp)
            │
            ▼
        [7] Google Gemini AI generates:
            • Task title
            • Structured description
            • Subtask breakdown
            • Priority level
            • Estimated due date
            │
            ▼
        [8] Task payload written to Firebase Realtime Database
            │
            ▼
        [9] Task appears instantly in Join 360 Triage column
            │
            ▼
       [10] Automated confirmation email sent to stakeholder
```

This architecture decouples stakeholder communication from internal team tooling and eliminates manual ticket creation overhead entirely.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure and accessibility |
| **CSS / SCSS** | Component-scoped styling, responsive layouts, custom properties |
| **JavaScript** | UI logic, state management, DOM rendering, Firebase SDK |
| **Firebase Realtime Database** | Live task storage and cross-client synchronization |
| **Firebase Authentication** | Secure member login, session handling |
| **n8n** | Workflow orchestration — email parsing, validation, AI orchestration |
| **Gmail API** | Email trigger and outbound confirmation delivery |
| **Google Gemini AI** | Natural-language task generation from raw request text |
| **Figma** | Design source — pixel-perfect implementation reference |

---

## Responsive Design

Join 360 was designed and implemented with a mobile-first philosophy, covering the full device spectrum:

| Breakpoint | Target |
|---|---|
| ≥ 1280 px | Full desktop layout |
| ≤ 1024 px | Compact desktop / large tablet |
| ≤ 768 px | Tablet — adaptive navigation and grid |
| ≤ 560 px | Mobile — single-column layouts |
| ≤ 360 px | Small mobile — scaled typography and spacing |
| 320 px | Minimum supported viewport |

Custom responsive treatments were implemented for:

- **Summary dashboard** — CSS Grid-based card layout that reflows from three rows to a compact single-column stack
- **Board overlays** — task detail panels with height constraints and scrollable content on small viewports
- **Stakeholder pages** — mobile-first single-column flow with desktop two-column CSS Grid layout via named template areas
- **Mobile navigation** — fixed bottom nav bar replacing the desktop sidebar on narrow screens

---

## Project Highlights

**Scalable frontend architecture** — feature logic is split into domain-specific modules (`board.data.js`, `board.render.js`, `board.interactions.js`, etc.) rather than monolithic files, keeping concerns cleanly separated.

**Reusable component model** — shared templates, overlay patterns, and button systems are defined once and composed across all pages through a consistent `.sh-*` / BEM-adjacent naming scheme.

**Automation-ready data contract** — the Firebase task payload schema is fully documented and structured to be consumed directly by any n8n workflow or external API without additional transformation.

**Realtime synchronization** — Firebase listeners ensure the board reflects the latest state for all connected clients without requiring manual refresh.

**AI integration depth** — Gemini AI is not used as a simple text generator; it produces semantically structured task objects (title, description, subtasks, priority, due date) that are immediately actionable within the board's data model.

**Accessibility focus** — ARIA labels, semantic HTML5 landmark elements, and keyboard-navigable interactive components are implemented throughout.

---

## Setup

### Prerequisites
- A modern browser with Live Server support (VS Code extension recommended)
- A Firebase project with Realtime Database and Authentication enabled
- An n8n instance (cloud or self-hosted)
- A Gmail account configured as the receiving inbox
- A Google Gemini API key

### Installation

```bash
git clone https://github.com/your-username/join-360.git
cd join-360
```

Open `index.html` with **Live Server** — no build step required.

### Configuration

**Firebase**  
Create your local config file from the provided template:
```bash
cp scripts/firebase-config.example.js scripts/firebase-config.js
```
Then edit `scripts/firebase-config.js` and replace the placeholder URL with your Firebase Realtime Database URL:
```js
const FIREBASE_CONFIG = {
  baseUrl: "https://YOUR-PROJECT-default-rtdb.YOUR-REGION.firebasedatabase.app/",
};
```
> `firebase-config.js` is gitignored and must never be committed. `firebase-config.example.js` serves as the committed template.

**n8n Workflow**  
Import the workflow definition (see `docs/n8n-task-payload.md`) into your n8n instance. Configure the Gmail trigger with the receiving inbox credentials.

**Gemini AI**  
Add your Gemini API key to the n8n workflow's HTTP Request node. The prompt template and expected response schema are documented in `docs/n8n-task-payload.md`.

---

## Folder Structure

```
join-360/
├── index.html                    # Member login / entry point
├── pages/
│   ├── board.html                # Kanban board
│   ├── summary.html              # Dashboard overview
│   ├── stakeholder.html          # Stakeholder request flow
│   ├── add-task.html
│   ├── contacts.html
│   └── ...
├── scripts/
│   ├── firebase-config.js        # ⚠ gitignored — local DB URL (create from example)
│   ├── firebase-config.example.js# Template for firebase-config.js
│   ├── storage.js                # Storage adapter (Firebase / localStorage)
│   └── pages/
│       ├── board.data.js         # Data fetching & Firebase sync
│       ├── board.render.js       # Card and column rendering
│       ├── board.interactions.js # Drag & Drop, event handling
│       ├── board.overlay.js      # Task detail / edit overlays
│       ├── stakeholder.js        # Stakeholder flow logic
│       ├── summary.js            # Dashboard counters
│       └── ...
├── css/
│   ├── global.css
│   ├── layout.css
│   ├── components.css
│   ├── responsive.css            # Imports all breakpoint files
│   ├── responsive-desktop.css
│   ├── responsive-tablet.css
│   ├── responsive-mobile.css
│   └── pages/
│       ├── board.css
│       ├── stakeholder.css       # Stakeholder page — fully scoped
│       ├── summary.css
│       └── ...
├── assets/
│   ├── fonts/
│   └── icon/
└── docs/
    └── n8n-task-payload.md       # Firebase payload contract & n8n setup
```

---

## Future Improvements

| Feature | Description |
|---|---|
| **Role management** | Granular permissions — viewer, editor, admin — per board and project |
| **Analytics dashboard** | Task throughput, AI acceptance rates, stakeholder activity metrics |
| **Live collaboration** | WebSocket-based presence indicators and real-time cursor sharing |
| **Advanced AI categorization** | Multi-label tagging, automatic team assignment, and effort estimation |
| **Attachment support** | File uploads linked to tasks via Firebase Storage |
| **Notification center** | In-app and push notifications for assignments, comments, and status changes |
| **Audit logs** | Immutable activity history for every task and board action |

---

## Author

Developed by **Yannick Oetelshoven**  
Product-oriented frontend developer with a focus on workflow automation, AI integration, and modern responsive UI engineering.