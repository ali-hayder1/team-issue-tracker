const express = require("express");
const router = express.Router({ mergeParams: true }); // needed for :projectId and :issueId
const {
  createComment,
  listComments,
  deleteComment,
} = require("../controllers/commentsController");

router.post("/", createComment);
router.get("/", listComments);
router.delete("/:commentId", deleteComment);

module.exports = router;
