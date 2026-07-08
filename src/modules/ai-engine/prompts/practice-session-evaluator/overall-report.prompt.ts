export const OVERALL_REPORT_PROMPT = `
OVERALL REPORT SUMMARY

After evaluating every question:
Generate:
- overallScore (integer from 0 to 100)
- performanceLevel (Strictly uppercase: "POOR" | "FAIR" | "GOOD" | "VERY_GOOD" | "EXCELLENT")
- reason (detailed explanation)
- summary (2-4 sentences summarizing performance)

CONSISTENCY CONSTRAINTS:
1. The overallScore must represent a fair reflection of the question evaluations. Do not simply compute an arithmetic average; heavier weighting should be placed on HARD/MEDIUM questions than beginner/EASY questions.
2. If any individual question was answered with "I don't know" or left blank, it must contribute 0 to the evaluation.
3. If all questions receive a score of 0, the overallScore MUST be exactly 0, performanceLevel MUST be "POOR", and hiringRecommendation MUST be "NOT_RECOMMENDED".
4. The performanceLevel must strictly map to the overallScore:
   - 90 to 100: "EXCELLENT"
   - 75 to 89: "VERY_GOOD"
   - 60 to 74: "GOOD"
   - 45 to 59: "FAIR"
   - 0 to 44: "POOR"
`;
