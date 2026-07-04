export const KEYWORDS_PROMPT = `
Evaluate the candidate's keyword coverage against the job description and target Job Title.

Rules for "keywords":
1. "keywords.matched":
   - List key industry terms, concepts, skills, or tools from the job description that are EXPLICITLY written in the candidate's resume.
   - You MUST NOT include any keywords that are absent from the resume. For example, if the resume doesn't mention "AWS", "Kubernetes", "CI/CD", or "Prometheus", they MUST NOT be listed in "keywords.matched". Only match what is explicitly present.
2. "keywords.missing":
   - List standard keywords, tools, or concepts from the job description or expected for the target Job Title that are ABSENT from the resume.
   - You MUST identify and suggest at least 4-5 missing keywords based on the target Job Title and job description if they are not explicitly present in the resume. For example, for a DevOps role: "Kubernetes", "CI/CD", "Infrastructure as Code", "Prometheus", "Terraform".
`;
