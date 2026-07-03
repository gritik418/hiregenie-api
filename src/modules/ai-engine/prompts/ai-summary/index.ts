import { IDENTITY_SYSTEM_PROMPT } from './identity.prompt';
import { EXTRACTION_SYSTEM_PROMPT } from './extraction.prompt';
import { FORMATTING_SYSTEM_PROMPT } from './formatting.prompt';
import { VALIDATION_SYSTEM_PROMPT } from './validation.prompt';
import { SECTIONING_SYSTEM_PROMPT } from './sectioning.prompt';
import { OUTPUT_SYSTEM_PROMPT } from './output.prompt';
import { OBJECTIVE_SYSTEM_PROMPT } from './objective.prompt';
import { PRESERVATION_SYSTEM_PROMPT } from './preservation.prompt';

export const AI_SUMMARY_PROMPTS = [
  IDENTITY_SYSTEM_PROMPT,
  OBJECTIVE_SYSTEM_PROMPT,
  PRESERVATION_SYSTEM_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  SECTIONING_SYSTEM_PROMPT,
  FORMATTING_SYSTEM_PROMPT,
  VALIDATION_SYSTEM_PROMPT,
  OUTPUT_SYSTEM_PROMPT,
];
