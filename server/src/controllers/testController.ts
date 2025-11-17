import { Request, Response } from 'express';
import { Test } from '../models/Test';

// Get all tests
export const getAllTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests = await Test.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ tests });
  } catch (error) {
    console.error('Get all tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get test by ID
export const getTestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id).populate('createdBy', 'fullName email');
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    res.json({ test });
  } catch (error) {
    console.error('Get test by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new test
export const createTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, pdfUrl, numQuestions, questions } = req.body;

    // Validation
    if (!title || !pdfUrl || !numQuestions || !questions) {
      res.status(400).json({ error: 'Title, PDF URL, number of questions, and questions are required' });
      return;
    }

    // Validate PDF URL format (Cloudinary URLs or backward compatible local paths)
    if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('/uploads/')) {
      res.status(400).json({ error: 'Invalid PDF URL format' });
      return;
    }

    if (numQuestions !== questions.length) {
      res.status(400).json({ error: 'Number of questions does not match questions array length' });
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question?.trim() || !Array.isArray(question.options) || question.correctAnswer == null) {
        res.status(400).json({ error: 'Each question must have question text, options, and correct answer' });
        return;
      }
      if (question.options.length < 2) {
        res.status(400).json({ error: 'Each question must have at least 2 options' });
        return;
      }
      if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        res.status(400).json({ error: 'Correct answer index is out of range' });
        return;
      }
    }

    const test = new Test({
      title,
      pdfUrl,
      numQuestions,
      questions,
      createdBy: req.user!.id
    });

    await test.save();

    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update test
export const updateTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, pdfUrl, numQuestions, questions } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    // Check if user is the creator (admin can update any test)
    if (req.user!.role !== 'admin' && test.createdBy.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to update this test' });
      return;
    }

    // Validation similar to create
    if (numQuestions && questions && numQuestions !== questions.length) {
      res.status(400).json({ error: 'Number of questions does not match questions array length' });
      return;
    }

    // Validate PDF URL format if provided
    if (pdfUrl && !pdfUrl.startsWith('http') && !pdfUrl.startsWith('/uploads/')) {
      res.status(400).json({ error: 'Invalid PDF URL format' });
      return;
    }

    // Update fields
    if (title) test.title = title;
    if (pdfUrl) test.pdfUrl = pdfUrl;
    if (numQuestions) test.numQuestions = numQuestions;
    if (questions) test.questions = questions;

    await test.save();

    res.json({
      message: 'Test updated successfully',
      test
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete test
export const deleteTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    // Check if user is the creator (admin can delete any test)
    if (req.user!.role !== 'admin' && test.createdBy.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this test' });
      return;
    }

    await Test.findByIdAndDelete(id);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
