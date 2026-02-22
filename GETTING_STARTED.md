# FinMaster - Getting Started Guide

## 🎉 Congratulations! Your FinMaster App is Ready!

The server is now running at **http://localhost:3000**

## 📖 How to Use FinMaster

### 1. **Create an Account**

- Click "Register here" on the main page
- Enter a username, email, and password (min. 6 characters)
- You'll start with **1000 virtual coins**!

### 2. **Explore Your Dashboard**

- View your stats: Balance, Points, Streak, Completed Levels
- See your achievements
- Browse all 10 financial literacy levels

### 3. **Start Learning**

- Click on any **unlocked level** (🔓)
- Level 1 is free to start!
- Read the introduction to learn about the topic
- Click "Start Quiz" to begin

### 4. **Answer Questions**

- Each level has 15 questions
- Click your answer choice
- **Correct Answer**:
  - ✅ Get +10 points
  - 💰 Earn 50 coins
  - 🎵 Hear a cheer sound
  - See coins splash on screen!
- **Wrong Answer**:
  - ❌ See the correct answer
  - 📚 Read a detailed explanation
  - Learn and improve!

### 5. **Complete Levels**

- Answer all questions to complete a level
- Earn **bonus coins** for completion
- Unlock achievements
- Use your coins to unlock higher levels

### 6. **Track Your Progress**

- Build your streak by answering correctly
- Earn achievement badges
- Compete on the leaderboard (feature available)
- Master all 10 levels to become a Finance Master!

## 🎮 Game Mechanics

### Virtual Currency System

- **Starting Balance**: 1000 coins
- **Per Correct Answer**: +50 coins
- **Level Completion Reward**: 100-1000 coins (varies by level)
- **Level Unlock Cost**: Increases with difficulty

### Points System

- **Per Correct Answer**: +10 points
- Points track your overall knowledge
- Displayed on your profile and leaderboard

### Streak System

- Consecutive correct answers build your streak 🔥
- Streak resets on wrong answers
- **Achievement at 5-streak**: "Hot Streak"

### Achievements

- 🏆 **First Steps**: Complete Level 1
- 🔥 **Hot Streak**: 5 correct answers in a row
- 👑 **Finance Master**: Complete all 10 levels
- More achievements unlock as you progress!

## 📚 The 10 Levels

1. **💵 Money Basics** (Beginner) - Free
2. **📊 Budgeting Fundamentals** (Beginner) - 200 coins
3. **🏦 Saving Strategies** (Beginner) - 400 coins
4. **💳 Understanding Credit** (Intermediate) - 600 coins
5. **📈 Investment Basics** (Intermediate) - 800 coins
6. **🛡️ Insurance & Risk** (Intermediate) - 1000 coins
7. **🧾 Tax Essentials** (Intermediate) - 1200 coins
8. **🌴 Retirement Planning** (Advanced) - 1500 coins
9. **🏠 Real Estate** (Advanced) - 1800 coins
10. **👑 Wealth Building** (Advanced) - 2000 coins

## 🔥 Killer Features

### ✨ Visual Features

- Smooth animations and transitions
- Coin splash effects on correct answers
- Progress bars and visual feedback
- Achievement pop-ups
- Mobile-responsive design

### 🎵 Audio Features

- Cheer sounds for correct answers
- Error sounds for mistakes
- Coin collection sounds

### 📊 Tracking Features

- Real-time progress tracking
- Detailed statistics dashboard
- Achievement system
- Streak counter

### 🎯 Learning Features

- Detailed explanations for all answers
- Progressive difficulty system
- Topic-based learning path
- Comprehensive financial literacy coverage

## 💻 Technical Details

### Database

- All questions, answers, and explanations stored in MongoDB
- User progress and achievements saved
- Secure authentication with JWT

### Mobile Responsive

- Works perfectly on phones, tablets, and desktops
- Touch-friendly interface
- Optimized layouts for all screen sizes

## 🚀 Tips for Success

1. **Start with Level 1** - Build your foundation
2. **Read Explanations** - Learn from mistakes
3. **Build Your Streak** - Stay focused for bonus achievements
4. **Complete Levels** - Earn big rewards
5. **Manage Your Coins** - Plan which levels to unlock

## 🛠️ For Developers

### Running the App

```bash
# Install dependencies
npm install

# Seed the database
npm run seed

# Start the server
npm start
```

### File Structure

```
FinMaster/
├── models/           # MongoDB models
├── routes/           # API routes
├── middleware/       # Authentication middleware
├── public/           # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js         # Express server
├── seedDatabase.js   # Database seeding
├── .env             # Environment variables
└── package.json     # Dependencies
```

### API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - User login
- `GET /api/game/levels` - Get all levels
- `GET /api/game/levels/:id` - Get level details
- `POST /api/game/submit-answer` - Submit answer
- `POST /api/game/complete-level` - Complete level
- `GET /api/user/profile` - Get user profile
- `GET /api/user/stats` - Get user statistics

## 🎓 Ready to Master Finance?

1. Open http://localhost:3000 in your browser
2. Create your account
3. Start with Level 1: Money Basics
4. Answer questions correctly to earn coins and points
5. Unlock new levels and master financial literacy!

**Good luck on your journey to financial mastery!** 💰🚀

---

## Support

If you encounter any issues:

1. Make sure MongoDB is running
2. Check that port 3000 is available
3. Verify `.env` file has correct settings
4. Run `npm run seed` if questions aren't loading

**Enjoy FinMaster!** 🎉
