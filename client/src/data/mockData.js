export const mockJobs = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$60k–80k',
    status: 'open',
    skills: ['React', 'Tailwind', 'JavaScript'],
    description:
      'We are looking for a Frontend Developer to build modern, responsive UIs using React and Tailwind CSS.',
    applicants: 14,
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'DataWorks',
    location: 'On-site',
    type: 'Full-time',
    salary: '$70k–90k',
    status: 'open',
    skills: ['Node.js', 'Express', 'MongoDB'],
    description:
      'Join our backend team to design scalable APIs and microservices.',
    applicants: 22,
    createdAt: '2025-01-08',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'PixelLabs',
    location: 'Hybrid',
    type: 'Contract',
    salary: '$40k–60k',
    status: 'closed',
    skills: ['Figma', 'Prototyping'],
    description:
      'Design beautiful, user-friendly interfaces for web and mobile apps.',
    applicants: 8,
    createdAt: '2025-01-05',
  },
];

export const mockApplicants = [
  {
    id: 'a1',
    name: 'Ali Khan',
    email: 'ali@mail.com',
    phone: '+92 300 1234567',
    skills: ['React', 'Node', 'Tailwind'],
    experience: '3 yrs',
    jobId: '1',
    status: 'shortlisted',
    appliedAt: '2025-01-12',
    coverLetter: 'I am excited about this role because...',
  },
  {
    id: 'a2',
    name: 'Sara Ahmed',
    email: 'sara@mail.com',
    phone: '+92 301 2345678',
    skills: ['Vue', 'Python'],
    experience: '2 yrs',
    jobId: '1',
    status: 'applied',
    appliedAt: '2025-01-11',
    coverLetter: 'I bring strong problem-solving skills...',
  },
  {
    id: 'a3',
    name: 'Bilal Raza',
    email: 'bilal@mail.com',
    phone: '+92 302 3456789',
    skills: ['Figma', 'UI Design'],
    experience: '4 yrs',
    jobId: '3',
    status: 'interview',
    appliedAt: '2025-01-09',
    coverLetter: 'I have led design teams at...',
  },
];

export const mockApplications = [
  {
    id: 'ap1',
    jobId: '1',
    jobTitle: 'Frontend Developer',
    company: 'TechCorp',
    status: 'shortlisted',
    appliedAt: '2025-01-12',
  },
  {
    id: 'ap2',
    jobId: '2',
    jobTitle: 'Backend Engineer',
    company: 'DataWorks',
    status: 'applied',
    appliedAt: '2025-01-11',
  },
];

export const mockUser = {
  recruiter: {
    name: 'Saad',
    email: 'saad@techcorp.com',
    role: 'recruiter',
    company: 'TechCorp',
  },
  candidate: {
    name: 'Ali Khan',
    email: 'ali@mail.com',
    role: 'candidate',
    phone: '+92 300 1234567',
  },
};