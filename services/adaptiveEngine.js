const DEFAULT_USER_RATING = 1000;

const DIFFICULTY_RATINGS = {
  easy: 900,
  medium: 1000,
  hard: 1125
};

const BOT_MODE_CONFIG = {
  easy: {
    accuracy: 0.6,
    minDelayMs: 8000,
    maxDelayMs: 12000,
    personality: 'steady'
  },
  medium: {
    accuracy: 0.75,
    minDelayMs: 5000,
    maxDelayMs: 8000,
    personality: 'sharp'
  },
  hard: {
    accuracy: 0.9,
    minDelayMs: 3000,
    maxDelayMs: 5000,
    personality: 'elite'
  },
  adaptive: {
    accuracy: 0.72,
    minDelayMs: 4500,
    maxDelayMs: 7500,
    personality: 'adaptive'
  }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sample(array, count) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy.slice(0, count);
}

function expectedScore(playerRating, questionRating) {
  return 1 / (1 + Math.pow(10, (questionRating - playerRating) / 400));
}

function getQuestionDifficultyRating(question) {
  if (!question) {
    return DIFFICULTY_RATINGS.medium;
  }

  return DIFFICULTY_RATINGS[question.difficulty] || DIFFICULTY_RATINGS.medium;
}

function deriveDifficultyFromRating(rating) {
  if (rating >= 1080) return 'hard';
  if (rating <= 940) return 'easy';
  return 'medium';
}

function deriveSkillBand(rating) {
  if (rating >= 1120) return 'advanced';
  if (rating >= 980) return 'balanced';
  return 'growing';
}

function deriveRatingFromTopicPerformance(topicPerformance) {
  if (!topicPerformance || !topicPerformance.totalAttempts) {
    return DEFAULT_USER_RATING;
  }

  const accuracy = topicPerformance.correctAnswers / topicPerformance.totalAttempts;
  const speedAdjustment = clamp(((30 - (topicPerformance.averageTimeSpent || 30)) / 30) * 80, -60, 60);
  return Math.round(clamp(DEFAULT_USER_RATING + ((accuracy - 0.5) * 320) + speedAdjustment, 760, 1320));
}

function getTopicEntry(user, topic, category) {
  if (!user.topicPerformance) {
    user.topicPerformance = [];
  }

  const existingIndex = user.topicPerformance.findIndex(tp => tp.topic === topic && tp.category === category);
  if (existingIndex >= 0) {
    return { entry: user.topicPerformance[existingIndex], index: existingIndex };
  }

  user.topicPerformance.push({
    topic,
    category,
    totalAttempts: 0,
    correctAnswers: 0,
    averageTimeSpent: 0,
    difficultyLevel: 'medium',
    skillRating: DEFAULT_USER_RATING,
    confidence: 0,
    lastAdaptiveDelta: 0,
    lastAttempted: new Date()
  });

  return {
    entry: user.topicPerformance[user.topicPerformance.length - 1],
    index: user.topicPerformance.length - 1
  };
}

function getOverallUserRating(user) {
  if (typeof user.overallSkillRating === 'number') {
    return user.overallSkillRating;
  }

  const ratedTopics = (user.topicPerformance || [])
    .filter(tp => tp.totalAttempts > 0)
    .map(tp => tp.skillRating || deriveRatingFromTopicPerformance(tp));

  if (!ratedTopics.length) {
    return DEFAULT_USER_RATING;
  }

  return Math.round(average(ratedTopics));
}

function buildAdaptiveRecommendation({ rating, isCorrect, timeSpent, question, topicEntry, remainingCounts = {}, consecutiveWrongAnswers = 0 }) {
  let targetRating = rating;
  const estimatedTime = question?.estimatedTime || 30;
  const currentDifficulty = question?.difficulty || 'medium';
  const accuracy = topicEntry.totalAttempts > 0
    ? (topicEntry.correctAnswers / topicEntry.totalAttempts) * 100
    : 50;

  if (isCorrect && timeSpent <= Math.max(estimatedTime - 8, 12)) {
    targetRating += 90;
  } else if (isCorrect) {
    targetRating += 45;
  } else if (timeSpent > estimatedTime) {
    targetRating -= 110;
  } else {
    targetRating -= 75;
  }

  if (accuracy >= 85) {
    targetRating += 35;
  } else if (accuracy <= 50) {
    targetRating -= 35;
  }

  const downgradeOnWrong = {
    hard: 'medium',
    medium: 'easy',
    easy: 'easy'
  };

  const upgradeOnCorrect = {
    easy: 'medium',
    medium: 'hard',
    hard: 'hard'
  };

  // Enforce deterministic one-step transitions:
  // correct -> step up once, wrong -> step down once.
  const suggestedDifficulty = isCorrect
    ? (upgradeOnCorrect[currentDifficulty] || 'medium')
    : (downgradeOnWrong[currentDifficulty] || 'easy');
  const fallbackOrder = {
    easy: ['easy', 'medium', 'hard'],
    medium: ['medium', 'easy', 'hard'],
    hard: ['hard', 'medium', 'easy']
  };

  const difficultyOrder = fallbackOrder[suggestedDifficulty].filter(difficulty => remainingCounts[difficulty] > 0);
  const finalDifficulty = difficultyOrder[0] || Object.keys(remainingCounts).find(difficulty => remainingCounts[difficulty] > 0) || 'medium';

  let reason = 'Keeping you in the learning zone.';
  if (isCorrect && finalDifficulty === 'hard') {
    reason = 'You are answering accurately, so FinMaster is increasing the challenge.';
  } else if (isCorrect && currentDifficulty === 'easy' && finalDifficulty === 'medium') {
    reason = 'Great answer. FinMaster is stepping you up from easy to medium.';
  } else if (isCorrect && currentDifficulty === 'medium' && finalDifficulty === 'hard') {
    reason = 'Strong momentum. FinMaster is stepping you up from medium to hard.';
  } else if (!isCorrect && finalDifficulty === 'easy') {
    reason = consecutiveWrongAnswers >= 2
      ? 'You missed twice in a row, so FinMaster moved down one more step to easy.'
      : 'FinMaster stepped down the next question difficulty to rebuild momentum.';
  } else if (!isCorrect && finalDifficulty === 'medium') {
    reason = 'FinMaster stepped down from hard to medium after the miss.';
  } else if (finalDifficulty === 'medium') {
    reason = 'FinMaster is keeping the next question balanced for steady progress.';
  }

  return {
    suggestedDifficulty: finalDifficulty,
    difficultyOrder: difficultyOrder.length ? difficultyOrder : fallbackOrder.medium,
    skillBand: deriveSkillBand(rating),
    skillRating: rating,
    reason,
    accuracy: Math.round(accuracy),
    pace: timeSpent <= estimatedTime ? 'fast' : 'steady'
  };
}

function updateUserAdaptiveProfile(user, question, isCorrect, timeSpent = 30) {
  const { entry: topicEntry } = getTopicEntry(user, question.topic, question.category);
  const previousRating = topicEntry.skillRating || deriveRatingFromTopicPerformance(topicEntry);
  const questionRating = getQuestionDifficultyRating(question);
  const attemptsBeforeAnswer = topicEntry.totalAttempts || 0;
  const baseK = attemptsBeforeAnswer < 10 ? 42 : attemptsBeforeAnswer < 25 ? 30 : 24;
  const speedAdjustment = clamp(((question.estimatedTime || 30) - timeSpent) / Math.max(question.estimatedTime || 30, 1), -0.2, 0.15);
  const actualScore = clamp((isCorrect ? 1 : 0) + speedAdjustment, 0, 1);
  const nextRating = Math.round(clamp(
    previousRating + (baseK * (actualScore - expectedScore(previousRating, questionRating))),
    760,
    1360
  ));

  topicEntry.skillRating = nextRating;
  topicEntry.confidence = Math.min((topicEntry.confidence || 0) + 1, 100);
  topicEntry.lastAdaptiveDelta = nextRating - previousRating;
  topicEntry.difficultyLevel = deriveDifficultyFromRating(nextRating);
  topicEntry.lastAttempted = new Date();

  const previousOverall = getOverallUserRating(user);
  user.overallSkillRating = Math.round(clamp(previousOverall + ((nextRating - previousRating) * 0.45), 780, 1340));
  user.lastAdaptiveRecommendation = {
    suggestedDifficulty: deriveDifficultyFromRating(nextRating),
    reason: isCorrect
      ? 'Recent answers show you are ready for a stronger challenge.'
      : 'Recent answers suggest reinforcing fundamentals first.',
    updatedAt: new Date()
  };

  return {
    topicRating: nextRating,
    overallRating: user.overallSkillRating,
    topicEntry
  };
}

function groupQuestionsByDifficulty(questions) {
  return questions.reduce((groups, question) => {
    const difficulty = question.difficulty || 'medium';
    if (!groups[difficulty]) {
      groups[difficulty] = [];
    }
    groups[difficulty].push(question);
    return groups;
  }, { easy: [], medium: [], hard: [] });
}

function buildAdaptiveQuestionSet(questions, user, totalCount = 10) {
  const overallRating = getOverallUserRating(user);
  const preferredDifficulty = deriveDifficultyFromRating(overallRating);
  const grouped = groupQuestionsByDifficulty(questions);
  const quotaByDifficulty = {
    easy: preferredDifficulty === 'easy' ? 4 : preferredDifficulty === 'medium' ? 3 : 2,
    medium: preferredDifficulty === 'medium' ? 4 : 3,
    hard: preferredDifficulty === 'hard' ? 4 : preferredDifficulty === 'medium' ? 3 : 2
  };

  const selection = [];
  Object.entries(quotaByDifficulty).forEach(([difficulty, quota]) => {
    selection.push(...sample(grouped[difficulty], quota));
  });

  if (selection.length < totalCount) {
    const selectedIds = new Set(selection.map(question => question._id.toString()));
    const remaining = questions.filter(question => !selectedIds.has(question._id.toString()));
    selection.push(...sample(remaining, totalCount - selection.length));
  }

  return sample(selection, Math.min(totalCount, selection.length));
}

function createBotProfile(user, mode = 'adaptive') {
  const requestedMode = BOT_MODE_CONFIG[mode] ? mode : 'adaptive';
  const baseProfile = BOT_MODE_CONFIG[requestedMode];
  const userRating = getOverallUserRating(user);

  let accuracyTarget = baseProfile.accuracy;
  let minDelayMs = baseProfile.minDelayMs;
  let maxDelayMs = baseProfile.maxDelayMs;

  if (requestedMode === 'adaptive') {
    const mappedAccuracy = clamp(0.58 + ((userRating - 850) / 700), 0.58, 0.88);
    accuracyTarget = mappedAccuracy;
    minDelayMs = clamp(8500 - ((userRating - 900) * 6), 3200, 9000);
    maxDelayMs = clamp(minDelayMs + 2600, 4600, 11500);
  }

  return {
    mode: requestedMode,
    displayName: requestedMode === 'adaptive' ? 'FinMaster Adaptive AI' : `FinMaster ${requestedMode[0].toUpperCase()}${requestedMode.slice(1)} AI`,
    accuracyTarget,
    minDelayMs: Math.round(minDelayMs),
    maxDelayMs: Math.round(maxDelayMs),
    personality: baseProfile.personality,
    catchupFactor: 0,
    lastReaction: 'Calibrating',
    lastStatus: 'Analyzing your pace'
  };
}

function randomWrongAnswer(correctAnswer, optionCount) {
  const incorrectOptions = [];
  for (let optionIndex = 0; optionIndex < optionCount; optionIndex += 1) {
    if (optionIndex !== correctAnswer) {
      incorrectOptions.push(optionIndex);
    }
  }
  return pickRandom(incorrectOptions);
}

function pickBotReaction(isCorrect, scoreGap) {
  if (isCorrect && scoreGap < 0) {
    return pickRandom(['Catching up', 'Locked in', 'Pressure on']);
  }
  if (isCorrect) {
    return pickRandom(['Clean answer', 'Still in it', 'Nice recovery']);
  }
  if (scoreGap > 0) {
    return pickRandom(['That slipped', 'Recomputing', 'Momentum shift']);
  }
  return pickRandom(['Need a comeback', 'Resetting', 'That was close']);
}

function simulateAdaptiveBotTurn({ game, question, user }) {
  const botProfile = game.botProfile || createBotProfile(user, 'adaptive');
  const playerAnswers = game.player1.answers || [];
  const recentAnswers = playerAnswers.slice(-5);
  const playerRecentAccuracy = recentAnswers.length
    ? average(recentAnswers.map(answer => answer.isCorrect ? 1 : 0))
    : clamp(0.55 + ((getOverallUserRating(user) - 900) / 800), 0.45, 0.9);
  const playerRecentSpeed = recentAnswers.length
    ? average(recentAnswers.map(answer => answer.timeTaken || 15))
    : 9;
  const botAnswers = game.player2.answers || [];
  const scoreGap = game.player1.score - game.player2.score;

  let accuracyTarget = botProfile.mode === 'adaptive'
    ? clamp(playerRecentAccuracy + 0.02, 0.55, 0.92)
    : botProfile.accuracyTarget;

  if (scoreGap > 250) {
    accuracyTarget = clamp(accuracyTarget + 0.08, 0.55, 0.95);
  } else if (scoreGap < -250) {
    accuracyTarget = clamp(accuracyTarget - 0.08, 0.4, 0.9);
  }

  const difficultyModifier = question.difficulty === 'hard'
    ? -0.08
    : question.difficulty === 'easy'
      ? 0.05
      : 0;

  let isCorrect = Math.random() < clamp(accuracyTarget + difficultyModifier, 0.35, 0.95);
  if (question.difficulty === 'easy' && Math.random() < 0.12) {
    isCorrect = false;
  }

  const minimumDelay = botProfile.mode === 'adaptive'
    ? clamp((playerRecentSpeed * 1000) * 0.9, 2800, 9000)
    : botProfile.minDelayMs;
  const maximumDelay = botProfile.mode === 'adaptive'
    ? clamp(minimumDelay + 2600, 4200, 11500)
    : botProfile.maxDelayMs;
  const delayMs = Math.round(minimumDelay + (Math.random() * (maximumDelay - minimumDelay)));
  const selectedAnswer = isCorrect
    ? question.correctAnswer
    : randomWrongAnswer(question.correctAnswer, question.optionCount || 4);

  let pointsEarned = 0;
  if (isCorrect) {
    const timeBonus = delayMs < 10000 ? 50 : 0;
    const comboMultiplier = 1 + ((game.player2.correctAnswers || 0) * 0.1);
    pointsEarned = Math.floor((100 * comboMultiplier) + timeBonus);
  }

  const reaction = pickBotReaction(isCorrect, scoreGap);
  const statusMessage = isCorrect
    ? `${reaction}. Targeting ${Math.round(accuracyTarget * 100)}% form.`
    : `${reaction}. Adaptive mode is recalibrating.`;

  const averageTime = botAnswers.length
    ? Math.round(((average(botAnswers.map(answer => answer.timeTaken || 0)) * botAnswers.length) + Math.round(delayMs / 1000)) / (botAnswers.length + 1))
    : Math.round(delayMs / 1000);

  return {
    selectedAnswer,
    isCorrect,
    timeTaken: Math.round(delayMs / 1000),
    delayMs,
    pointsEarned,
    reaction,
    statusMessage,
    targetAccuracy: Math.round(accuracyTarget * 100),
    averageTime
  };
}

function calculateAverageAnswerTime(player) {
  const answers = player.answers || [];
  if (!answers.length) {
    return 0;
  }

  return Math.round(average(answers.map(answer => answer.timeTaken || 0)));
}

module.exports = {
  DEFAULT_USER_RATING,
  DIFFICULTY_RATINGS,
  BOT_MODE_CONFIG,
  deriveDifficultyFromRating,
  deriveSkillBand,
  getQuestionDifficultyRating,
  getOverallUserRating,
  buildAdaptiveRecommendation,
  updateUserAdaptiveProfile,
  buildAdaptiveQuestionSet,
  createBotProfile,
  simulateAdaptiveBotTurn,
  calculateAverageAnswerTime,
  groupQuestionsByDifficulty
};