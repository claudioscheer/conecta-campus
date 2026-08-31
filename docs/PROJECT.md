# Conecta Campus

## Product decision

**Conecta Campus** is the semester product for Classes 3-20. It is a mobile space where people in a campus community turn a problem or opportunity into a collaborative proposal.

Someone publishes an idea (for example: an Agronomy student has a proposal to monitor greenhouse sensors, but needs someone in IT/Computer Science to build the mobile app, and someone in Design to craft the interface). People from other areas can support it, contribute an approach, offer a skill, and follow its progress. The product is not a generic social feed. Its unit of value is an idea that can gather evidence, collaborators, and a next step.

This document is the product north star. The official V1 slice (requirements, OpenAPI, data, out of scope) is [`SPEC.md`](./SPEC.md) plus [`../contract/openapi.yaml`](../contract/openapi.yaml). Weekly templates define the graded student work. Students should build the smallest coherent version of the feature assigned that week, not every feature listed here.

## How implementation evolves

Conecta Campus grows continuously across the four phases of the course:

```text
Classes 1-2: problem, requirements, product states, and scope
Class 3: stakeholder discovery workshop (campus users)
Class 4: official SPEC.md + OpenAPI + how to brief agents; client layers start
Classes 5-8: contract and mock evolution (pagination, payloads, auth, real-time)
Classes 9-14: feature expansion, offline storage, optimistic updates, AI refactoring
Classes 15-20: testing pyramid, CI/CD, performance, release candidate
```

Starting in Class 3, every class works directly on Conecta Campus, applying that week's system design concept to the shared application codebase.

## Product question

How might a student or researcher with a useful campus idea or study problem find people from different disciplines who can help evaluate and advance it?

Examples:

- An Agronomy researcher needs someone from IT to connect greenhouse soil sensors to a mobile dashboard.
- A Biology team needs a mobile field-catalog app with offline data collection for botanical species.
- A Psychology research group needs an accessible app for students to log daily mood journals in an anxiety study.
- A Health Sciences initiative needs software engineers and designers to build a campus peer-support and resource network.

## Users and roles

| User | Need | Main actions |
| --- | --- | --- |
| Idea author | Turn an observed problem into a clear proposal | Create, edit, close, and update an idea |
| Supporter | Signal that an idea matters | Support, save, follow, and share an idea |
| Contributor | Add a useful perspective or offer help | Propose an approach, offer a skill, comment, and join a small working group |
| Moderator | Keep the community usable and safe | Review reports, hide harmful content, and resolve moderation actions |

One student may play more than one role. The first versions only need author, supporter, and contributor behavior.

## Core concept

An idea is more than a title and description. It should answer:

```text
What campus problem or opportunity exists?
Who is affected?
What evidence or observation supports it?
What outcome would improve the situation?
What kind of help is needed next?
```

Each idea has a status:

```text
draft -> open -> exploring -> in-progress -> implemented
                         \-> closed
```

The backend owns status changes, support totals, authorship, timestamps, and permissions. The mobile app displays those decisions and gives clear recovery when a request fails.

## Minimum viable product

The first coherent release contains five connected capabilities:

1. Browse a paginated list of open ideas.
2. View an idea, its supports, and its proposed approaches.
3. Create and edit an idea.
4. Support an idea with a selected support type (one person has one support per idea and can update their support type).
5. Add an approach with a practical contribution.

Suggested support types:

```text
affected-by-this
can-research
can-design
can-build
can-connect-people
```

Suggested approach types:

```text
product-approach
technical-approach
research-or-evidence
skill-offer
```

## Data model

| Entity | Essential fields | Notes |
| --- | --- | --- |
| User | `id`, `name`, `area`, `skills`, `avatarUrl` | Client assumes a known current user; login screens are out of scope for early versions |
| Idea | `id`, `title`, `problem`, `context`, `category`, `status`, `author`, `supportCount`, `createdAt`, `updatedAt` | The feed uses a compact preview shape |
| Approach | `id`, `ideaId`, `author`, `type`, `body`, `technologies`, `createdAt` | A contribution that advances the idea |
| Support | `id`, `ideaId`, `userId`, `type`, `createdAt` | Unique per user and idea (1 support per user, editable type) |
| Comment | `id`, `ideaId`, `author`, `body`, `parentId`, `createdAt` | Add later when the core approach flow works |
| Follow | `userId`, `ideaId`, `createdAt` | Used for saved ideas and notifications later |
| Report | `id`, `targetType`, `targetId`, `reason`, `createdAt` | Moderation is a later extension |

## API contract starter

V1 HTTP is specified in [`../contract/openapi.yaml`](../contract/openapi.yaml) and mapped from [`SPEC.md`](./SPEC.md). Classes 5-8 may still deepen pagination, auth, and real-time on the same resource names.

| Endpoint | Purpose | Important request or response decision |
| --- | --- | --- |
| `GET /ideas?after=&limit=&category=&status=` | Browse ideas | Cursor pagination and a compact idea preview |
| `GET /ideas/{ideaId}` | Load one idea | Detail contains author, support summary, and initial approaches |
| `POST /ideas` | Create an idea | Server assigns `id`, timestamps, and initial `open` status |
| `PATCH /ideas/{ideaId}` | Edit an author-owned idea | Reject edits from other users |
| `POST /ideas/{ideaId}/supports` | Add or change support | Idempotency key prevents duplicate taps from creating duplicate support |
| `DELETE /ideas/{ideaId}/supports/me` | Withdraw support | Returns the current support summary |
| `GET /ideas/{ideaId}/approaches?after=&limit=` | Load approaches | Paginated when discussions grow |
| `POST /ideas/{ideaId}/approaches` | Add a practical contribution | Validate length and allowed approach type |

Every important endpoint needs an example success response and a failure response. The app must distinguish these product states:

| Condition | Product behavior |
| --- | --- |
| First load | Show a loading state without pretending content exists |
| No ideas match a filter | Explain that no ideas were found and offer a clear filter action |
| Network failure with cached feed | Show cached results with an offline indicator and retry action |
| Network failure with no cache | Show a clear error and retry action |
| Support request fails | Restore the previous support state and explain how to retry |
| Permission failure | Explain why the action is unavailable without exposing implementation details |

## Feature catalogue

### Foundation

- Onboarding that explains what makes an idea useful.
- Profile with campus area, disciplines, skills, and interests.
- Sign in and sign out.
- Feed of open ideas.
- Idea detail screen.
- Create, edit, close, and reopen an author-owned idea.
- Categories such as sustainability, student life, accessibility, learning, health, and infrastructure.
- Search, sort, and filters.
- Saved ideas and followed ideas.

### Collaboration

- Typed support that explains how a person relates to an idea.
- Support count and support-type summary.
- Proposed approaches with product, technical, research, and skill-offer types.
- Technologies or tools associated with a technical approach.
- Comments and replies.
- Mentions of other contributors.
- A request for specific help, such as design, research, development, or partnerships.
- Lightweight working group with member roles.
- Attachments or links to research, prototypes, and documents.
- Polls to choose between approaches.

### Progress and discovery

- Idea lifecycle from draft to implemented or closed.
- Status update with a short progress note.
- Milestones and next-step checklist.
- Related ideas by category, campus area, or shared tags.
- Contributor discovery based on declared skills and interests.
- Featured ideas and staff picks.
- Feed ranking based on recency, relevance, and active collaboration.
- Digest of ideas that need a particular skill.
- Calendar view for working sessions or demos.

### Notifications and real-time behavior

- Notification when an idea receives a support or approach.
- Notification when an author changes an idea's status.
- Follow an idea and receive status updates.
- In-app notification inbox.
- Push notification as a prompt to refresh, not the authoritative data channel.
- Live refresh or polling for active discussions.
- Delivery and read state for notifications.

### Trust, safety, and administration

- Report an idea, approach, or comment.
- Block a user.
- Content review queue for moderators.
- Clear community guidelines.
- Author controls for editing, closing, and deleting drafts.
- Rate limits for creation and repeated support actions.
- Audit records for moderation actions.
- Privacy-aware profile fields.
- Accessible content and keyboard or screen-reader support where relevant.

### Reliability and quality

- Local cache of the idea feed and details.
- Cached content visible offline with a clear offline state.
- Retry queue for safe pending actions.
- Optimistic support actions with rollback on failure.
- Pagination with deduplication and refresh behavior.
- Image and attachment size limits.
- Loading, empty, error, and unauthorized states for every main screen.
- Unit tests for domain rules and state transitions.
- Integration tests for repository and mock API behavior.
- UI tests for the core browse, create, support, and contribute flows.
- CI for type checking, tests, linting, and visible course checks.
- Analytics limited to product questions such as feed load time, support failures, and approach creation success.
- Feature flags for experimental ranking or new contribution types.

## Semester build sequence

| Class | Product slice |
| ---: | --- |
| 3 | Define initial API contract, set up React Native + OpenCode, and render initial mocked idea feed |
| 4 | Structure client architecture into UI, state holder, repository, and mock API data source |
| 5 | Implement cursor-paginated `GET /ideas` mock and infinite scroll loading in the feed |
| 6 | Optimize payloads (feed preview vs idea detail) and compare REST with field selection |
| 7 | Add fake authentication, author ownership checks, and idempotent support requests (`POST /ideas/{id}/supports`) |
| 8 | Implement mock real-time events and notification channel for idea updates |
| 9 | Expand navigation, multi-screen idea details, new idea creation, and author profile |
| 10 | Write BDD scenarios and verify state behavior for browsing, creating, and supporting an idea |
| 11 | Add local storage and offline-first reading for ideas feed and details |
| 12 | Make support and approach creation optimistic with local action queue and failure recovery |
| 13 | Use AI-assisted development for a bounded test or refactor with explanation of every change |
| 14 | Clean up architecture, enforce unidirectional data flow, and improve modularization |
| 15 | Build automated testing suite (unit, repository integration, and UI component tests) |
| 16 | Automate type checking, linting, and test runs in GitHub Actions CI |
| 17 | Profile feed performance, memory footprint, network efficiency, and battery impact |
| 18 | Put a new feed ranking or contribution type behind a feature flag |
| 19 | Configure build profile and produce an Android release candidate (APK / EAS build) |
| 20 | Demo the Conecta Campus app and defend its scope, API contracts, architecture, and tradeoffs |

## Scope discipline

The product should become deeper, not merely larger. The required end-to-end journey is:

```text
Browse an idea
-> Understand the problem and current approaches
-> Support it or add a useful approach
-> See the result, including failure recovery when needed
```

Chat, complex matching, external integrations, file uploads, ranking algorithms, and full moderation tooling are optional extensions. They should be built only after the required journey is reliable.

## Design questions for students

Before adding a feature, answer:

1. What user problem does this solve?
2. What must the mobile app request from the server?
3. What does the server own and validate?
4. What can fail on a real phone, and what will the person see and do next?
5. How will we test the behavior?
