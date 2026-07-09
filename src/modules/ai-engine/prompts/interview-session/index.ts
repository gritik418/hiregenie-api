import { GENERATION_RULES_SYSTEM_PROMPT } from './generation-rules.prompt';
import { OUTPUT_SCHEMA_SYSTEM_PROMPT } from './output-schema.prompt';
import { OUTPUT_SYSTEM_PROMPT } from './output.prompt';
import { ROLE_SYSTEM_PROMPT } from './role.prompt';

export const INTERVIEW_SESSION_PROMPTS = [
  ROLE_SYSTEM_PROMPT,
  GENERATION_RULES_SYSTEM_PROMPT,
  OUTPUT_SCHEMA_SYSTEM_PROMPT,
  OUTPUT_SYSTEM_PROMPT,
];
