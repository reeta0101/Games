import mongoose from 'mongoose';

const QuestionVoteSchema = new mongoose.Schema({
  questionId: {
    type: String,   // e.g. "dbms_easy_1"
    required: true,
  },
  subject: {
    type: String,   // e.g. "dbms"
    required: true,
  },
  difficulty: {
    type: String,   // "easy" | "medium" | "hard"
    default: 'unknown',
  },
  questionText: {
    type: String,   // first 120 chars of question for display
    default: '',
  },
  vote: {
    type: String,   // "up" | "down"
    enum: ['up', 'down'],
    required: true,
  },
  userIdentifier: {
    type: String,   // username or anonymous session id
    default: 'anonymous',
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate votes (same user+question)
QuestionVoteSchema.index({ questionId: 1, userIdentifier: 1 }, { unique: true });

export default mongoose.model('QuestionVote', QuestionVoteSchema);
