const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  checkProjectMembership,
  requireAdmin,
} = require("../middleware/permissions");
const {
  createProject,
  listMyProjects,
  getProject,
  deleteProject,
} = require("../controllers/projectsController");
const { myAssignedIssues } = require("../controllers/issuesController");
const issuesRoutes = require("./issues");

router.use(verifyToken);

router.post("/", createProject);
router.get("/", listMyProjects);
router.get("/my-issues", myAssignedIssues); // must come BEFORE /:projectId to avoid route collision
router.get("/:projectId", checkProjectMembership, getProject);
router.delete("/:projectId", requireAdmin, deleteProject);

router.use("/:projectId/issues", issuesRoutes);

module.exports = router;
