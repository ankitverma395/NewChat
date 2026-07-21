import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  suggestion: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Feedback', FeedbackSchema);
