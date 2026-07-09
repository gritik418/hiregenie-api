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
} as const;
