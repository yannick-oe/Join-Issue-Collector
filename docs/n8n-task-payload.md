# n8n Task Payload Contract

This document defines the exact Firebase payload structure that the n8n automation workflow must write when creating Join tasks from inbound email requests.

The frontend normalizes every task through `boardNormalizeTask()` on load. Fields not present in Firebase receive the safe fallback values listed below. No data migration is required for tasks created before this contract was introduced.

---

## Firebase Path

Tasks are stored as a JSON array under a single key. The n8n workflow must read the current array, append the new task object, and write the array back atomically.

> Do **not** hardcode any Firebase URL, API key, or database secret in this document or in source code that is committed to version control.

---

## Required Fields

These fields must be present and non-empty for the task to render correctly on the board.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique task identifier. Use the pattern `t_<timestamp_base36>` (e.g. `t_lzx4k2`). Must be unique across all tasks. |
| `title` | `string` | Short task title extracted from the email subject. |
| `dueDate` | `string` | Due date in `YYYY-MM-DD` format (e.g. `"2026-06-01"`). |
| `priority` | `string` | See [Priority Values](#priority-values). |
| `status` | `string` | See [Status Values](#status-values). Use `"triage"` for all new email tasks. |
| `category` | `string` | Task category label shown on the card. Use `"Technical Task"` or `"User Story"`. |
| `isEmailRequest` | `boolean` | Must be `true` for all n8n-generated tasks. Drives the AI badge and creator row in the overlay. |
| `creatorType` | `string` | Must be `"external"` for email-sourced tasks. |
| `creatorEmail` | `string` | Email address of the person who sent the request. |
| `requestSource` | `string` | Must be `"email"`. Used by the Summary page counter. |
| `createdAt` | `number` | Unix timestamp in milliseconds (e.g. `Date.now()` in JavaScript). |

---

## Optional Fields

These fields are recommended but the frontend degrades gracefully when they are absent.

| Field | Type | Default | Description |
|---|---|---|---|
| `description` | `string` | `""` | Task body text extracted from the email. |
| `teamMembers` | `string[]` | `[]` | Array of contact IDs to assign the task to. Leave empty if unknown. |
| `subtasks` | `object[]` | `[]` | See [Subtask Structure](#subtask-structure). |
| `aiGenerated` | `boolean` | `false` | Set to `true` when the title/description was composed by an AI model. Triggers the AI badge in the detail overlay. |
| `requestStatus` | `string` | `""` | Lifecycle marker for the request processing pipeline. Suggested values: `"new"`, `"acknowledged"`, `"resolved"`. |
| `requestReceivedAt` | `number` | `null` | Unix timestamp (ms) of when the original email arrived. |
| `creatorLabel` | `string` | `""` | Display name of the external requester (e.g. full name from the email `From` header). |

---

## Status Values

The board normalizer accepts the following values. Any unrecognized value falls back to `"triage"`.

| Value | Board Column |
|---|---|
| `"triage"` | Triage *(use this for all new email tasks)* |
| `"todo"` | To Do |
| `"in-progress"` | In Progress |
| `"await-feedback"` | Await Feedback |
| `"done"` | Done |

---

## Priority Values

The board normalizer accepts the following values. Any unrecognized value falls back to `"medium"`.

| Value | Meaning |
|---|---|
| `"urgent"` | Highest — red indicator |
| `"medium"` | Default — orange indicator |
| `"low"` | Lowest — teal indicator |

---

## Subtask Structure

Each item in the `subtasks` array must conform to:

```json
{
  "id": "s_0_lzx4k2",
  "text": "Subtask description",
  "done": false
}
```

The `id` field is recommended but optional; the normalizer generates one if absent. `done` must be `false` for newly created tasks.

---

## Complete Example Payload

```json
{
  "id": "t_lzx4k2",
  "title": "Login button not responding on mobile",
  "description": "User reports that the login button does nothing when tapped on iOS Safari 17. No error visible in console. Issue reproducible on iPhone 14 Pro.",
  "dueDate": "2026-06-01",
  "priority": "urgent",
  "status": "triage",
  "category": "Technical Task",
  "teamMembers": [],
  "subtasks": [
    { "id": "s_0_lzx4k2", "text": "Reproduce on iOS Safari", "done": false },
    { "id": "s_1_lzx4k2", "text": "Check touch event handlers", "done": false }
  ],
  "isEmailRequest": true,
  "aiGenerated": true,
  "requestSource": "email",
  "requestStatus": "new",
  "requestReceivedAt": 1747180800000,
  "creatorType": "external",
  "creatorLabel": "Jane Doe",
  "creatorEmail": "jane.doe@example.com",
  "createdAt": 1747180860000
}
```

---

## Backward Compatibility

Tasks created before this contract was introduced will not have the origin fields (`isEmailRequest`, `requestSource`, etc.). The frontend normalizer applies the following defaults on load so old tasks continue to work without any data migration:

| Field | Fallback for old tasks |
|---|---|
| `isEmailRequest` | `false` |
| `aiGenerated` | `false` |
| `requestSource` | `"manual"` |
| `requestStatus` | `""` |
| `requestReceivedAt` | `null` |
| `creatorType` | `"member"` |
| `creatorLabel` | `""` |
| `creatorEmail` | `""` |

Old tasks will never show the AI badge or the creator row in the detail overlay.

---

## Testing Checklist

Use this checklist when verifying a manually inserted Firebase task before connecting the live n8n workflow.

- [ ] Task appears in the **Triage** column immediately after page reload.
- [ ] Task card shows the correct **title**, **priority indicator**, and **due date**.
- [ ] Opening the task detail overlay shows the **AI-generated** badge (purple pill with wand icon).
- [ ] The detail overlay shows the **Creator** row with an amber "Extern" badge, the requester's name, and an "E-mail" action button.
- [ ] The **Summary** page "Email requests" counter increments by one.
- [ ] The task can be dragged to other columns without errors.
- [ ] Removing the task from Firebase and reloading leaves the board in a consistent state.
- [ ] No console errors appear during any of the above steps.
