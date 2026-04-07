import { Request, Response, NextFunction } from 'express';
import ProjectService from '../services/ProjectService';

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;
    const adminId = (req as any).user._id.toString();
    const project = await ProjectService.createProject(adminId, name, description);
    res.status(201).json(project);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const getMyProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const projects = await ProjectService.listProjects(userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await ProjectService.getProjectDetails(id as string);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    const members = await ProjectService.getProjectMembers(id as string);
    res.json({ project, members });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user._id.toString();
    const { email } = req.body;
    await ProjectService.addMember(id as string, adminId, email as string);
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const adminId = (req as any).user._id.toString();
    await ProjectService.removeMember(id as string, adminId, userId as string);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user._id.toString();
    await ProjectService.deleteProject(id as string, adminId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
