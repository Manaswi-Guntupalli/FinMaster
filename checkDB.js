const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/finmaster')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // Check questions count
        const questionsCount = await mongoose.connection.db.collection('questions').countDocuments();
        console.log(`📊 Questions in database: ${questionsCount}`);
        
        const levelsCount = await mongoose.connection.db.collection('levels').countDocuments();
        console.log(`📊 Levels in database: ${levelsCount}`);
        
        const usersCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`📊 Users in database: ${usersCount}`);
        
        await mongoose.disconnect();
        console.log('✅ Disconnected');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
