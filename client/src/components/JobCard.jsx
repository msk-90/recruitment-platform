import Card from './Card';
import Badge from './Badge';
import Button from './Button';

export default function JobCard({
  job,
  role,
  isOwner = false,
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <Card>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {job.company && `${job.company} · `}
            {job.location} · {job.type}
            {job.salary && ` · ${job.salary}`}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge status={job.status} />

          {role === 'recruiter' && isOwner && (
            <>
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
              <Button size="sm" onClick={onView}>
                View
              </Button>
            </>
          )}

          {role === 'recruiter' && !isOwner && (
            <Button size="sm" variant="secondary" onClick={onView}>
              View
            </Button>
          )}

          {role === 'candidate' && (
            <Button size="sm" onClick={onView}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}