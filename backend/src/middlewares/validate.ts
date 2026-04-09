import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
      return;
    }
    req.body = value;
    next();
  };

export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('ADMIN', 'MEMBER').default('MEMBER'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createProject: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    description: Joi.string().allow('').max(1000),
  }),

  addMember: Joi.object({
    email: Joi.string().email().required(),
  }),

  createTask: Joi.object({
    projectId: Joi.string().required(),
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(2000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
    deadline: Joi.date().optional().allow(null, ''),
    assignedTo: Joi.string().optional().allow(null, ''),
  }),

  updateTaskStatus: Joi.object({
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').required(),
  }),

  assignTask: Joi.object({
    assignedTo: Joi.string().required(),
  }),

  updateTask: Joi.object({
    title: Joi.string().min(2).max(200),
    description: Joi.string().allow('').max(2000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
    deadline: Joi.date().optional().allow(null, ''),
  }).min(1),
};
