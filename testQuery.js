const mongoose = require('mongoose');
require('dotenv').config();

// Question model
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number,
    category: String,
    difficulty: String,
    level: Number,
    hint: String,
    explanation: String
});

const Question = mongoose.model('Question', questionSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finmaster')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        // Test the exact same query used in the route
        console.log('Testing aggregation query...');
        const questions = await Question.aggregate([
            { $match: { level: { $lte: 5 } } },
            { $sample: { size: 10 } }
        ]);
        
        console.log('Found', questions.length, 'questions');
        
        if (questions.length > 0) {
            console.log('First question:', questions[0].question);
        }
        
        // Also test a simple find
        console.log('\nTesting simple find...');
        const simpleFind = await Question.find({ level: { $lte: 5 } }).limit(5);
        console.log('Simple find returned:', simpleFind.length, 'questions');
        
        if (simpleFind.length > 0) {
            console.log('First question from find:', simpleFind[0].question);
        }
        
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
