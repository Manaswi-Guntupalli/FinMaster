# FinMaster - Financial Literacy Gamification App

## 🎮 Features

- User authentication (Login/Register)
- 10 progressive levels on financial topics
- Virtual currency system (starting balance: 1000)
- Interactive quizzes with instant feedback
- Coin splash animations & sound effects
- Progress tracking and achievements
- Mobile-responsive design
- Level unlocking system based on virtual balance

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```
MONGODB_URI=mongodb://localhost:27017/finmaster
JWT_SECRET=your_secret_key
PORT=3000
```

3. Seed the database with questions:

```bash
npm run seed
```

4. Start the server:

```bash
npm start
```

5. Open your browser and navigate to:

```
http://localhost:3000
```

## 🎯 Game Mechanics

- Start with 1000 virtual coins
- Complete levels to earn points and coins
- Correct answer: +10 points + coins
- Unlock new levels with enough balance
- Track your progress on the dashboard

## 🏆 Killer Features

- Real-time progress tracking
- Achievement badges system
- Streak counter for consecutive correct answers
- Leaderboard (coming soon)
- Daily challenges
- Personalized financial tips

## 📱 Mobile Responsive

Fully optimized for all screen sizes!

Enjoy learning finance with FinMaster! 🚀
