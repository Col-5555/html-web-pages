import * as submissionService from "../services/submission.service.js";

// Post a code submission for grading. The route is guarded to Coders, so
// req.user.id is the submitting coder. The submission validator has already
// checked the body (lang / code / challenge_id).
export const grade = async (req, res) => {
  const result = await submissionService.gradeSubmission(req.validated.body, req.user.id);
  res.status(201).json(result);
};
