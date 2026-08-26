import api from "./axios";

export async function getMyProjects() {
  const { data } = await api.get("/projects");
  return data;
}

export async function createProject(name) {
  const { data } = await api.post("/projects", { name });
  return data;
}

export async function getProject(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}

export async function deleteProject(projectId) {
  await api.delete(`/projects/${projectId}`);
}
