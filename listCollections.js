const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/finmaster')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Collections in database:');
        collections.forEach(col => {
            console.log('  -', col.name);
        });
        
        // Check each collection's count
        console.log('\n📊 Document counts:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`  - ${col.name}: ${count} documents`);
            
            // If it has documents and might be questions, show a sample
            if (count > 0 && (col.name.toLowerCase().includes('quest') || col.name.toLowerCase().includes('level'))) {
                const sample = await mongoose.connection.db.collection(col.name).findOne();
                console.log(`    Sample doc:`, JSON.stringify(sample, null, 2).substring(0, 200));
            }
        }
        
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
