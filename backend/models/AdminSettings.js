import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSettingsSchema = new mongoose.Schema({
  passwordHash: {
    type: String,
    required: true
  }
});

// Helper method to compare password
adminSettingsSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
