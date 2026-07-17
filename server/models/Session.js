import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    userA: {
      type: String,
      required: true, // Anonymous Temp ID of user A
    },
    userB: {
      type: String,
      required: true, // Anonymous Temp ID of user B
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration on end
ChatSessionSchema.methods.completeSession = function () {
  this.status = 'completed';
  this.endedAt = new Date();
  this.durationSeconds = Math.round((this.endedAt - this.startedAt) / 1000);
  return this.save();
};

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

export default ChatSession;
