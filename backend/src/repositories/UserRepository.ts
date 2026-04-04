import User, { IUserDocument } from '../models/User';
import { IUserRepository } from '../interfaces/IUserRepository';

class UserRepository implements IUserRepository {

  public async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('-passwordHash');
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email });
  }

  public async findAll(): Promise<IUserDocument[]> {
    return User.find().select('-passwordHash');
  }

  public async save(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    return User.create(userData);
  }

  public async update(id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-passwordHash');
  }

  public async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }
}

export default new UserRepository();
