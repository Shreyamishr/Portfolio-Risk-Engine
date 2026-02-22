const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log("Checking connection for:", uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log("✅ AUTH SUCCESS: Connection established!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ AUTH FAILED:", err.message);
        if (err.message.includes('bad auth')) {
            console.log("\nTIP: Please go to MongoDB Atlas -> Database Access and make sure the user 'shreyamishraj61_db_user' exists with password 'shreya01'.");
            console.log("Also ensure you clicked 'Add User' or 'Update User' button.");
        }
        process.exit(1);
    });
