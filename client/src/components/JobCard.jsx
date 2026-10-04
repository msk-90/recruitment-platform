import Card from './Card';
import Badge from './Badge';
import Button from './Button';

export default function JobCard({ job, role, onEdit, onDelete, onView }) {
  return (
    <Card>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {job.location} · {job.type} · {job.salary}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {job.applicants} applicants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={job.status} />
          {role === 'recruiter' ? (
            <>
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onView}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}