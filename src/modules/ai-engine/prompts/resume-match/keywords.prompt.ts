export const KEYWORDS_PROMPT = `
Evaluate the candidate's keyword coverage.

Rules for "keywords":
1. "keywords.matched":
   - **CRITICAL**: ONLY list key industry terms, concepts, skills, or tools that are BOTH (1) EXPLICITLY and case-insensitively written inside the candidate's resume text, AND (2) match the job description or target Job Title requirements.
   - **STRICT FORBIDDEN DIRECTIVE**: Do NOT copy keywords directly from the job description into "keywords.matched" if they are absent from the candidate's resume.
   - **CROSS-FIELD CONSISTENCY**:
     * Every keyword/term in "keywords.matched" MUST also exist in "skills.matched".
     * If a technology or tool (e.g. AWS, Kubernetes, Terraform, Jenkins, Prometheus, Grafana, Nginx, Ansible, Kafka, Redis, Helm, etc.) is in "skills.missing", it is strictly forbidden from "keywords.matched" and MUST be listed in "keywords.missing".

2. "keywords.missing":
   - List key industry terms, concepts, skills, or tools required or expected for the target Job Title or mentioned in the job description that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing keywords based on the target Job Title. E.g., if a tool/technology is required for the job but not explicitly written on the resume, it MUST be listed in "keywords.missing".
   - DO NOT list responsibilities, duties, or full sentences here. Only list short terms or tool names (1-3 words).
`;
