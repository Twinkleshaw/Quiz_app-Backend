import AuthService from "../services/AuthService.js";

class AuthController {
  static async signup(req, res) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({
        success: true,
        data: result.user,
        message:
          "User created successfully. Please check your email for verification.",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const user = await AuthService.verifyEmail(token);
      res.json({
        success: true,
        data: user,
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    try {
      const { token, user } = await AuthService.login(req.body);
      res.json({
        success: true,
        data: { token, user },
        message: "Login successful",
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default AuthController;