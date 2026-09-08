import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';
const BCRYPT_SALT_ROUNDS = 12;

// Command-line arguments: [email] [password] [fullName] [phone]
const args = process.argv.slice(2);

const adminData = {
  email: (args[0] || process.env.ADMIN_EMAIL || 'admin@foodbridge.org').toLowerCase().trim(),
  password: args[1] || process.env.ADMIN_PASSWORD || 'Admin@12345',
  fullName: args[2] || process.env.ADMIN_NAME || 'System Administrator',
  phone: args[3] || process.env.ADMIN_PHONE || '9876543210',
  role: 'admin',
  address: 'FoodBridge Headquarters, Administrative Block',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  isApproved: true,
  isActive: true,
  isEmailVerified: true
};

async function createAdmin() {
  console.log(' Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(` Connected to MongoDB at: ${MONGODB_URI}`);

    // Dynamically import User model
    const { default: User } = await import('../src/models/User.js');

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email });

    const hashedPassword = await bcrypt.hash(adminData.password, BCRYPT_SALT_ROUNDS);

    if (existingUser) {
      console.log(`\n User with email '${adminData.email}' already exists.`);
      console.log(` Updating user to Admin role with new password and approved status...`);

      existingUser.fullName = adminData.fullName || existingUser.fullName;
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.isApproved = true;
      existingUser.isActive = true;
      existingUser.phone = adminData.phone || existingUser.phone;
      existingUser.address = adminData.address || existingUser.address;
      existingUser.city = adminData.city || existingUser.city;
      existingUser.state = adminData.state || existingUser.state;
      existingUser.pincode = adminData.pincode || existingUser.pincode;

      await existingUser.save();
      console.log(' User updated successfully to Admin!\n');
    } else {
      console.log(`\n Creating new admin account for '${adminData.email}'...`);

      await User.create({
        ...adminData,
        password: hashedPassword
      });

      console.log(' Admin account created successfully!\n');
    }

    console.log('====================================================');
    console.log(' FoodBridge Admin Credentials:');
    console.log('----------------------------------------------------');
    console.log(`  Email:    ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log(`  Role:     admin`);
    console.log(`  Name:     ${adminData.fullName}`);
    console.log('====================================================');
    console.log('You can now log in at http://localhost:4200/login with these credentials.\n');

  } catch (error) {
    console.error(' Error creating/updating admin account:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log(' Disconnected from MongoDB.');
  }
}

createAdmin();
