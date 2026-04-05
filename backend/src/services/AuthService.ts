import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/UserRepository';
import { IUserDocument } from '../models/User';
import { AuthResponse, JwtPayload } from '../types';

class AuthService {

  
  private readonly userRepo = UserRepository;

  public async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('User already exists');

    const passwordHash = await this.hashPassword(password);
    const user = await this.userRepo.save({ name, email, passwordHash, role } as Partial<IUserDocument>);

    return this.buildAuthResponse(user);
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );
  }

  private buildAuthResponse(user: IUserDocument): AuthResponse {
    return {
      _id: (user._id as unknown as string).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      token: this.generateToken((user._id as unknown as string).toString()),
    };
  }
}

export default new AuthService();
