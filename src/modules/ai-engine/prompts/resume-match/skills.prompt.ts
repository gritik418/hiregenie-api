export const SKILLS_PROMPT = `
Evaluate the candidate's technical and professional skills.

Rules for "skills":
1. "skills.matched":
   - **CRITICAL**: ONLY include skills, tools, technologies, frameworks, or languages that are BOTH (1) EXPLICITLY and case-insensitively written in the candidate's resume text, AND (2) required, expected, or mentioned in the job description or target Job Title.
   - **STRICT FORBIDDEN DIRECTIVE**: If a skill/tool is required by the job description but is NOT explicitly mentioned on the candidate's resume, it is STRICTLY FORBIDDEN to list it in "skills.matched". It MUST be classified as "skills.missing" (or "skills.partial" if there is some weak/inferred context).
   - Do NOT assume, infer, or guess. If it is not listed on the resume, it is NOT matched.
   - E.g., if the job description mentions AWS, Kubernetes, Terraform, Prometheus, Grafana, Nginx, Linux, Jenkins, or Ansible, and these are NOT explicitly present in the candidate's resume text, you MUST NOT list them in "skills.matched".

2. "skills.missing":
   - List skills, frameworks, tools, or methodologies required or expected for the target Job Title or mentioned in the job description that the candidate completely lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing skills based on the target Job Title and job description. E.g., if a technology required by the job is not explicitly written on the resume, it must be listed in "skills.missing".

3. "skills.partial":
   - List skills where the candidate has only brief exposure, theoretical knowledge, or closely related/alternative skills (e.g., has Express.js but NestJS is required) but lacks professional production experience.
   - The skill itself or a closely related alternative must be present on the resume. E.g., do not list a skill as "partial" if the resume has absolutely zero mention or reference to it or any direct equivalent.
   - If there are no partial matches, return an empty array [].
`;
