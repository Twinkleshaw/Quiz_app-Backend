import Question from "../models/Question.js";
import Category from "../models/Category.js";
import {
  questionSchema,
  bulkQuestionsSchema,
} from "../Validations/questionValidation.js";
import csv from "csv-parser";
import fs from "fs";
import mongoose from "mongoose";
import UserAnswer from "../models/UserAnswer.js";

class QuestionService {
  static async addQuestion(questionData, user) {
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can add questions");
    }
    const validatedData = questionSchema.parse(questionData);

    // Verify categories exist
    const categories = await Category.find({
      _id: { $in: validatedData.categories },
    });

    if (categories.length !== validatedData.categories.length) {
      throw new Error("One or more categories not found");
    }

    const question = new Question(validatedData);
    await question.save();
    return question;
  }

  static async addQuestionsFromCSV(filePath, user) {
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can upload questions");
    }

    return new Promise((resolve, reject) => {
      const questions = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          try {
            const questionData = {
              text: row.text,
              options: [
                { text: row.option1, isCorrect: row.correctOption === "1" },
                { text: row.option2, isCorrect: row.correctOption === "2" },
                { text: row.option3, isCorrect: row.correctOption === "3" },
                { text: row.option4, isCorrect: row.correctOption === "4" },
              ].filter((opt) => opt.text),
              categories: row.categories.split(",").map((cat) => cat.trim()),
              difficulty: row.difficulty || "medium",
              explanation: row.explanation || "",
            };

            questions.push(questionData);
          } catch (error) {
            console.error("Error parsing row:", row, error);
          }
        })
        .on("end", async () => {
          try {
            bulkQuestionsSchema.parse(questions);

            const results = [];
            for (const q of questions) {
              try {
                // Pass the user object explicitly to addQuestion
                const savedQuestion = await QuestionService.addQuestion(
                  q,
                  user
                ); // ← Here's the fix
                results.push(savedQuestion);
              } catch (error) {
                console.error("Error saving question:", q, error);
                results.push({ error: error.message, question: q });
              }
            }

            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", reject);
    });
  }

  static async submitAnswer(userId, questionId, selectedOptionId, timezone) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const selectedOption = question.options.id(selectedOptionId);
    if (!selectedOption) {
      throw new Error("Invalid option selected");
    }

    const isCorrect = selectedOption.isCorrect;

    const userAnswer = new UserAnswer({
      user: userId,
      question: questionId,
      selectedOption: selectedOptionId,
      isCorrect,
      timezone,
    });

    await userAnswer.save();

    return {
      isCorrect,
      correctOption: question.options.find((opt) => opt.isCorrect)?._id,
      explanation: question.explanation,
    };
  }

  static async searchQuestionsWithAnswers(userId, searchQuery, timezone) {
    return await Question.aggregate([
      {
        $match: {
          $or: [{ text: { $regex: searchQuery, $options: "i" } }],
        },
      },
      {
        $lookup: {
          from: "useranswers",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$question", "$$questionId"] },
                    { $eq: ["$user", new mongoose.Types.ObjectId(userId)] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                selectedOption: 1,
                isCorrect: 1,
                submittedAt: {
                  $dateToString: {
                    date: "$submittedAt",
                    timezone: timezone,
                    format: "%Y-%m-%d %H:%M:%S",
                  },
                },
              },
            },
          ],
          as: "userAnswers",
        },
      },
      {
        $unwind: {
          path: "$userAnswers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          text: 1,
          options: 1,
          categories: 1,
          userAnswer: "$userAnswers",
        },
      },
    ]);
  }
}

export default QuestionService;
