import dotenv from 'dotenv';
dotenv.config();

// ✅ Use 127.0.0.1 (not localhost) to force IPv4 on Windows
const API = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

let recruiterToken = '';
let candidateToken = '';
let createdJobId = '';
let createdApplicationId = '';

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

const log = {
  pass: (msg) => console.log(colors.green(`✅ ${msg}`)),
  fail: (msg) => console.log(colors.red(`❌ ${msg}`)),
  info: (msg) => console.log(colors.cyan(`ℹ️  ${msg}`)),
  section: (msg) => console.log(colors.yellow(`\n=== ${msg} ===`)),
};

const request = async (method, path, { token, body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const expect = (label, actual, expected) => {
  if (actual === expected) {
    log.pass(`${label} — ${actual}`);
  } else {
    log.fail(`${label} — expected ${expected}, got ${actual}`);
  }
};

const run = async () => {
  log.section('AUTH');

  const recruiterLogin = await request('POST', '/auth/login', {
    body: { email: 'saad@techcorp.com', password: 'password123' },
  });
  expect('Recruiter login', recruiterLogin.status, 200);
  recruiterToken = recruiterLogin.data.token;

  const candidateLogin = await request('POST', '/auth/login', {
    body: { email: 'ali@mail.com', password: 'password123' },
  });
  expect('Candidate login', candidateLogin.status, 200);
  candidateToken = candidateLogin.data.token;

  log.section('JOBS');

  const listJobs = await request('GET', '/jobs');
  expect('GET /jobs (public)', listJobs.status, 200);

  const createJob = await request('POST', '/jobs', {
    token: recruiterToken,
    body: {
      title: 'API Test Job',
      description: 'Testing the API with an automated script.',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50k',
      skills: ['Node'],
    },
  });
  expect('POST /jobs (recruiter)', createJob.status, 201);
  createdJobId = createJob.data._id;

  const createJobAsCandidate = await request('POST', '/jobs', {
    token: candidateToken,
    body: {
      title: 'Nope',
      description: 'Should not work at all here.',
      location: 'Remote',
      type: 'Full-time',
    },
  });
  expect('POST /jobs (candidate → 403)', createJobAsCandidate.status, 403);

  const myJobs = await request('GET', '/jobs/me', { token: recruiterToken });
  expect('GET /jobs/me', myJobs.status, 200);

  const updateJob = await request('PUT', `/jobs/${createdJobId}`, {
    token: recruiterToken,
    body: { salary: '$60k' },
  });
  expect('PUT /jobs/:id (owner)', updateJob.status, 200);

  log.section('APPLICATIONS');

  const apply = await request('POST', '/applications', {
    token: candidateToken,
    body: {
      jobId: createdJobId,
      resume: '/uploads/test.pdf',
      coverLetter: 'Automated test application.',
    },
  });
  expect('POST /applications (candidate)', apply.status, 201);
  createdApplicationId = apply.data._id;

  const applyAgain = await request('POST', '/applications', {
    token: candidateToken,
    body: { jobId: createdJobId, resume: '/uploads/test.pdf' },
  });
  expect('POST /applications (duplicate → 409)', applyAgain.status, 409);

  const myApps = await request('GET', '/applications/me', {
    token: candidateToken,
  });
  expect('GET /applications/me', myApps.status, 200);

  const jobApps = await request('GET', `/applications/job/${createdJobId}`, {
    token: recruiterToken,
  });
  expect('GET /applications/job/:id', jobApps.status, 200);

  const updateStatus = await request(
    'PUT',
    `/applications/${createdApplicationId}/status`,
    {
      token: recruiterToken,
      body: { status: 'shortlisted' },
    }
  );
  expect('PUT /applications/:id/status', updateStatus.status, 200);

  const badStatus = await request(
    'PUT',
    `/applications/${createdApplicationId}/status`,
    {
      token: recruiterToken,
      body: { status: 'hiredddd' },
    }
  );
  expect('PUT invalid status → 400', badStatus.status, 400);

  log.section('USERS');

  const updateProfile = await request('PUT', '/users/me', {
    token: candidateToken,
    body: { bio: 'Updated bio from automated test.' },
  });
  expect('PUT /users/me', updateProfile.status, 200);

  const listCandidates = await request('GET', '/users/candidates', {
    token: recruiterToken,
  });
  expect('GET /users/candidates (recruiter)', listCandidates.status, 200);

  const listCandidatesAsCandidate = await request(
    'GET',
    '/users/candidates',
    { token: candidateToken }
  );
  expect(
    'GET /users/candidates (candidate → 403)',
    listCandidatesAsCandidate.status,
    403
  );

  log.section('CLEANUP');

  const deleteJob = await request('DELETE', `/jobs/${createdJobId}`, {
    token: recruiterToken,
  });
  expect('DELETE /jobs/:id', deleteJob.status, 200);

  console.log(colors.yellow('\n=== DONE ===\n'));
};

run().catch((err) => {
  console.error(colors.red('Fatal error:'), err);
  process.exit(1);
});