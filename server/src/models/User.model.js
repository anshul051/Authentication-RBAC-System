import mongoose from 'mongoose';
import { type } from 'os';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // Convert to lowercase before saving
      trim: true, // Remove whitespace
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'], // Only these values allowed
      default: 'user',
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        tokenId: {
          type: String,
          required: true,
        },
        device: {
          type: String,
          required: true,
        },
        browser: {
          type: String,
          default: 'Unknown Browser',
        },
        os: {
          type: String,
          default: 'Unknown OS',
        },
        ipAddress: {
          type: String,
          required: true,
        },
        lastActive: {
          type: Date,
          default: Date.now,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
    
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Check if the account is currently locked
userSchema.virtual('isLocked').get(function() {
  // Check if lockUntil exists and is in the future
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model('User', userSchema);

export default User;