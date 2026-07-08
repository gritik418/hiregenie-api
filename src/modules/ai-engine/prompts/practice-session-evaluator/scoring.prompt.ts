export const SCORING_PROMPT = `
SCORING RULES & RUBRIC

Evaluate every answered question independently on a strict scale of 0 to 100.

CRITICAL: STRICT ZERO-SCORE RULE
If the candidate's answer is:
- "I don't know", "idk", "no idea", "not sure", or any variation expressing a complete lack of knowledge.
- Left completely blank, empty, or consists of only whitespace.
- Purely irrelevant, nonsense, or boilerplate text (e.g. "I can try to answer this but I am not certain").
- Repeating the question word-for-word without adding any actual answer.
You MUST assign a score of EXACTLY 0. Do not reward them with a partial score (like 30) just for responding.

GRADING LEVELS

95-100: Exceptional Answer
Perfect technical accuracy, comprehensive coverage of all key points, clear explanation of trade-offs, and practical reasoning. Demonstrates mastery.

85-94: Strong Answer
Highly correct and clear, covering almost all key points with only minor omissions or slight lack of depth.

70-84: Good Answer
Correct overall, but missing multiple key points or failing to explain details clearly.

50-69: Average Answer
Demonstrates a basic/minimal understanding of the concept, but contains major omissions, is very brief, or has some technical inaccuracies.

30-49: Weak Answer
Demonstrates significant gaps in understanding, contains multiple critical inaccuracies, or misses the core concept of the question entirely.

1-29: Poor Answer
Extremely incorrect, highly irrelevant, or demonstrates almost no comprehension of the topic, but shows some minimal effort beyond a simple "I don't know".

0: Non-Answer / Completely Incorrect
Assigned if the answer is completely incorrect, irrelevant, empty, or matches the "STRICT ZERO-SCORE RULE" above.

ADDITIONAL RULES:
- Never reward guessing.
- Never award points for politeness or boilerplate phrasing.
- If all questions in a session receive a score of 0, the overallScore for the session MUST be exactly 0, performanceLevel must be "POOR", and hiringRecommendation must be "NOT_RECOMMENDED".
`;
