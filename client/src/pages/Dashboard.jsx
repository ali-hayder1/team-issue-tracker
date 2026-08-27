import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects, createProject, deleteProject } from "../api/projects";
import { getProjectIssues } from "../api/issues";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [issuesByProject, setIssuesByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const projectsData = await getMyProjects();
        if (ignore) return;
        setProjects(projectsData);

        const entries = await Promise.all(
          projectsData.map(async (p) => [p.id, await getProjectIssues(p.id)]),
        );
        if (!ignore) setIssuesByProject(Object.fromEntries(entries));
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Failed to load dashboard data");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const allIssues = Object.values(issuesByProject).flat();
  const openIssues = allIssues.filter((i) => i.status !== "done").length;
  const doneIssues = allIssues.filter((i) => i.status === "done").length;

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      setProjects((prev) => [project, ...prev]);
      setIssuesByProject((prev) => ({ ...prev, [project.id]: [] }));
      setNewProjectName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(projectId) {
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
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Projects"
          value={projects.length}
          color="bg-red-100 text-red-600"
          icon="📁"
        />
        <StatCard
          label="Open Issues"
          value={openIssues}
          color="bg-orange-100 text-orange-600"
          icon="⏳"
        />
        <StatCard
          label="Completed Issues"
          value={doneIssues}
          color="bg-green-100 text-green-600"
          icon="✅"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-6">
        <form
          onSubmit={handleCreate}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            placeholder="New project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium whitespace-nowrap"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Your Projects</h2>
        </div>

        {loading ? (
          <p className="text-gray-500 p-5">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 p-5">
            No projects yet. Create one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 sm:px-5 py-3 font-medium">
                    Project Name
                  </th>
                  <th className="px-4 sm:px-5 py-3 font-medium hidden sm:table-cell">
                    Issues
                  </th>
                  <th className="px-4 sm:px-5 py-3 font-medium hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-4 sm:px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const projectIssues = issuesByProject[project.id] || [];
                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 sm:px-5 py-3 font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-gray-600 hidden sm:table-cell">
                        {projectIssues.length}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-gray-600 hidden md:table-cell">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          disabled={deletingId === project.id}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50 text-sm"
                        >
                          {deletingId === project.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
