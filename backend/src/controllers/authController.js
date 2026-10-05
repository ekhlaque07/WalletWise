const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
    sendPasswordResetEmail,
} = require("../services/emailService");


// function for generating JWT.
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// Register controller
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Login controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get current user controller
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Forgot password controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        // Return the same response whether the email
        // exists or not, to prevent account enumeration.
        const successMessage =
            "If an account exists with this email, " +
            "a password reset link has been sent.";

        if (!user) {
            return res.status(200).json({
                message: successMessage,
            });
        }

        // Generate a cryptographically secure token.
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only the SHA-256 hash in MongoDB.
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;

        // Token expires in 15 minutes.
        user.resetPasswordExpires =
            Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetURL =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(
                user.email,
                resetURL
            );
        } catch (emailError) {
            // Do not leave an unusable token if email fails.
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;

            await user.save();

            console.error(
                "Password reset email failed:",
                emailError
            );

            return res.status(500).json({
                message: "Unable to send reset email. Please try again later.",
            });
        }

        return res.status(200).json({
            message: successMessage,
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Something went wrong. Please try again.",
        });
    }
};

// Reset password controller
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required",
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                message: "Both password fields are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        // Hash the token received from the URL.
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find a user with a valid, unexpired token.
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: Date.now(),
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset link",
            });
        }

        // Hash the new password.
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        user.password = hashedPassword;

        // Invalidate the token after successful use.
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Password reset successful. You can now log in.",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Something went wrong. Please try again.",
        });
    }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};