export const FEEDBACK_PROMPT = `
Evaluate the candidate's match and formulate structured feedback.

Feedback Guidelines:

1. feedback.summary:
   - Provide a constructive, professional 4-5 sentence summary evaluating the candidate's fit for the job title and requirements.
   - Outline their primary value proposition (what makes them a strong fit) and their key growth area or missing requirement.
   - MUST explicitly state and compare the candidate's calculated years of experience with the required years of experience (e.g. comparing candidate's 0.5 years of experience to the 1 year required).
   - Do NOT leave this empty.

2. feedback.highlights:
   - Identify 2-5 specific highlights from the candidate's resume (e.g., strong skills in a relevant area, experience working on key projects, relevant degree/education).
   - Ensure highlights focus on achievements, technologies mastered, or core strengths.
   - Do NOT leave this array empty.

3. feedback.concerns:
   - Identify 2-5 genuine concerns or potential risk areas regarding the candidate's fit (e.g., short job tenures, lack of required experience with key tools, missing specific certifications requested in the job description).
   - If the candidate is a near-perfect match, list constructive areas of improvement (e.g., "Could gain certification A to solidify credentials", "Has limited exposure to large-scale setups").
   - Do NOT leave this array empty.

Ensure the feedback is specific, objective, and aligns logically with the rest of the match analysis data (such as strengths, gaps, and matchScore).
`;
