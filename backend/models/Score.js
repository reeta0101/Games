import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mode: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  questions: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for fast querying of top scores per mode/difficulty
scoreSchema.index({ mode: 1, difficulty: 1, score: -1 });
// Compound index to quickly find a user's high score for a specific game mode
scoreSchema.index({ name: 1, mode: 1, difficulty: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);
export default Score;
