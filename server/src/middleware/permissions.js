const pool = require("../db/pool");

// Checks the logged-in user is a member of the project in the URL param :projectId
// Attaches req.project for downstream handlers to use
async function checkProjectMembership(req, res, next) {
  const { projectId } = req.params;

  try {
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId],
    );
    const project = projectResult.rows[0];
    if (!project) return res.status(404).json({ error: "project not found" });

    const memberResult = await pool.query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, req.user.id],
    );

    if (memberResult.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "you are not a member of this project" });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

// Only allows admins through — use after verifyToken
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "admin access required" });
  }
  next();
}

module.exports = { checkProjectMembership, requireAdmin };
