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

const statusDot = {
  todo: "bg-slate-400",
  in_progress: "bg-orange-400",
  done: "bg-green-500",
};

export default function KanbanColumn({ status, issues, onIssueClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-lg p-3 shrink-0 w-[85vw] sm:w-72 md:w-80 snap-start transition ${
        isOver ? "ring-2 ring-orange-400" : ""
      }`}
    >
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
          {statusLabels[status]}
        </span>
        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
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
            <p className="text-gray-400 text-sm text-center py-4">No issues</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
