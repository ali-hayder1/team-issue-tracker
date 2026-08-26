import api from "./axios";

export async function getProjectIssues(projectId) {
  const { data } = await api.get(`/projects/${projectId}/issues`);
  return data;
}

export async function createIssue(projectId, issueData) {
  const { data } = await api.post(`/projects/${projectId}/issues`, issueData);
  return data;
}

export async function updateIssue(projectId, issueId, updates) {
  const { data } = await api.patch(
    `/projects/${projectId}/issues/${issueId}`,
    updates,
  );
  return data;
}

export async function deleteIssue(projectId, issueId) {
  await api.delete(`/projects/${projectId}/issues/${issueId}`);
}
