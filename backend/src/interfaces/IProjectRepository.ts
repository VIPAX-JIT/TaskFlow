import { IProjectDocument } from '../models/Project';

export interface IProjectRepository {
  findById(id: string): Promise<IProjectDocument | null>;
  findByAdminId(adminId: string): Promise<IProjectDocument[]>;
  findAll(): Promise<IProjectDocument[]>;
  save(projectData: Partial<IProjectDocument>): Promise<IProjectDocument>;
  update(id: string, data: Partial<IProjectDocument>): Promise<IProjectDocument | null>;
  delete(id: string): Promise<void>;
}
