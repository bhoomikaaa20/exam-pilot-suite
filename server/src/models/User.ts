import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for User
export interface IUser extends Document {
  email: string;
  fullName: string;
  password: string;
  role: 'admin' | 'student';
  createdAt: Date;
}

// Mongoose schema for User
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true,
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Export the model
export const User = mongoose.model<IUser>('User', userSchema);