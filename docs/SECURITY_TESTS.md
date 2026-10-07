# Security Test Report

## Authentication
| Test | Expected | Result |
|------|----------|--------|
| Protected route without token | 401 | ✅ |
| Protected route with bad token | 401 | ✅ |
| Protected route with expired token | 401 | ✅ |

## Authorization
| Test | Expected | Result |
|------|----------|--------|
| Candidate creates job | 403 | ✅ |
| Candidate accesses admin | 403 | ✅ |
| Recruiter edits another's job | 403 | ✅ |
| Candidate sees another's applications | 403 | ✅ |

## Input Validation
| Test | Expected | Result |
|------|----------|--------|
| Invalid email | 400 | ✅ |
| Short password | 400 | ✅ |
| Invalid role | 400 | ✅ |
| NoSQL injection | 400 | ✅ |

## Password Security
| Test | Result |
|------|--------|
| Password hashed in DB | ✅ |
| Password not returned in API | ✅ |
| Generic error on bad login | ✅ |

## Rate Limiting
| Test | Result |
|------|--------|
| 21st login attempt within 15 min | 429 ✅ |

## File Upload
| Test | Result |
|------|--------|
| .exe file rejected | ✅ |
| File > 5MB rejected | ✅ |
| Upload requires JWT | ✅ |