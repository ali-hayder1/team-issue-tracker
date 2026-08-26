import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableIssueCard from "./SortableIssueCard";

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function KanbanColumn({ status, issues, onIssueClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-800/50 rounded-lg p-3 flex-1 min-w-70 transition ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <h2 className="font-semibold text-white mb-3 flex items-center justify-between">
        {statusLabels[status]}
        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </h2>
      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-20">
          {issues.map((issue) => (
            <SortableIssueCard
              key={issue.id}
              issue={issue}
              onClick={onIssueClick}
            />
          ))}
          {issues.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">No issues</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
