export const MATCHING_PROMPT = `
Compare the resume against the job description.

----------------------------------------
STRICT EVIDENCE-BASED MATCHING RULES
----------------------------------------

1. Do NOT assume, infer, or guess candidate information.
2. Only compare information that is explicitly stated on the resume.
3. The Job Description and Job Title do NOT contain any information about the candidate's history or skills. They only list what the employer requires. You must NEVER treat requirements, skills, or responsibilities listed in the Job Description as if the candidate possesses or has performed them.
4. STRICT DEFINITION OF "MATCHED":
   - A skill, technology, tool, or keyword is ONLY classified as "matched" (i.e. in "skills.matched" or "keywords.matched") if:
     1. It is explicitly and case-insensitively written in the candidate's resume text, AND
     2. It is required, expected, or mentioned in the job description or target Job Title.
   - Matching is STRICTLY the intersection of what is explicitly on the resume and what the job requires. If a requirement is in the job description but not in the resume, it is NOT MATCHED—it is MISSING.
4. STRICT SKILL & KEYWORD MATCHING RULES:
   - If a technology/tool (e.g., Kubernetes, Prometheus, Grafana, Terraform, AWS, AWS EC2, AWS ECS, AWS EKS, AWS Lambda, AWS IAM, AWS VPC, AWS RDS, AWS S3, Jenkins, Nginx, Linux, Ansible, Kafka, Redis, Helm, etc.) is in the job description or expected for the target Job Title, but is NOT explicitly written in the candidate's resume, it is STRICTLY FORBIDDEN to classify it as matched. It MUST be classified as "missing".
   - You must never assume the candidate knows a technology because they have a related skill. E.g.:
     * Do NOT assume they know AWS because they know Docker or Next.js.
     * Do NOT assume they know GitHub Actions because they know Git or GitHub.
     * Do NOT assume they have DevOps or SRE experience because they have Frontend or Backend web development experience.
5. STRICT RESPONSIBILITY MATCHING:
   - In "responsibilities.matched", only include duties that the candidate has explicitly performed on their resume.
   - If the job description requires a responsibility (e.g., "Manage Kubernetes clusters in production", "Monitor production systems using Prometheus") and the candidate's resume does not show concrete evidence of performing this duty, it MUST be classified as "missing" under "responsibilities.missing".
6. QUALIFICATIONS & CERTIFICATIONS:
   - If the candidate does not have the specific degree or certification requested, it MUST be listed as "missing".
   - If the candidate has no certifications, "certifications.matched" MUST be an empty array [].
   - Suggest relevant missing certifications and qualifications based on the target Job Title under "certifications.missing" and "qualifications.missing".

----------------------------------------
ROLE FIT & SENIORITY ALIGNMENT RULES
----------------------------------------

1. "roleFit.targetRole" represents the "Job Title" provided in the input. If a Job Title is provided, "roleFit.targetRole" MUST match it exactly.
2. "roleFit.matchedRoles" is an array of roles/titles from the candidate's resume or work history that are relevant to or align with the target Job Title. Do not return an empty array if the candidate has work history, but only list actual roles from their history. Each role object must have the structure: { "title": string, "confidence": number }
3. "roleFit.alignmentScore" represents how well the candidate's background/history/domain aligns with the target Job Title:
   - If the candidate's background is in a completely different domain (e.g., Frontend developer applying for a DevOps/SRE role, or a HR specialist applying for a Software Engineer role), the alignmentScore MUST be between 0 and 20.
   - If there is a major seniority mismatch (e.g., an Intern or Junior candidate applying for a Senior, Lead, Manager, or Architect role), the alignmentScore MUST be capped at a maximum of 30.
   - A perfect 100 alignment score is only for candidates who have worked in the exact same role with matching seniority.
`;
