require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetAdminUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Remove all existing admin users
        await User.deleteMany({ isAdmin: true });
        console.log('Removed existing admin users');

        // Create a new admin user
        const adminUser = new User({
            username: 'admin_user',
            email: 'admin_user@bookverse.com',
            password: 'Admin@123',
            isAdmin: true
        });

        await adminUser.save();
        console.log('Created new admin user:');
        console.log('Username: admin');
        console.log('Email: admin@bookverse.com');
        console.log('Password: Admin@123');

        console.log('Admin reset complete!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetAdminUsers();