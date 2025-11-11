import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Answer
export interface IAnswer {
  questionIndex: number;
  selectedAnswer: number;
}

// TypeScript interface for Result
export interface IResult extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: Date;
}

// Mongoose schema for Answer
const answerSchema = new Schema<IAnswer>({
  questionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return Number.isInteger(v);
      },
      message: 'Selected answer must be an integer'
    }
  }
});

// Mongoose schema for Result
const resultSchema = new Schema<IResult>({
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
resultSchema.index({ testId: 1 });
resultSchema.index({ studentId: 1 });
resultSchema.index({ submittedAt: -1 });

// Compound index for unique test-student combination
resultSchema.index({ testId: 1, studentId: 1 }, { unique: true });

// Export the model
export const Result = mongoose.model<IResult>('Result', resultSchema);