# Software Requirements Specification (SRS)
## Recruitment & Talent Management Platform

**Version:** 1.0
**Date:** Day 1
**Stack:** MERN (MongoDB, Express, React, Node.js) + Tailwind CSS
**Author:** [Your Name]

---

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements for a
web-based Recruitment & Talent Management Platform. It serves as the blueprint
for design, development, and testing.

### 1.2 Scope
The platform enables recruiters to post jobs and manage candidates, and allows
candidates to browse and apply for jobs. It provides a dashboard for tracking
the hiring pipeline from application to hire.

### 1.3 Definitions
| Term        | Meaning                                            |
|-------------|----------------------------------------------------|
| Recruiter   | User who creates jobs and reviews applicants       |
| Candidate   | User who applies for jobs                          |
| Job         | A job posting created by a recruiter               |
| Application | A candidate's submission to a job                  |
| Pipeline    | Stages: Applied → Shortlisted → Interview → Hired/Rejected |

---

## 2. Overall Description

### 2.1 Product Perspective
A standalone web application, SaaS-style, with role-based access.
Recruiters manage jobs and candidates; candidates manage applications.

### 2.2 User Classes
| User      | Description                        | Key Actions                          |
|-----------|------------------------------------|--------------------------------------|
| Recruiter | Company representative             | CRUD jobs, review applicants, update status |
| Candidate | Job seeker                         | Browse jobs, apply, track status     |
| Admin*    | System owner (future scope)        | Manage users and platform content    |

### 2.3 Assumptions
- Users have internet access and a modern browser
- Recruiters act on behalf of a company
- Email notifications are out of scope for v1

---

## 3. Functional Requirements

### 3.1 Authentication
- FR-1: Register as Recruiter or Candidate
- FR-2: Login with email + password
- FR-3: JWT-based session
- FR-4: Role-based access control
- FR-5: Logout

### 3.2 Job Management (Recruiter)
- FR-6: Create job (title, description, skills, location, type, salary)
- FR-7: Edit own jobs
- FR-8: Delete own jobs
- FR-9: View all own jobs
- FR-10: Open / close a job

### 3.3 Job Browsing (Candidate)
- FR-11: View all open jobs
- FR-12: Search + filter jobs (title, location, type)
- FR-13: View job details
- FR-14: Apply with resume + cover letter

### 3.4 Application Management
- FR-15: Candidate views own applications + status
- FR-16: Recruiter views applicants per job
- FR-17: Recruiter updates application status
- FR-18: Candidate cannot apply twice to same job

### 3.5 Dashboard
- FR-19: Recruiter sees stats (jobs, applicants, pipeline)
- FR-20: Candidate sees own application summary

### 3.6 Profile
- FR-21: View + edit profile
- FR-22: Upload resume (candidate)
- FR-23: Change password

---

## 4. Non-Functional Requirements

- NFR-1: Page load < 2s
- NFR-2: Passwords hashed (bcrypt)
- NFR-3: JWT-secured API
- NFR-4: Input validation on all endpoints
- NFR-5: Responsive UI (mobile, tablet, desktop)
- NFR-6: Modular code (MVC pattern)
- NFR-7: Git version control with meaningful commits
- NFR-8: Accessibility (WCAG AA)

---

## 5. System Architecture (High Level)
