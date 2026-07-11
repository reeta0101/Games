import 'dotenv/config';
import mongoose from 'mongoose';

// Load URI from environment variable — never hardcode secrets in source files
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI is not set. Create a .env file from .env.example');
  process.exit(1);
}

const studentSchema = new mongoose.Schema({
  name: String,
  grade: String,
  age: Number
});
const Student = mongoose.model('Student', studentSchema);

// Standard user schema matching the app
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
});
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    console.log("Connecting to Azure Cosmos DB...");
    await mongoose.connect(uri);
    console.log("Connected successfully!\n");

    console.log("--- FETCHING STUDENTS ---");
    const students = await Student.find();
    console.log(students);

    console.log("\n--- FETCHING USERS ---");
    const users = await User.find();
    console.log(users);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from Azure.");
  }
}

run();
