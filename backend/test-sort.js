import 'dotenv/config';
import mongoose from 'mongoose';

// Load URI from environment variable — never hardcode secrets in source files
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI is not set. Create a .env file from .env.example');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
});
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    console.log("Connecting...");
    await mongoose.connect(uri);
    console.log("Connected!");

    console.log("Running User.find({}).sort({ createdAt: -1 })...");
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log("Success! Users found:", users.length);
  } catch (err) {
    console.error("\nERROR RUNNING QUERY:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
