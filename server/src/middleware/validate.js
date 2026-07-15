/**
 * middleware/validate.js — Input validation helpers using express-validator
 */
import { validationResult, body } from 'express-validator';

/** Run validationResult and return 422 if any errors */
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  'Validation failed.',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/** Validation rules for assessment submission */
export const assessmentRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 120 }).withMessage('Name is too long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 }).withMessage('Phone number is too long.'),

  body('program')
    .trim()
    .notEmpty().withMessage('Program is required.')
    .isIn([
      'money-energetics',
      'wealth-oracle',
      'divine-wealth',
      'sovereign-mentor',
      'inner-sanctum',
    ]).withMessage('Invalid program.'),

  body('answers')
    .isArray({ min: 8, max: 8 }).withMessage('Expected exactly 8 answers.')
    .custom(arr => arr.every(a => ['A','B','C','D','E'].includes(String(a).toUpperCase())))
    .withMessage('Answers must be one of A, B, C, D, E.'),
];

/** Validation rules for admin login */
export const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password too short.'),
];

/** Validation rules for admin notes update */
export const notesRules = [
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Notes too long.'),
];
