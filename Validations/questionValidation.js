import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters long"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least two options are required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  explanation: z.string().optional(),
});

export const bulkQuestionsSchema = z.array(questionSchema);
