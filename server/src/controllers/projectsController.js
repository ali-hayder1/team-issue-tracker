const pool = require("../db/pool");

async function createProject(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING *`,
      [name, req.user.id],
    );
    const project = projectResult.rows[0];

    // owner is automatically a member
    await client.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`,
      [project.id, req.user.id],
    );

    await client.query("COMMIT");
    res.status(201).json(project);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  } finally {
    client.release();
  }
}

async function listMyProjects(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function getProject(req, res) {
  // req.project is attached by checkProjectMembership middleware
  res.json(req.project);
}

async function deleteProject(req, res) {
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [
      req.params.projectId,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

module.exports = { createProject, listMyProjects, getProject, deleteProject };
