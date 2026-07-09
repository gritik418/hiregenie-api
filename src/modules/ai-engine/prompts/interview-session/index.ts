import { GENERATION_RULES_SYSTEM_PROMPT } from './generation-rules.prompt';
import { OUTPUT_SCHEMA_SYSTEM_PROMPT } from './output-schema.prompt';
import { OUTPUT_SYSTEM_PROMPT } from './output.prompt';
import { ROLE_SYSTEM_PROMPT } from './role.prompt';
import { CONVERSATION_RULES_SYSTEM_PROMPT } from './conversation-rules.prompt';
import { CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT } from './conversation-output-schema.prompt';
import { CANDIDATE_RULES_SYSTEM_PROMPT } from './candidate-rules.prompt';
import { QUESTION_RULES_SYSTEM_PROMPT } from './question-rules.prompt';

export const INTERVIEW_SESSION_PROMPTS = [
  ROLE_SYSTEM_PROMPT,
  GENERATION_RULES_SYSTEM_PROMPT,
  OUTPUT_SCHEMA_SYSTEM_PROMPT,
  OUTPUT_SYSTEM_PROMPT,
];

export const INTERVIEW_CONVERSATION_PROMPTS = [
  ROLE_SYSTEM_PROMPT,
  CANDIDATE_RULES_SYSTEM_PROMPT,
  QUESTION_RULES_SYSTEM_PROMPT,
  CONVERSATION_RULES_SYSTEM_PROMPT,
  CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT,
  OUTPUT_SYSTEM_PROMPT,
];

