export const InterviewEvents = {
  // Client -> Server
  JOIN: 'interview:join',
  ANSWER: 'interview:answer',
  END: 'interview:end',
  RECONNECT: 'interview:reconnect',

  // Server -> Client
  JOINED: 'interview:joined',

  THINKING: 'interview:thinking',

  TYPING: 'interview:typing',
  CHUNK: 'interview:chunk',
  MESSAGE: 'interview:message',
  ERROR: 'interview:error',

  SESSION_ENDED: 'interview:session_ended',

  REPORT_GENERATED: 'interview:report_generated',
  REPORT_GENERATION_FAILED: 'interview:report_generation_failed',
  REPORT_GENERATING: 'interview:report_generating',
} as const;
