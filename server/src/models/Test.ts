import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Question
export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// TypeScript interface for Test
export interface ITest extends Document {
  title: string;
  pdfUrl: string;
  numQuestions: number;
  createdBy: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
}

// Mongoose schema for Question
const questionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return Number.isInteger(v);
      },
      message: 'Correct answer must be an integer'
    }
  }
});

// Mongoose schema for Test
const testSchema = new Schema<ITest>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  pdfUrl: {
    type: String,
    required: true,
    trim: true
  },
  numQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
testSchema.index({ createdBy: 1 });
testSchema.index({ createdAt: -1 });

// Export the model
export const Test = mongoose.model<ITest>('Test', testSchema);