import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import ResumeAnalysisResponseSchema from './schemas/resumeAnalysisResponse.schema';
import ResumeAnalysisOutputDto from './dto/resumeAnalysisOutput.dto';
import MatchResumeResponseSchema from './schemas/matchResumeResponse.schema';
import MatchResumeAnalysisOutputDto from './dto/matchResumeAnalysisOutput.dto';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
  ) {}

  async analyzeResume(resumeId: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });
    if (!resume || !resume.fileUrl)
      throw new BadRequestException('Resume not found.');

    const existingAnalysis = await this.prismaService.resumeAnalysis.findFirst({
      where: {
        resumeId: resume.id,
        status: 'COMPLETED',
      },
    });

    if (existingAnalysis) {
      return {
        success: true,
        message: 'Resume already analyzed',
        analysis: existingAnalysis,
      };
    }

    let rawText = resume.rawText || '';

    if (!rawText) {
      rawText = await this.pdfParserService.parseFromURL(resume.fileUrl);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          rawText,
        },
      });
    }

    const prompt = `
    You are an expert technical recruiter.

    Analyze the resume and return ONLY valid JSON.

    STRICT OUTPUT RULES:
    - Your entire response MUST be a single valid JSON object
    - Do NOT include any text before or after JSON
    - Do NOT include markdown
    - Do NOT use \`\`\`
    - Do NOT return schema
    - Do NOT add explanations
    - All fields are REQUIRED
    - Use valid JSON (no trailing commas, no comments)

    FORMAT:
    {
      "score": number (0 - 100),
      "breakdown": {
        "keywords": number (0 - 100),
        "experience": number (0 - 100),
        "projects": number (0 - 100),
        "formatting": number (0 - 100)
      },
      "recommendedRoles": [
        {
          "title": string,
          "confidence": number (0 - 100)
        }
      ],
      "strengths": string[],
      "weaknesses": string[],
      "gaps": string[],
      "suggestions": string[],
      "keywords": {
        "matched": string[],
        "missing": string[]
      },
      "summary": string,
      "reason": string,
      "feedback": {
        "summary": string,
        "highlights": string[],
        "areasToImprove": string[]
      }
    }

    EXPERIENCE DETECTION (VERY IMPORTANT):
    - Determine total professional experience from the resume
    - Internships count but indicate entry-level
    - If total experience < 1 year → classify as "Intern/Entry Level"

    HARD EXPERIENCE RULES (MANDATORY):
    - < 1 year → ONLY Intern or Junior roles allowed
    - 1–3 years → Junior or Mid-level roles
    - 3+ years → Mid or Senior roles
    - NEVER assign Senior roles for less than 3 years experience
    - NEVER assign Architect/Lead roles for less than 5 years experience
    - These rules OVERRIDE all other signals

    SCORING RULES:
    - All scores must be integers between 0 and 100
    - breakdown scores must also be 0–100

    ROLE RULES:
    - Suggest up to 3 relevant roles (1–3 allowed)
    - Roles MUST strictly follow experience level
    - Roles must match skills in resume
    - Do NOT include unrelated roles

    STRENGTHS:
    - Provide meaningful strengths based on resume

    WEAKNESSES:
    - Provide weaknesses only if clearly identifiable
    - If resume is strong, keep minimal but realistic

    GAPS:
    - Gaps = missing skills or experience
    - If resume is weak → include fundamental gaps
    - If resume is strong → include advanced improvements
    - If no major gaps → return empty array

    SUGGESTIONS:
    - Provide actionable suggestions (tools, technologies, projects)
    - Avoid vague advice

    KEYWORDS:
    - matched = skills present
    - missing = important but absent skills
    - Can be empty if resume is strong

    SUMMARY:
    - 2–3 lines
    - MUST reflect actual experience level (Intern / Junior / Mid)
    - NEVER use "Senior", "Expert", or "Architect" for < 3 years experience

    FEEDBACK RULES (STRICT):
    - feedback.summary MUST be 1–2 lines, human-readable evaluation
    - feedback.highlights MUST contain 2–4 concise bullet points
    - feedback.areasToImprove MUST contain 2–4 actionable points

    - DO NOT repeat strengths, weaknesses, or suggestions word-for-word
    - DO NOT leave any feedback field empty
    - Keep feedback concise and clear
    - feedback must sound like a real recruiter’s evaluation

    CRITICAL:
    - Output MUST be valid JSON
    - If unsure, still return best possible valid JSON

    RESUME:
    ${rawText.slice(0, 5000)}
    `;

    const data =
      await this.aiEngineService.generateResponseInJSON<ResumeAnalysisOutputDto>(
        prompt,
        ResumeAnalysisResponseSchema,
      );

    if (!data) {
      await this.prismaService.resumeAnalysis.create({
        data: {
          resumeId: resume.id,
          userId: resume.userId,
          status: 'FAILED',
          summary: 'Failed to analyze resume',
          reason: 'Failed to analyze resume',
        },
      });
      throw new BadRequestException('Failed to analyze resume');
    }

    const analysis = await this.prismaService.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: resume.userId,
        status: 'COMPLETED',
        ...data,
      },
    });

    return { success: true, message: 'Resume analyzed successfully', analysis };
  }

  async matchResume(resumeId: string, data: MatchResumeInputDto) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume || !resume.fileUrl)
      throw new BadRequestException('Resume not found.');

    let rawText = resume.rawText || '';

    if (!rawText) {
      rawText = await this.pdfParserService.parseFromURL(resume.fileUrl);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          rawText,
        },
      });
    }

    const prompt = `
    You are an expert technical recruiter.

    Analyze the candidate resume against the target job role.

    Return ONLY valid JSON.

    STRICT RULES:
    - No markdown
    - No explanations
    - NO COMMENTS
    - No extra text
    - Output must be valid JSON
    - All fields are required
    - Do NOT change schema structure
    - Do NOT return invalid JSON
    - Use proper data types exactly as defined
    - Numerical fields can't be null or undefined, return 0, if no value for Numerical fields
    - No value for string fields, return ""

    JSON SCHEMA (MUST FOLLOW, NO COMMENTS IN JSON):
    {
      "matchScore": type number, // CAN'T BE NULL
      "fitLevel": type string (LOW | MODERATE | HIGH),
      "skills": {
        "matched": type string[], 
        "missing": type string[],
        "partial": type string[]
      },
      "experience": {
        "requiredYears": type number | null,
        "candidateExperience": type number,
        "meetsRequirement": type boolean,
        "notes": type string
      },
      "roleFit": {
        "targetRole": type string,
        "matchedRoles": type string[],
        "alignmentScore": type number // CAN'T BE NULL
      },
      "gaps": type string[],
      "suggestions": type string[],
      "learningPath": type string[],
      "summary": type string,
      "reason": type string,
      "feedback": {
        "summary": type string,
        "highlights": type string[]
      }
    }

    MATCH SCORE RULES:
    - Must provide a score
    - 0-49 = LOW
    - 50-74 = MODERATE
    - 75-100 = HIGH

    SKILLS RULES:
    - matched:
      - Skills present in the resume that match the job requirements
    - missing:
      - Skills that should be there according to the job but are not found in the resume
      - Must try to add atleast 2-3 missing skills
    - partial:
      - Skills weakly matched, indirectly related, briefly mentioned, or lacking practical/project evidence
      - Must try to add atleast 2-3 partial skills only if missing skills are less than 3

    FIT LEVEL RULES:
    - matchScore < 50 → LOW
    - matchScore 50-74 → MODERATE
    - matchScore >= 75 → HIGH

    EXPERIENCE RULES:
    - NO COMMENTS in JSON
    - NO EXPLANATIONS
    - candidateExperience = must be calculated ONLY from explicitly mentioned professional experience entries in the resume

    - Count ONLY:
      - Full-time jobs
      - Part-time jobs
      - Internships
      - Contract roles
      - Apprenticeships

    - Do NOT count:
      - Personal projects
      - Academic projects
      - Freelance work unless explicitly marked as professional experience
      - Open-source contributions
      - Hackathons
      - Bootcamps
      - Skill usage assumptions
      - Experience inferred from summaries, skills, or project descriptions

    - Experience duration MUST be calculated strictly from actual dates mentioned in the resume

    - Date calculation rules:
      - Month + Year to Month + Year
      - Month + Year to Present
      - Year-only dates are invalid and must be ignored
      - If either start date or end date is missing, ignore that experience entry

    - Present date calculation:
      - Use CURRENT MONTH & YEAR provided in the prompt
      - Treat 'Present', 'Current', or 'Ongoing' as current date

    - Calculation method:
      - Convert total experience into months first
      - Sum all valid professional experience months
      - Convert final total into decimal years
      - Formula:
        candidateExperience = totalMonths / 12

    - Decimal rules:
      - Keep precise decimal values
      - Do NOT round aggressively
      - Maximum 2 decimal places allowed
      - Examples:
        - 6 months = 0.5
        - 1 year 3 months = 1.25
        - 1 year 6 months = 1.5
        - 2 years 2 months = 2.17

    - Overlapping experience entries:
      - Do NOT double count overlapping months

    - If no valid professional experience exists:
      - candidateExperience = 0

    - requiredYears rules:
      - Extract ONLY if explicitly mentioned in job description
      - If not explicitly mentioned:
        - requiredYears = null

    - meetsRequirement rules:
      - If requiredYears is null:
        - meetsRequirement = false
      - Else:
        - meetsRequirement = candidateExperience >= requiredYears

    ROLEFIT RULES:
    - alignmentScore = must be a number, score must be between 0 and 100, if the target role doesn't match the candidate's skills and experience, alignmentScore must be very low
    - TargetRole = must match the job title provided by the user
    - matchedRoles:
      - Must be an array of role titles
      - Roles must align with the candidate's skills, projects, and professional experience
      - Roles should be generic, not very specific (like Full Stack Developer, Software Engineer, etc)
      - Upto 5 roles, try to generate atleast 3 related roles

    SCORING RULES:
    - matchScore and breakdown values must be integers between 0 and 100
    - skills = technical skill relevance
    - experience = experience relevance
    - projects = project quality and relevance
    - education = education relevance

    GAPS RULES:
    - Include important missing skills or experience gaps
    - Keep concise and realistic

    SUGGESTIONS RULES:
    - Must be actionable
    - Mention technologies, projects, certifications, or learning directions
    - Avoid generic advice

    SUMMARY RULES:
    - 2 to 3 lines summary
    - NO HTML

    FEEDBACK RULES:
    - feedback.summary is required, string format, NO HTML
    - feedback.highlights must contain 2-4 concise points, NO HTML
    - Feedback should sound like real recruiter evaluation

    REASON RULES:
    - Must be good enough to be shown to the candidate
    - IN HTML format
    - Upto 400 words (excluding html tags, use ' for styling)
    - MUST BE PROPERLY ENCLOSED IN "", DONT USE " Inside

    TARGET ROLE:
    ${data.jobTitle ?? 'Unknown'}

    JOB DESCRIPTION:
    ${data.jobDescription ?? 'Not provided'}

    REQUIRED EXPERIENCE:
    ${data.experienceRequired ?? 'Not provided'}

    CURRENT MONTH & YEAR: (FOR CANDIDATE'S EXPERIENCE CALCULATION):
    ${new Date().getMonth()}, ${new Date().getFullYear()}

    RESUME:
    ${rawText.slice(0, 5000)}

    INSTRUCTIONS: Provide feedback that's professional, specific, and helpful for improvement.
    NO comments, NO explanation, NO extra text, ONLY return the JSON object

    CRITICAL JSON RULES:
      - Numbers must be plain numbers only
      - Never generate formulas or calculations
      - Never generate comments
      - Never generate expressions like 12 / 4
      - Never   use markdown
      - Never use backticks
      - Never use // comments
      - Never use /* comments */
      - NO COMMENTS in JSON (FOR EXAMPLE: DON'T PUT comments as "// this is comments" INSIDE JSON)
    `;

    const analysis =
      await this.aiEngineService.generateResponseInJSON<MatchResumeAnalysisOutputDto>(
        prompt,
        MatchResumeResponseSchema,
      );

    if (!analysis) {
      // await this.prismaService.create({
      //   data: {
      //     resumeId: resume.id,
      //     userId: resume.userId,
      //     status: 'FAILED',
      //     summary: 'Failed to analyze resume',
      //     reason: 'Failed to analyze resume',
      //   },
      // });
      throw new BadRequestException('Failed to match resume');
    }

    return { success: true, message: 'Resume matched successfully', analysis };
  }
}
