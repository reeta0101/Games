import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Feedback', FeedbackSchema);
