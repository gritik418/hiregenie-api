export const MATCHING_PROMPT = `
Compare the resume against the job description.

Only compare information that is explicitly stated.

Do not infer missing information.

Do not assume technologies.

Do not invent certifications.

Do not invent qualifications.

Do not invent responsibilities.

Rules

Matched

Include only items clearly present in BOTH documents.

Missing

Include only items that:

- are explicitly required by the job description
- are absent from the resume

Partial

Include only closely related skills.

Example

Job:
NestJS

Resume:
Express.js

→ Partial

Example

Job:
AWS

Resume:
Docker

→ Missing

Never use generic placeholders.

INVALID

[
"required skills"
]

[
"required certifications"
]

[
"missing technologies"
]

VALID

[
"AWS",
"Docker Compose",
"Kubernetes"
]

If no missing items exist, return an empty array.

Never fabricate missing keywords.
`;
