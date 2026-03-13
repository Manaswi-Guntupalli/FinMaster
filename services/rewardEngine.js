const DIFFICULTY_REWARDS = {
  easy: { points: 10, coins: 30 },
  medium: { points: 20, coins: 50 },
  hard: { points: 35, coins: 80 }
};

function getDifficultyReward(difficulty = 'medium') {
  return DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.medium;
}

module.exports = {
  DIFFICULTY_REWARDS,
  getDifficultyReward
};