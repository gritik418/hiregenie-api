import { BREAKDOWN_PROMPT } from './breakdown.prompt';
import { FEEDBACK_PROMPT } from './feedback.prompt';
import { HIRING_RECOMMENDATION_PROMPT } from './hiring-recommendation.prompt';
import { NEXT_STEPS_PROMPT } from './next-steps.prompt';
import { OUTPUT_PROMPT } from './output.prompt';
import { OVERALL_REPORT_PROMPT } from './overall-report.prompt';
import { QUESTION_EVALUATION_PROMPT } from './question-evaluation.prompt';
import { SCORING_PROMPT } from './scoring.prompt';
import { STRENGTHS_PROMPT } from './strengths.prompt';
import { SUGGESTIONS_PROMPT } from './suggestions.prompt';
import { SYSTEM_PROMPT } from './system.prompt';
import { WEAKNESSES_PROMPT } from './weaknesses.prompt';

export const PRACTICE_SESSION_EVALUATOR_PROMPTS = [
  SYSTEM_PROMPT,
  OUTPUT_PROMPT,
  SCORING_PROMPT,
  QUESTION_EVALUATION_PROMPT,
  BREAKDOWN_PROMPT,
  STRENGTHS_PROMPT,
  WEAKNESSES_PROMPT,
  SUGGESTIONS_PROMPT,
  NEXT_STEPS_PROMPT,
  HIRING_RECOMMENDATION_PROMPT,
  OVERALL_REPORT_PROMPT,
  FEEDBACK_PROMPT,
];
