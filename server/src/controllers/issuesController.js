const pool = require("../db/pool");
const { sendAssignmentEmail } = require("../utils/mailer");

async function notifyAssignee(assigneeId, issueTitle, projectId) {
  if (!assigneeId) return;

  try {
    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [assigneeId],
    );
    const projectResult = await pool.query(
      "SELECT name FROM projects WHERE id = $1",
      [projectId],
    );

    const assignee = userResult.rows[0];
    const project = projectResult.rows[0];
    if (!assignee || !project) return;

    await sendAssignmentEmail({
      to: assignee.email,
      recipientName: assignee.name,
      issueTitle,
      projectName: project.name,
    });
  } catch (err) {
    console.error("notifyAssignee failed:", err);
  }
}

async function createIssue(req, res) {
  const { projectId } = req.params;
  const { title, description, priority, assignee_id, due_date } = req.body;

  if (!title) return res.status(400).json({ error: "title is required" });

  try {
    const result = await pool.query(
      `INSERT INTO issues (project_id, title, description, priority, assignee_id, created_by, due_date)
       VALUES ($1, $2, $3, COALESCE($4, 'medium')::issue_priority, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        title,
        description || null,
        priority,
        assignee_id || null,
        req.user.id,
        due_date || null,
      ],
    );

    const newIssue = result.rows[0];

    if (assignee_id) {
      notifyAssignee(assignee_id, newIssue.title, projectId); // fire and forget, don't await
    }

    res.status(201).json(newIssue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function listProjectIssues(req, res) {
  const { projectId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM issues WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function getIssue(req, res) {
  const { issueId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM issues WHERE id = $1", [
      issueId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "issue not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function updateIssue(req, res) {
  const { issueId, projectId } = req.params;
  const { title, description, status, priority, assignee_id, due_date } =
    req.body;

  try {
    const existingResult = await pool.query(
      "SELECT assignee_id FROM issues WHERE id = $1",
      [issueId],
    );
    const previousAssigneeId = existingResult.rows[0]?.assignee_id;

    const result = await pool.query(
      `UPDATE issues SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status)::issue_status,
        priority = COALESCE($4, priority)::issue_priority,
        assignee_id = COALESCE($5, assignee_id),
        due_date = COALESCE($6, due_date),
        updated_at = now()
       WHERE id = $7
       RETURNING *`,
      [title, description, status, priority, assignee_id, due_date, issueId],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "issue not found" });

    const updatedIssue = result.rows[0];

    // only email if the assignee actually changed to someone new
    if (assignee_id && assignee_id !== previousAssigneeId) {
      notifyAssignee(assignee_id, updatedIssue.title, projectId); // fire and forget
    }

    const io = req.app.get("io");
    io.to(`project_${projectId}`).emit("issue_updated", updatedIssue);

    res.json(updatedIssue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function deleteIssue(req, res) {
  const { issueId } = req.params;
  try {
    await pool.query("DELETE FROM issues WHERE id = $1", [issueId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function myAssignedIssues(req, res) {
  try {
    const result = await pool.query(
      `SELECT i.*, p.name AS project_name
       FROM issues i
       JOIN projects p ON p.id = i.project_id
       WHERE i.assignee_id = $1
       ORDER BY i.due_date ASC NULLS LAST, i.created_at DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

module.exports = {
  createIssue,
  listProjectIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  myAssignedIssues,
};
