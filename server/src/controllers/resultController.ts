import { Request, Response } from 'express';
import { Result } from '../models/Result';
import { Test } from '../models/Test';

// Submit test result
export const submitResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId, answers } = req.body;
    const studentId = req.user!.id;

    // Validation
    if (!testId || !answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Test ID and answers array are required' });
      return;
    }

    // Check if test exists
    const test = await Test.findById(testId);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    // Check if student already submitted this test
    const existingResult = await Result.findOne({ testId, studentId });
    if (existingResult) {
      res.status(409).json({ error: 'You have already submitted this test' });
      return;
    }

    // Validate answers
    if (answers.length !== test.numQuestions) {
      res.status(400).json({ error: 'Number of answers does not match number of questions' });
      return;
    }

    // Calculate score
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      if (answer.questionIndex !== i) {
        res.status(400).json({ error: `Answer at index ${i} has incorrect questionIndex` });
        return;
      }
      if (answer.selectedAnswer === test.questions[i].correctAnswer) {
        score++;
      }
    }

    const percentage = Math.round((score / test.numQuestions) * 100);

    // Create result
    const result = new Result({
      testId,
      studentId,
      answers,
      score,
      totalQuestions: test.numQuestions,
      percentage
    });

    await result.save();

    res.status(201).json({
      message: 'Test result submitted successfully',
      result: {
        id: result._id,
        testId: result.testId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        submittedAt: result.submittedAt
      }
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student's own results
export const getMyResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.id;

    const results = await Result.find({ studentId })
      .populate('testId', 'title createdAt')
      .sort({ submittedAt: -1 });

    res.json({ results });
  } catch (error) {
    console.error('Get my results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all results (admin only)
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await Result.find()
      .populate('testId', 'title')
      .populate('studentId', 'fullName email')
      .sort({ submittedAt: -1 });

    res.json({ results });
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get results for a specific test (admin only)
export const getTestResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;

    // Check if test exists
    const test = await Test.findById(testId);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    const results = await Result.find({ testId })
      .populate('studentId', 'fullName email')
      .sort({ submittedAt: -1 });

    res.json({
      test: {
        id: test._id,
        title: test.title
      },
      results
    });
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific result
export const getResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate('testId', 'title questions')
      .populate('studentId', 'fullName email');

    if (!result) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    // Check if user is authorized (student can view their own, admin can view any)
    if (req.user!.role !== 'admin' && result.studentId._id.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to view this result' });
      return;
    }

    res.json({ result });
  } catch (error) {
    console.error('Get result by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};