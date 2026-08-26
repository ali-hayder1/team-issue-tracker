import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useProjectSocket(projectId, onIssueUpdated) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !projectId) return;

    const socket = io("http://localhost:4000", {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_project", projectId);
    });

    socket.on("issue_updated", (issue) => {
      onIssueUpdated(issue);
    });

    socket.on("connect_error", (err) => {
      console.error("socket connection error:", err.message);
    });

    return () => {
      socket.emit("leave_project", projectId);
      socket.disconnect();
    };
  }, [projectId, onIssueUpdated]);
}
