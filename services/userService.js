import User from "../models/User.js";
import { updateProfileSchema } from "../Validations/userValidation.js";

class UserService {
  static async getUserProfile(userId) {
    const user = await User.findById(userId).select(
      "-password -verificationToken"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async updateUserProfile(userId, updateData) {
    const validatedData = updateProfileSchema.parse(updateData);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select("-password -verificationToken");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updateProfilePicture(userId, filePath) {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: filePath },
      { new: true }
    ).select("-password -verificationToken");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export default UserService;
