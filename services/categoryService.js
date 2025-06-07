import Category from "../models/Category.js";
import Question from "../models/Question.js";

class CategoryService {
  static async getAllCategories() {
    return await Category.find().sort({ name: 1 });
  }

  static async getCategoriesWithQuestionCount() {
    return await Category.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "categories",
          as: "questions",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          questionCount: { $size: "$questions" },
        },
      },
      { $sort: { name: 1 } },
    ]);
  }

  static async getQuestionsByCategory(categoryId) {
    return await Question.find({ categories: categoryId }).populate(
      "categories",
      "name"
    );
  }

  static async createCategory(categoryData) {
    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryData.name}$`, "i") },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const category = new Category({
      name: categoryData.name,
      description: categoryData.description || "",
    });

    return await category.save();
  }
}

export default CategoryService;
