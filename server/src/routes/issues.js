const express = require("express");
const router = express.Router({ mergeParams: true });
const { checkProjectMembership } = require("../middleware/permissions");
const {
  createIssue,
  listProjectIssues,
  getIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issuesController");
const commentsRoutes = require("./comments");

router.use(checkProjectMembership);

router.post("/", createIssue);
router.get("/", listProjectIssues);
router.get("/:issueId", getIssue);
router.patch("/:issueId", updateIssue);
router.delete("/:issueId", deleteIssue);

router.use("/:issueId/comments", commentsRoutes);

module.exports = router;
