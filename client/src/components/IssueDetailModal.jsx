import { useState, useEffect } from "react";
import { getComments, createComment } from "../api/comments";
import { deleteIssue } from "../api/issues";

const priorityColors = {
  low: "bg-slate-600",
  medium: "bg-blue-600",
  high: "bg-orange-600",
  urgent: "bg-red-600",
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-bold text-white">{issue.title}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm font-medium"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <span
              className={`text-xs px-2 py-1 rounded-full text-white ${priorityColors[issue.priority]}`}
            >
              {issue.priority}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-200">
              {statusLabels[issue.status]}
            </span>
          </div>

          {issue.description && (
            <p className="text-slate-300 text-sm mt-3">{issue.description}</p>
          )}

          {issue.due_date && (
            <p className="text-slate-400 text-xs mt-2">
              Due {new Date(issue.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-500 text-sm">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-slate-900/50 rounded p-3">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-white">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{comment.body}</p>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmitComment}
          className="p-4 border-t border-slate-700 flex gap-2"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium text-white"
          >
            {submitting ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
