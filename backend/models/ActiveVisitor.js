import mongoose from 'mongoose';

const activeVisitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
});

// Index to automatically remove documents older than 10 minutes
activeVisitorSchema.index({ lastActive: 1 }, { expireAfterSeconds: 600 });

const ActiveVisitor = mongoose.model('ActiveVisitor', activeVisitorSchema);
export default ActiveVisitor;
