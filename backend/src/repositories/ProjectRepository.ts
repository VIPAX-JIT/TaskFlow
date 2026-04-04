import Project, { IProjectDocument } from '../models/Project';
import ProjectMember, { IProjectMemberDocument } from '../models/ProjectMember';
import { IProjectRepository } from '../interfaces/IProjectRepository';

class ProjectRepository implements IProjectRepository {

  public async findById(id: string): Promise<IProjectDocument | null> {
    return Project.findById(id).populate('adminId', 'name email');
  }

  public async findByAdminId(adminId: string): Promise<IProjectDocument[]> {
    return Project.find({ adminId }).populate('adminId', 'name email');
  }

  public async findAllByUserId(userId: string): Promise<IProjectDocument[]> {
    const memberships = await ProjectMember.find({ userId }).select('projectId');
    const memberProjectIds = memberships.map((m) => m.projectId);

    return Project.find({
      $or: [{ adminId: userId }, { _id: { $in: memberProjectIds } }],
    }).populate('adminId', 'name email');
  }

  public async findAll(): Promise<IProjectDocument[]> {
    return Project.find().populate('adminId', 'name email');
  }

  public async save(projectData: Partial<IProjectDocument>): Promise<IProjectDocument> {
    return Project.create(projectData);
  }

  public async update(id: string, data: Partial<IProjectDocument>): Promise<IProjectDocument | null> {
    return Project.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('adminId', 'name email');
  }

  public async delete(id: string): Promise<void> {
    await ProjectMember.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);
  }

  public async addMember(projectId: string, userId: string): Promise<IProjectMemberDocument> {
    return ProjectMember.create({ projectId, userId });
  }

  public async removeMember(projectId: string, userId: string): Promise<IProjectMemberDocument | null> {
    return ProjectMember.findOneAndDelete({ projectId, userId });
  }

  public async getMembers(projectId: string): Promise<IProjectMemberDocument[]> {
    return ProjectMember.find({ projectId }).populate('userId', 'name email role');
  }
}

export default new ProjectRepository();
