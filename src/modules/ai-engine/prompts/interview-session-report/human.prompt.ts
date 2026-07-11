import { InterviewMessage } from 'generated/prisma/client';

export const HUMAN_PROMPT = (
  candidateName: string,
  targetRole: string,
  difficulty: string,
  resumeSummary: string,
  history: InterviewMessage[],
) => `
Candidate Name:
${candidateName}

Target Role:
${targetRole}

Interview Difficulty:
${difficulty}

Candidate Resume Summary:
${resumeSummary}

Interview Transcript:
${JSON.stringify(
  history.map((msg) => ({
    role: msg.role,
    message: msg.message,
  })),
  null,
  2
)}

Based on the above interview transcript and the candidate's resume summary, generate the interview report.
`;
