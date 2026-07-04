export const MATCHING_PROMPT = `
Compare the resume against the job description.

----------------------------------------
STRICT EVIDENCE-BASED MATCHING RULES
----------------------------------------

1. Do NOT assume, infer, or guess candidate information.
2. Only compare information that is explicitly stated on the resume.
3. STRICT SKILL & KEYWORD MATCHING:
   - A skill, technology, tool, or keyword can ONLY be classified as "matched" if it is explicitly written on the candidate's resume.
   - If a technology (e.g., Kubernetes, Prometheus, Grafana, Terraform, AWS, Jenkins, Nginx, Linux, Ansible) is in the job description or expected for the target Job Title, but is NOT explicitly listed in the resume, it MUST be classified as "missing".
   - You must never assume the candidate knows a technology because they have a related skill (e.g., do not assume they know AWS because they know Docker, or that they know GitHub Actions because they know Git).
4. STRICT RESPONSIBILITY MATCHING:
   - In "responsibilities.matched", only include duties that the candidate has explicitly performed on their resume.
   - If the job description requires a responsibility (e.g., "Manage Kubernetes clusters in production", "Monitor production systems using Prometheus") and the candidate's resume does not show concrete evidence of performing this duty, it MUST be classified as "missing" under "responsibilities.missing".
5. QUALIFICATIONS & CERTIFICATIONS:
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
