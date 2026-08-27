import { useState, useEffect } from "react";
import { getComments, createComment } from "../api/comments";
import { deleteIssue } from "../api/issues";

const priorityColors = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-orange-100 text-orange-700",
  done: "bg-green-100 text-green-700",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function IssueDetailModal({
  issue,
  projectId,
  onClose,
  onDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await getComments(projectId, issue.id);
        if (!ignore) setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [projectId, issue.id]);

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await createComment(
        projectId,
        issue.id,
        newComment.trim(),
      );
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this issue permanently?")) return;

    setDeleting(true);
    try {
      await deleteIssue(projectId, issue.id);
      onDeleted(issue.id);
      onClose();
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {issue.title}
            </h2>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 hover:text-red-600 disabled:opacity-50 text-sm font-medium"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 text-2xl sm:text-xl leading-none p-1"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[issue.priority]}`}
            >
              {issue.priority}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[issue.status]}`}
            >
              {statusLabels[issue.status]}
            </span>
          </div>

          {issue.description && (
            <p className="text-gray-600 text-sm mt-3">{issue.description}</p>
          )}

          {issue.due_date && (
            <p className="text-gray-400 text-xs mt-2">
              Due {new Date(issue.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100"
              >
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 wrap-break-word">
                  {comment.body}
                </p>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmitComment}
          className="p-3 sm:p-4 border-t border-gray-200 flex gap-2"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-base"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0"
          >
            {submitting ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
