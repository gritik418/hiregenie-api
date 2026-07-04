export const RESPONSIBILITIES_PROMPT = `
Evaluate the candidate's professional work experience responsibilities and duties.

Rules for "responsibilities":
1. "responsibilities.matched":
   - List responsibilities or core duties from the job description that the candidate has EXPLICITLY performed on their resume.
   - Do NOT include technologies or tools here. Only list professional actions or duties (e.g., "Build APIs", "Deploy services", "Manage team").
2. "responsibilities.missing":
   - List core duties and responsibilities required by the job description or standard for the target Job Title that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing responsibilities based on the target Job Title and job description. E.g., for a DevOps Engineer role: "Design and maintain highly available cloud infrastructure on AWS", "Manage Kubernetes clusters in production", "Implement Infrastructure as Code using Terraform", "Monitor production systems using Prometheus and Grafana", "Configure Nginx, Linux servers, and networking".
`;
