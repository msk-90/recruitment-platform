# Database Design
## Recruitment & Talent Management Platform

**Version:** 1.0
**Database:** MongoDB Atlas (M0 free tier)
**ODM:** Mongoose 8.x

---

## 1. Entity Relationship Diagram
┌─────────────────────┐
│ User │
├─────────────────────┤
│ _id (PK) │
│ name │
│ email (UNIQUE) │
│ password (hashed) │
│ role │ ◄── enum: recruiter | candidate
│ phone │
│ company │ ── recruiter only
│ position │ ── recruiter only
│ skills[] │ ── candidate only
│ resume │ ── candidate only
│ bio │ ── candidate only
│ experience │ ── candidate only
│ createdAt │
│ updatedAt │
└─────────────────────┘
│ │
│ 1 │ 1
│ │
│ * │ *
▼ ▼
┌─────────────────────┐ ┌─────────────────────┐
│ Job │ │ Application │
├─────────────────────┤ ├─────────────────────┤
│ _id (PK) │ │ _id (PK) │
│ recruiter (FK) ────┼──1───*│ job (FK) │
│ title │ │ candidate (FK) │
│ description │ │ resume │
│ company │ │ coverLetter │
│ location │ │ status │
│ type │ │ notes │
│ salary │ │ createdAt │
│ skills[] │ │ updatedAt │
│ status │ └─────────────────────┘
│ applicantsCount │
│ createdAt │
│ updatedAt │
└─────────────────────┘

text

---

## 2. Collections

### 2.1 `users`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | ✅ | 2–80 chars |
| `email` | String | ✅ | unique, lowercase, validated |
| `password` | String | ✅ | bcrypt-hashed, `select: false` |
| `role` | String | ✅ | `recruiter` \| `candidate` |
| `phone` | String | ❌ | |
| `company` | String | ❌ | recruiter only |
| `position` | String | ❌ | recruiter only |
| `skills` | [String] | ❌ | candidate only |
| `resume` | String | ❌ | candidate only, file URL |
| `bio` | String | ❌ | candidate only, ≤ 500 chars |
| `experience` | String | ❌ | candidate only |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `email` (unique), `role`

**Virtuals:**
- `applications` → Application where `candidate == _id`
- `jobsPosted` → Job where `recruiter == _id`

---

### 2.2 `jobs`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | |
| `recruiter` | ObjectId | ✅ | ref `User` |
| `title` | String | ✅ | 3–120 chars |
| `description` | String | ✅ | ≥ 20 chars |
| `company` | String | ❌ | |
| `location` | String | ✅ | |
| `type` | String | ✅ | enum |
| `salary` | String | ❌ | |
| `skills` | [String] | ❌ | |
| `status` | String | ✅ | enum, default `open` |
| `applicantsCount` | Number | ✅ | default 0 |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `recruiter`, `status+createdAt`, `title/description` (text)

---

### 2.3 `applications`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | |
| `job` | ObjectId | ✅ | ref `Job` |
| `candidate` | ObjectId | ✅ | ref `User` |
| `resume` | String | ✅ | |
| `coverLetter` | String | ❌ | ≤ 2000 chars |
| `status` | String | ✅ | enum, default `applied` |
| `notes` | String | ❌ | recruiter private |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `job+candidate` (unique), `candidate+createdAt`, `job+status`

---

## 3. Relationships

| From | To | Type | Field |
|------|-----|------|-------|
| Job | User | Many-to-One | `Job.recruiter` |
| Application | Job | Many-to-One | `Application.job` |
| Application | User | Many-to-One | `Application.candidate` |

---

## 4. Status Lifecycle

### Job Status
open ──► closed

text

### Application Status
applied ──► shortlisted ──► interview ──► hired
│ │ │
└─────────────┴──────────────┴──► rejected

text

---

## 5. Business Rules

- ✅ Email must be unique across all users
- ✅ A candidate can apply to a job **only once** (compound unique index)
- ✅ Only recruiters can create/update/delete their own jobs
- ✅ Only candidates can apply to jobs
- ✅ Password is never returned in queries (`select: false`)
- ✅ Password is auto-hashed before save (bcrypt, 10 rounds)
- ✅ Deleting a job should cascade-delete its applications *(handled in controllers)*

---

## 6. Performance Notes

| Query | Index used |
|-------|------------|
| Find user by email (login) | `email` |
| List open jobs, newest first | `status + createdAt` |
| List jobs by recruiter | `recruiter` |
| List applications by candidate | `candidate + createdAt` |
| List applications for a job | `job + status` |
| Prevent duplicate application | `job + candidate` (unique) |
| Search jobs by text | `title + description` (text) |

---

**End of Document**