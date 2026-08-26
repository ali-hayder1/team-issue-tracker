import api from "./axios";

export async function getComments(projectId, issueId) {
  const { data } = await api.get(
    `/projects/${projectId}/issues/${issueId}/comments`,
  );
  return data;
}

export async function createComment(projectId, issueId, body) {
  const { data } = await api.post(
    `/projects/${projectId}/issues/${issueId}/comments`,
    { body },
  );
  return data;
}
