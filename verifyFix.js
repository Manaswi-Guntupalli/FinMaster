const mongoose = require('mongoose');
require('dotenv').config();

// Question model
const questionSchema = new mongoose.Schema({
    levelNumber: Number,
    question: String,
    options: [String],
    correctAnswer: Number,
    category: String,
    difficulty: String,
    explanation: String,
    points: Number,
    topic: String
});

const Question = mongoose.model('Question', questionSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finmaster')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // Test the FIXED query
        console.log('Testing FIXED aggregation query with levelNumber...');
        const questions = await Question.aggregate([
            { $match: { levelNumber: { $lte: 5 } } },
            { $sample: { size: 10 } }
        ]);
        
        console.log('✅ Found', questions.length, 'questions');
        
        if (questions.length > 0) {
            console.log('\n📝 Sample question:');
            console.log('  Question:', questions[0].question);
            console.log('  Options:', questions[0].options);
            console.log('  Category:', questions[0].category);
            console.log('  Level:', questions[0].levelNumber);
        }
        
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
