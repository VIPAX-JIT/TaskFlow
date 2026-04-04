import { IUserDocument } from '../models/User';

export interface IUserRepository {
  findById(id: string): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;
  save(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  update(id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null>;
  delete(id: string): Promise<void>;
}
