import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import Layout from "../components/Layout";
import KanbanColumn from "../components/KanbanColumn";
import CreateIssueForm from "../components/CreateIssueForm";
import IssueDetailModal from "../components/IssueDetailModal";

const STATUSES = ["todo", "in_progress", "done"];

export default function ProjectBoard() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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

  return (
    <Layout title={project?.name || "Loading..."}>
      {loading ? (
        <p className="text-gray-500">Loading board...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <CreateIssueForm onCreate={handleCreateIssue} />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
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
        </>
      )}
    </Layout>
  );
}
