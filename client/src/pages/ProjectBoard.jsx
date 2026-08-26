import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { getProject } from "../api/projects";
import {
  getProjectIssues,
  createIssue as createIssueApi,
  updateIssue as updateIssueApi,
} from "../api/issues";
import { useProjectSocket } from "../hooks/useProjectSocket";
import KanbanColumn from "../components/KanbanColumn";
import CreateIssueForm from "../components/CreateIssueForm";
import IssueDetailModal from "../components/IssueDetailModal";

const STATUSES = ["todo", "in_progress", "done"];

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [projectData, issuesData] = await Promise.all([
          getProject(projectId),
          getProjectIssues(projectId),
        ]);
        if (!ignore) {
          setProject(projectData);
          setIssues(issuesData);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Failed to load project");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [projectId]);

  const handleIssueUpdated = useCallback((updatedIssue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)),
    );
  }, []);

  useProjectSocket(projectId, handleIssueUpdated);

  async function handleCreateIssue(issueData) {
    const newIssue = await createIssueApi(projectId, issueData);
    setIssues((prev) => [newIssue, ...prev]);
  }

  function handleIssueClick(issue) {
    setSelectedIssue(issue);
  }

  function handleIssueDeleted(issueId) {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id;
    const draggedIssue = issues.find((i) => i.id === issueId);
    if (!draggedIssue) return;

    let newStatus = over.id;
    if (!STATUSES.includes(newStatus)) {
      const overIssue = issues.find((i) => i.id === over.id);
      if (!overIssue) return;
      newStatus = overIssue.status;
    }

    if (draggedIssue.status === newStatus) return;

    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)),
    );

    try {
      await updateIssueApi(projectId, issueId, { status: newStatus });
    } catch (err) {
      console.error(err);
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId ? { ...i, status: draggedIssue.status } : i,
        ),
      );
      setError("Failed to move issue");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <p className="text-slate-400">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{project?.name}</h1>
      </div>

      <CreateIssueForm onCreate={handleCreateIssue} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              issues={issues.filter((issue) => issue.status === status)}
              onIssueClick={handleIssueClick}
            />
          ))}
        </div>
      </DndContext>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          projectId={projectId}
          onClose={() => setSelectedIssue(null)}
          onDeleted={handleIssueDeleted}
        />
      )}
    </div>
  );
}
