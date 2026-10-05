export const applyToJob = async (req, res) => {
  res.status(201).json({ message: 'apply — coming Day 9' });
};

export const getApplicationsForJob = async (req, res) => {
  res.json({ message: `applications for job ${req.params.jobId} — coming Day 9` });
};

export const getMyApplications = async (req, res) => {
  res.json({ message: 'my applications — coming Day 9' });
};

export const updateApplicationStatus = async (req, res) => {
  res.json({ message: `update status ${req.params.id} — coming Day 9` });
};