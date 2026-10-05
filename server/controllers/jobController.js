export const getJobs = async (req, res) => {
  res.json({ message: 'list jobs — coming Day 8', count: 0, jobs: [] });
};

export const getJobById = async (req, res) => {
  res.json({ message: `job ${req.params.id} — coming Day 8` });
};

export const createJob = async (req, res) => {
  res.status(201).json({ message: 'create job — coming Day 8' });
};

export const updateJob = async (req, res) => {
  res.json({ message: `update job ${req.params.id} — coming Day 8` });
};

export const deleteJob = async (req, res) => {
  res.json({ message: `delete job ${req.params.id} — coming Day 8` });
};