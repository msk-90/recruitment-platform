import Card from './Card';
import Button from './Button';

export default function ApplicantCard({
  applicant,
  onShortlist,
  onReject,
  onView,
}) {
  return (
    <Card>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
            {applicant.name[0]}
          </div>
          <div>
            <p className="font-medium text-slate-800">{applicant.name}</p>
            <p className="text-sm text-slate-500">{applicant.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{applicant.skills}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onShortlist}>
            Shortlist
          </Button>
          <Button variant="danger" size="sm" onClick={onReject}>
            Reject
          </Button>
          <Button size="sm" onClick={onView}>
            View
          </Button>
        </div>
      </div>
    </Card>
  );
}