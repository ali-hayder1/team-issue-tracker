import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getMyProjects, createProject, deleteProject } from "../api/projects";

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await getMyProjects();
        if (!ignore) setProjects(data);
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Failed to load projects");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      setProjects((prev) => [project, ...prev]);
      setNewProjectName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(e, projectId) {
    e.stopPropagation(); // don't trigger the card's navigate onClick
    if (!confirm("Delete this project and all its issues permanently?")) return;

    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={logoutUser}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded font-medium"
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-slate-400">No projects yet. Create one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-slate-800 hover:bg-slate-700 text-left p-4 rounded-lg transition cursor-pointer relative group"
            >
              <button
                onClick={(e) => handleDelete(e, project.id)}
                disabled={deletingId === project.id}
                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 disabled:opacity-50 text-sm opacity-0 group-hover:opacity-100 transition"
              >
                {deletingId === project.id ? "..." : "✕"}
              </button>
              <h2 className="font-semibold text-lg pr-6">{project.name}</h2>
              <p className="text-slate-400 text-sm mt-1">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
