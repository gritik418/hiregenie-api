export const CERTIFICATIONS_PROMPT = `
Evaluate the candidate's professional certifications.

Rules for "certifications":
1. "certifications.matched":
   - List professional certifications explicitly present on the candidate's resume.
   - If the candidate has no certifications listed on their resume, this array MUST be empty [].
2. "certifications.missing":
   - List standard or preferred certifications matching the target Job Title that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing certifications based on the target Job Title. E.g., for a DevOps Engineer role: "AWS Solutions Architect Associate", "Certified Kubernetes Administrator (CKA)", "HashiCorp Certified: Terraform Associate", "Jenkins Certified Engineer", "AWS Certified DevOps Engineer - Professional".
`;
