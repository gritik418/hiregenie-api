import { PracticeSession } from 'generated/prisma/client';

export const HUMAN_PROMPT = (
  targetRole: string,
  difficulty: string,
  session: PracticeSession,
) => `

Target Role

${targetRole}

Overall Interview Difficulty

${difficulty}

Practice Session

${JSON.stringify(session)}

Each question contains:

- id (questionId)
- category
- difficulty
- question
- expectedAnswer
- keyPoints
- evaluationCriteria
- answer (candidate's response)
- status

Evaluation Instructions

Evaluate ONLY questions whose status is ANSWERED.

Ignore every question whose status is:

- PENDING
- SKIPPED

Do not evaluate unanswered questions.

For every answered question:

1. Compare the candidate's response (in the "answer" field) against the expected answer.
2. Check whether the important key points were covered.
3. Evaluate using the provided evaluation criteria.
4. Assign a score between 0 and 100 based on the SCORING RULES. Remember, a response of "I don't know" or a blank/empty response must receive exactly 0 points.
5. Determine the performance level.
6. Identify:
   - strengths
   - weaknesses
   - missed key points
   - actionable suggestions
7. Generate concise feedback.
8. Generate an ideal answer that demonstrates what an excellent candidate would answer.

Overall Evaluation

After evaluating every answered question:

Generate an overall interview report.

The report must include:

- overallScore
- performanceLevel
- hiringRecommendation
- breakdown
- strengths
- weaknesses
- suggestions
- nextSteps
- summary
- reason
- feedback

Important Rules

- Base every conclusion ONLY on the provided interview session.
- Never assume knowledge not demonstrated by the candidate.
- Never hallucinate technologies, experience, or skills.
- Do not invent missing knowledge.
- Do not reward verbosity.
- Reward correctness, reasoning, clarity, and practical understanding.
- Hard questions should influence the overall score more than easy questions.
- The overall report must be consistent with every individual question evaluation.
- Every recommendation should be specific, actionable, and supported by the interview results.
- Maintain a professional, constructive, and encouraging tone.
`;
