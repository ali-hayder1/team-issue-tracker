const priorityColors = {
  low: "bg-slate-600",
  medium: "bg-blue-600",
  high: "bg-orange-600",
  urgent: "bg-red-600",
};

export default function IssueCard({ issue, onClick }) {
  return (
    <button
      onClick={() => onClick(issue)}
      className="w-full text-left bg-slate-800 hover:bg-slate-700 p-3 rounded-lg border border-slate-700 transition"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-white text-sm">{issue.title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full text-white whitespace-nowrap ${priorityColors[issue.priority]}`}
        >
          {issue.priority}
        </span>
      </div>
      {issue.due_date && (
        <p className="text-xs text-slate-400 mt-2">
          Due {new Date(issue.due_date).toLocaleDateString()}
        </p>
      )}
    </button>
  );
}
