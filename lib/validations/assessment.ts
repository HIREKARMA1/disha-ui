import { z } from "zod";

const MIN_ROUNDS = 1;
const MIN_QUESTIONS_PER_ROUND = 10;
const MIN_CODING_QUESTIONS = 1;
const MAX_CODING_QUESTIONS = 10;

const roundSchema = z
  .object({
    round_number: z.number().int().min(1),
    round_type: z.string().min(1),
    round_name: z.string().min(1, "Round name is required"),
    duration_minutes: z.number().int().min(1, "Duration must be at least 1 minute"),
    config: z.record(z.any()).default({}),
    is_mandatory: z.boolean().optional(),
    passing_percentage: z.number().optional().nullable(),
  })
  .superRefine((round, ctx) => {
    if (round.round_type === "group_discussion") return;

    const isCoding = round.round_type === "coding";
    const minQ = isCoding ? MIN_CODING_QUESTIONS : MIN_QUESTIONS_PER_ROUND;
    const maxQ = isCoding ? MAX_CODING_QUESTIONS : 100;
    const num = Number(round.config?.num_questions);
    if (
      !Number.isFinite(num) ||
      !Number.isInteger(num) ||
      num < minQ ||
      num > maxQ
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Round "${round.round_name || round.round_number}" must have a whole number of ${minQ}–${maxQ} questions`,
        path: ["config", "num_questions"],
      });
    }

    if (isCoding) {
      const langs = round.config?.languages;
      if (!Array.isArray(langs) || langs.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Round "${round.round_name || round.round_number}" requires at least one allowed language`,
          path: ["config", "languages"],
        });
      }
      const aiRaw = round.config?.ai_question_count;
      if (aiRaw !== undefined && aiRaw !== null && aiRaw !== "") {
        const ai = Number(aiRaw);
        if (!Number.isFinite(ai) || !Number.isInteger(ai) || ai < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Round "${round.round_name || round.round_number}" AI question count must be a whole number of 0 or greater`,
            path: ["config", "ai_question_count"],
          });
        } else if (Number.isFinite(num) && ai > num) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Round "${round.round_name || round.round_number}" AI question count cannot exceed total questions`,
            path: ["config", "ai_question_count"],
          });
        }
      }
      return;
    }

    const aiRaw = round.config?.ai_question_count;
    if (aiRaw !== undefined && aiRaw !== null && aiRaw !== "") {
      const ai = Number(aiRaw);
      if (!Number.isFinite(ai) || !Number.isInteger(ai) || ai < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Round "${round.round_name || round.round_number}" AI question count must be a whole number of 0 or greater`,
          path: ["config", "ai_question_count"],
        });
      } else if (Number.isFinite(num) && ai > num) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Round "${round.round_name || round.round_number}" AI question count cannot exceed total questions`,
          path: ["config", "ai_question_count"],
        });
      }
    }
    if (round.round_type === "mcq" || round.round_type === "technical_mcq") {
      const topic = String(round.config?.topic || "").trim();
      if (!topic) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Round "${round.round_name || round.round_number}" requires a topic for ${
            round.round_type === "mcq" ? "MCQ based Question" : "Technical MCQ"
          }`,
          path: ["config", "topic"],
        });
      }
    }
  });

/** Validates assessment create/edit form fields that gate conducting an exam. */
export const assessmentFormSchema = z
  .object({
    assessment_name: z.string().min(1, "Assessment name is required"),
    mode: z.enum(["HIRING", "UNIVERSITY", "CORPORATE", "ADMIN"], {
      required_error: "Select what this assessment is for",
    }),
    time_window: z.object({
      start_time: z.string().min(1, "Start time is required"),
      end_time: z.string().min(1, "End time is required"),
    }),
    rounds: z
      .array(roundSchema)
      .min(MIN_ROUNDS, `At least ${MIN_ROUNDS} rounds are required`),
  })
  .superRefine((data, ctx) => {
    if (data.time_window.start_time && data.time_window.end_time) {
      const start = new Date(data.time_window.start_time);
      const end = new Date(data.time_window.end_time);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time",
          path: ["time_window", "end_time"],
        });
      }
    }
  });

export type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;
export type AssessmentFormSchemaInput = AssessmentFormValues;

/**
 * Map Zod issues into a flat Record used by AssessmentForm error UI.
 */
export function mapAssessmentFormErrors(
  result: z.SafeParseReturnType<unknown, AssessmentFormSchemaInput>
): Record<string, string> {
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key === "assessment_name" && !errors.assessment_name) {
      errors.assessment_name = issue.message;
    } else if (key === "mode" && !errors.mode) {
      errors.mode = issue.message;
    } else if (key === "time_window") {
      const sub = issue.path[1];
      if (sub === "start_time" && !errors.start_time) {
        errors.start_time = issue.message;
      } else if (sub === "end_time" && !errors.end_time) {
        errors.end_time = issue.message;
      } else if (!errors.timeWindow) {
        errors.timeWindow = issue.message;
      }
    } else if (key === "rounds" && !errors.rounds) {
      errors.rounds = issue.message;
    }
  }
  return errors;
}

export { MIN_QUESTIONS_PER_ROUND, MIN_CODING_QUESTIONS, MAX_CODING_QUESTIONS, MIN_ROUNDS };
