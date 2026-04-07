import mongoose from "mongoose";
import ProjectRepository from '../repositories/ProjectRepository';
import UserRepository from '../repositories/UserRepository';
import { IProjectDocument } from '../models/Project';
import { IProjectMemberDocument } from '../models/ProjectMember';

const getOwnerId = (project: IProjectDocument): string => {
  const admin = project.adminId as any;
  return (admin?._id ?? admin).toString();
};

class ProjectService {

  private readonly projectRepo = ProjectRepository;
  private readonly userRepo = UserRepository;

  public async createProject(
    adminId: string,
    name: string,
    description?: string
  ): Promise<IProjectDocument> {
    return this.projectRepo.save({ adminId: new mongoose.Types.ObjectId(adminId), name, description } as unknown as Partial<IProjectDocument>);
  }

  public async addMember(
    projectId: string,
    adminId: string,
    email: string
  ): Promise<IProjectMemberDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    if (getOwnerId(project) !== adminId.toString()) {
      throw new Error('Not authorized to add members to this project');
    }

    const member = await this.userRepo.findByEmail(email);
    if (!member) throw new Error('User not found');

    return this.projectRepo.addMember(projectId, (member._id as unknown as string).toString());
  }

  public async removeMember(
    projectId: string,
    adminId: string,
    userId: string
  ): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    if (getOwnerId(project) !== adminId.toString()) {
      throw new Error('Not authorized to remove members from this project');
    }

    await this.projectRepo.removeMember(projectId, userId);
  }

  public async getProjectDetails(projectId: string): Promise<IProjectDocument | null> {
    return this.projectRepo.findById(projectId);
  }

  public async listProjects(userId: string): Promise<IProjectDocument[]> {
    return this.projectRepo.findAllByUserId(userId);
  }

  public async getProjectMembers(projectId: string): Promise<IProjectMemberDocument[]> {
    return this.projectRepo.getMembers(projectId);
  }

  public async deleteProject(projectId: string, adminId: string): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (getOwnerId(project) !== adminId.toString()) {
      throw new Error('Not authorized to delete this project');
    }
    await this.projectRepo.delete(projectId);
  }
}

export default new ProjectService();
