import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProjectMemberDocument extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  joinedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMemberDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectMember: Model<IProjectMemberDocument> = mongoose.model<IProjectMemberDocument>(
  'ProjectMember',
  projectMemberSchema
);

export default ProjectMember;
