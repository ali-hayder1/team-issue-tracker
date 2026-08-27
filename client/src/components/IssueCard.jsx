const priorityColors = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function IssueCard({ issue, onClick }) {
  return (
    <button
      onClick={() => onClick(issue)}
      className="w-full text-left bg-white hover:shadow-md p-3 rounded-lg border border-gray-200 transition"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-gray-900 text-sm">{issue.title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${priorityColors[issue.priority]}`}
        >
          {issue.priority}
        </span>
      </div>
      {issue.due_date && (
        <p className="text-xs text-gray-500 mt-2">
          Due {new Date(issue.due_date).toLocaleDateString()}
        </p>
      )}
    </button>
  );
}
