export const BREAKDOWN_PROMPT = `
BREAKDOWN METRICS

Generate integer scores between 0 and 100 for the following categories:
- technicalKnowledge (Accuracy, depth, and correctness of technical concepts)
- problemSolving (Ability to reason through scenarios and edge cases)
- communication (Clarity, structure, and professional language)
- confidence (Certainty in answers, avoiding hesitancy or guessing)
- completeness (Coverage of expected answers and key points)

CRITICAL: ZERO-SCORE ALIGNMENT
If the candidate has answered "I don't know", "idk", left answers blank, or provided only trivial/low-effort responses (e.g. "hey", "very easy", "nice", "ok") for all questions:
- You MUST assign EXACTLY 0 to all breakdown categories: technicalKnowledge, problemSolving, communication, confidence, and completeness.
- Do not award default pass scores (like 50 or 60) for communication or confidence if they did not answer the questions. Stating "hey", "nice", or "very easy" does not demonstrate professional technical communication, problem solving, or confidence.
`;
