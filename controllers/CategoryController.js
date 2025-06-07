import CategoryService from "../services/categoryService.js";

class CategoryController {
  static async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCategoriesWithCount(req, res) {
    try {
      const categories = await CategoryService.getCategoriesWithQuestionCount();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getQuestionsByCategory(req, res) {
    try {
      const questions = await CategoryService.getQuestionsByCategory(
        req.params.categoryId
      );
      res.json({
        success: true,
        data: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      // Validate input
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const newCategory = await CategoryService.createCategory({
        name,
        description,
      });

      res.status(201).json({
        success: true,
        data: newCategory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default CategoryController;
