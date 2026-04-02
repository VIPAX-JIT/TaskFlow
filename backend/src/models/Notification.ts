import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { NotificationType } from '../types';

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;

  markAsRead(): void;
  getDetails(): object;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,

      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.methods.markAsRead = function (): void {
  this.isRead = true;
};

notificationSchema.methods.getDetails = function (): object {
  return {
    _id: this._id,
    userId: this.userId,
    message: this.message,
    type: this.type,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
);

export default Notification;
