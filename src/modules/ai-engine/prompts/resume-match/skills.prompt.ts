export const SKILLS_PROMPT = `
Evaluate the candidate's technical and professional skills.

Rules for "skills":
1. "skills.matched":
   - Only include skills, tools, frameworks, or languages that are EXPLICITLY written on the candidate's resume and match or relate to the job description or target Job Title requirements.
   - Do NOT assume, infer, or guess. If it is not listed on the resume, it is NOT matched.
2. "skills.missing":
   - List skills, frameworks, tools, or methodologies required by the job description or expected for the target Job Title that are ABSENT from the candidate's resume.
   - You MUST identify and suggest at least 4-5 missing skills based on the target Job Title and job description if they are not explicitly present on the resume. For example, if the target Job Title is "Senior DevOps Engineer" and the candidate's resume lacks Kubernetes, Prometheus, Grafana, Terraform, AWS, Ansible, Jenkins, Helm, or Nginx, they MUST be listed here.
3. "skills.partial":
   - List skills where the candidate has only brief exposure, theoretical knowledge, or closely related/alternative skills (e.g., Express.js if NestJS is required) but lacks professional production experience.
   - If there are no partial matches, return an empty array [].
`;
