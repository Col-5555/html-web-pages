import * as submissionService from "../services/submission.service.js";

// Post a code submission for grading. The submission validator middleware has
// checked the body (lang / code / challenge_id) before we reach here.
export const grade = async (req, res) => {
  const result = await submissionService.gradeSubmission(req.validated.body);
  res.status(201).json(result);
};
