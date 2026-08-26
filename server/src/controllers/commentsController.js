const pool = require("../db/pool");

async function createComment(req, res) {
  const { issueId } = req.params;
  const { body } = req.body;

  if (!body) return res.status(400).json({ error: "body is required" });

  try {
    const result = await pool.query(
      `INSERT INTO comments (issue_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [issueId, req.user.id, body],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function listComments(req, res) {
  const { issueId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS author_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [issueId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

async function deleteComment(req, res) {
  const { commentId } = req.params;
  try {
    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
}

module.exports = { createComment, listComments, deleteComment };
