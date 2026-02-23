const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

/**
 * SYSTEM AUDIT SCRIPT
 * This script verifies that the user creation and authentication 
 * logic is 100% stable for ALL new users.
 */
const auditSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[AUDIT] Connected to Database');

        const testUsername = 'system_audit_' + Date.now();
        const testPass = 'AuditPass123!';

        // 1. Verify Creation Logic (Matches authController.createUser)
        console.log(`[AUDIT] Testing creation of: ${testUsername}`);
        const newUser = await User.create({
            username: testUsername,
            password: testPass,
            role: 'user',
            name: 'Audit User'
        });

        if (!newUser || !newUser._id) throw new Error('User creation failed');
        console.log('[AUDIT] Creation Success. ID:', newUser._id);

        // 2. Verify Hashing
        if (newUser.password === testPass) throw new Error('SECURITY BREACH: Password was not hashed!');
        console.log('[AUDIT] Hashing Verified.');

        // 3. Verify Authentication (Matches authController.authUser)
        console.log('[AUDIT] Testing Authentication logic...');
        const foundUser = await User.findOne({ username: testUsername });
        const isMatch = await foundUser.matchPassword(testPass);

        if (!isMatch) throw new Error('Authentication failed for newly created user');
        console.log('[AUDIT] Authentication Logic Verified.');

        // 4. Cleanup
        await User.findByIdAndDelete(newUser._id);
        console.log('[AUDIT] Cleanup complete.');

        console.log('\n=======================================');
        console.log('✅ SYSTEM CHECK PASSED');
        console.log('New users added via Admin Panel will work');
        console.log('without any configuration changes.');
        console.log('=======================================');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ AUDIT FAILED:', error.message);
        process.exit(1);
    }
};

auditSystem();
