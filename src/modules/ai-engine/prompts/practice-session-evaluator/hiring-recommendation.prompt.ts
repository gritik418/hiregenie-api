export const HIRING_RECOMMENDATION_PROMPT = `
HIRING RECOMMENDATION

Select EXACTLY one value for "hiringRecommendation" (must be strictly uppercase):
- "NOT_RECOMMENDED"
- "CONSIDER"
- "RECOMMENDED"
- "STRONGLY_RECOMMENDED"

ALIGNMENT WITH OVERALL SCORE:
Your recommendation must align with the overallScore as follows:
- 90 to 100: "STRONGLY_RECOMMENDED" (Demonstrates expert knowledge, strong communication, and robust problem solving).
- 75 to 89: "RECOMMENDED" (Solid performer, technically sound, only minor improvement areas).
- 55 to 74: "CONSIDER" (Demonstrates basic competency but has significant skill gaps or weak reasoning in some areas).
- 0 to 54: "NOT_RECOMMENDED" (Demonstrates severe knowledge gaps, failed to answer core questions, provided trivial answers, or responded with "I don't know").

CRITICAL: If the candidate answered "I don't know", left answers blank, or provided only trivial/low-effort responses for most or all questions, you MUST select "NOT_RECOMMENDED".
`;
