import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProjectDocument extends Document {
  name: string;
  description?: string;
  adminId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  getDetails(): object;
}

const projectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Admin ID is required'],
      ref: 'User',
    },
  },
  { timestamps: true }
);

projectSchema.methods.getDetails = function (): object {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    adminId: this.adminId,
    createdAt: this.createdAt,
  };
};

const Project: Model<IProjectDocument> = mongoose.model<IProjectDocument>('Project', projectSchema);

export default Project;
