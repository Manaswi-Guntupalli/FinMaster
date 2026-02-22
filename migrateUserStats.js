// Migration script to convert existing levelProgress data to completedLevelStats
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function migrateUserStats() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users to process\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      let needsSave = false;

      // Initialize completedLevelStats if it doesn't exist
      if (!user.completedLevelStats) {
        user.completedLevelStats = [];
        needsSave = true;
      }

      // Migrate data from levelProgress to completedLevelStats for completed levels
      if (user.levelProgress && user.levelProgress.length > 0) {
        for (const progress of user.levelProgress) {
          // Check if this level is completed
          if (user.completedLevels.includes(progress.levelNumber)) {
            // Check if we already have stats for this level
            const existingStats = user.completedLevelStats.find(
              cls => cls.levelNumber === progress.levelNumber
            );

            if (!existingStats) {
              // Calculate statistics
              const questionsAnswered = progress.questionsAnswered?.length || 0;
              const correctAnswers = progress.correctAnswers || 0;
              const accuracy = questionsAnswered > 0 
                ? (correctAnswers / questionsAnswered) * 100 
                : 0;

              // Add to completedLevelStats
              user.completedLevelStats.push({
                levelNumber: progress.levelNumber,
                questionsAnswered,
                correctAnswers,
                accuracy,
                pointsEarned: progress.pointsEarned || 0,
                coinsEarned: progress.coinsEarned || 0,
                completedAt: progress.lastUpdated || new Date(),
                attemptsCount: 1
              });

              console.log(`  ✅ Migrated Level ${progress.levelNumber} for user ${user.username}`);
              console.log(`     Questions: ${questionsAnswered}/15, Accuracy: ${accuracy.toFixed(1)}%`);
              
              needsSave = true;
              migratedCount++;
            }
          }
        }
      }

      // Save if changes were made
      if (needsSave) {
        await user.save();
        console.log(`  💾 Saved data for user: ${user.username}\n`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Migrated: ${migratedCount} level statistics`);
    console.log(`⏭️  Skipped: ${skippedCount} users (no migration needed)`);
    console.log(`👥 Total users processed: ${users.length}\n`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUserStats();
