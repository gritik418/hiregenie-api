export const RESPONSIBILITIES_PROMPT = `
Evaluate the candidate's professional work experience responsibilities and duties.

Rules for "responsibilities":
1. "responsibilities.matched":
   - List responsibilities or core duties from the job description that the candidate has EXPLICITLY performed on their resume.
   - Do NOT include technologies or tools here. Only list professional actions or duties (e.g., "Build APIs", "Deploy services", "Manage team").
2. "responsibilities.missing":
   - List core duties and responsibilities required by the job description or standard for the target Job Title that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing responsibilities based on the target Job Title and job description. E.g.:
     * "DutyA: Design and manage scalable resources"
     * "DutyB: Build and coordinate key workflows"
     * "DutyC: Monitor performance metrics and generate reports"
     * "DutyD: Lead team syncs and delegate daily operations"
`;
