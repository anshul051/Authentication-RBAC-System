import User from "../models/User.model.js";

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    // req.user is set by authentication middleware
    const userId = req.user.id;

    // Find User (exclude password field)
    const user = await User.findById(userId).select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

//Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    //Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId }, // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email is already taken by another user",
        });
      }
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate (
        userId,
        { email },
        { new: true, runValidators: true }
    ).select("-password -refreshTokens");

    res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      status: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
