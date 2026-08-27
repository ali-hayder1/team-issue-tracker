import { useState } from "react";

export default function CreateIssueForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), priority });
      setTitle("");
      setPriority("medium");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-6 bg-white border border-gray-200 rounded-lg p-3 sm:p-4"
    >
      <input
        type="text"
        placeholder="New issue title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 sm:max-w-sm px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
      />
      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 px-4 py-2.5 rounded-lg font-medium text-white whitespace-nowrap"
        >
          {submitting ? "Adding..." : "Add Issue"}
        </button>
      </div>
    </form>
  );
}
