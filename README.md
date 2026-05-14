# Join Issue Collector

A Kanban-style project management tool extended with a stakeholder request flow and AI-generated ticket support, built as a full frontend upgrade on top of the original Join project from Developer Akademie.

---

## Features

- **Kanban board** with five columns: Triage, To Do, In Progress, Await Feedback, Done
- **Triage column** as a dedicated landing zone for all incoming requests
- **Stakeholder entry page** — a public-facing, three-screen flow that lets external stakeholders submit feature requests via email without needing a board account
- **AI-generated ticket concept** — task objects carry an `isEmailRequest` flag and an `aiGenerated` flag; tickets created via email automation display a visual AI badge in the detail overlay
- **Creator row** in the task detail overlay showing whether a ticket was raised by a team member or an external requester
- **n8n automation preparation** — the Firebase task payload contract is fully defined and documented, ready to be consumed by an n8n workflow
- **Summary dashboard** with an "Email requests" counter that tracks external submissions
- **Responsive design** across mobile, tablet and desktop breakpoints

---

## Demo Flow

1. **Stakeholder opens the entry page** at `/pages/stakeholder.html`
2. On the welcome screen the stakeholder selects **"Create request"**
3. The request screen opens — clicking **"Create Email Request"** launches the user's email client with a pre-filled subject and body template
4. The stakeholder sends the email to the configured team inbox
5. *(n8n step — planned)* The n8n workflow parses the email, builds a task payload and writes it to Firebase
6. The **Join board reloads** and the new ticket appears in the **Triage column** with an AI badge and the external requester's details
7. The internal team **reviews the ticket**, adds assignees and moves it through the board columns

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (modular, scoped per page) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Firebase Realtime Database |
| Automation | n8n *(integration planned)* |

---

## n8n Integration

The n8n automation workflow is **planned and prepared** but not yet live. The frontend is fully ready to receive n8n-generated tasks:

- Every task object is normalized on load — new fields (`isEmailRequest`, `requestSource`, `creatorType`, etc.) have safe fallbacks so existing tasks are unaffected.
- The complete **Firebase payload contract** is documented in [`docs/n8n-task-payload.md`](docs/n8n-task-payload.md), including all required and optional fields, valid status and priority values, a full JSON example, and a manual testing checklist.
- The `buildRequestMailtoHref()` function in `stakeholder.js` is the single point that will be replaced with a webhook `fetch()` call when the n8n workflow goes live — a `TODO` comment marks the exact location.

> **No credentials, webhook URLs or Firebase secrets are stored in this repository.**  
> Configure those values through environment variables or a secrets manager before deploying.

---

## Security / Privacy

- No API keys, Firebase database URLs, service account credentials or webhook secrets are committed to this repository.
- Sensitive configuration must be stored outside Git (environment variables, a secrets manager, or a local config file listed in `.gitignore`).
- The stakeholder page collects no personal data beyond what the user voluntarily includes in their email.

---

## Project Status

| Area | Status |
|---|---|
| Core Kanban board | Complete |
| Stakeholder entry page (3 screens) | Complete |
| Task data model (origin & creator fields) | Complete |
| Board overlay — AI badge & creator row | Complete |
| Summary email-request counter | Complete |
| n8n payload contract documentation | Complete |
| n8n workflow implementation | Planned — next milestone |
| Firebase production configuration | Pending |
