const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const Question = require('./models/Question');

const levels = [
  {
    levelNumber: 1,
    title: "Money Basics",
    description: "Learn the fundamentals of money and its role in society",
    introduction: "Welcome to your financial journey! In this level, you'll learn what money is, why it matters, and how it works in our daily lives. Understanding these basics is your first step toward financial mastery!",
    unlockCost: 0,
    rewardCoins: 100,
    icon: "💵",
    difficulty: "Beginner"
  },
  {
    levelNumber: 2,
    title: "Budgeting Fundamentals",
    description: "Master the art of creating and maintaining a budget",
    introduction: "A budget is your financial roadmap! Learn how to track income, manage expenses, and make your money work for you. This is the foundation of financial success!",
    unlockCost: 200,
    rewardCoins: 150,
    icon: "📊",
    difficulty: "Beginner"
  },
  {
    levelNumber: 3,
    title: "Saving Strategies",
    description: "Discover effective ways to save money",
    introduction: "Saving isn't about having money left over—it's about paying yourself first! Learn proven strategies to build your savings and secure your financial future.",
    unlockCost: 400,
    rewardCoins: 200,
    icon: "🏦",
    difficulty: "Beginner"
  },
  {
    levelNumber: 4,
    title: "Understanding Credit",
    description: "Learn how credit works and how to use it wisely",
    introduction: "Credit can be a powerful tool or a dangerous trap. Understand credit scores, loans, and how to build a strong credit history that opens doors to opportunities.",
    unlockCost: 600,
    rewardCoins: 250,
    icon: "💳",
    difficulty: "Intermediate"
  },
  {
    levelNumber: 5,
    title: "Investment Basics",
    description: "Enter the world of investing and growing wealth",
    introduction: "Make your money work for you! Learn about stocks, bonds, and other investment vehicles that can help you build wealth over time.",
    unlockCost: 800,
    rewardCoins: 300,
    icon: "📈",
    difficulty: "Intermediate"
  },
  {
    levelNumber: 6,
    title: "Insurance & Risk Management",
    description: "Protect yourself from financial disasters",
    introduction: "Insurance isn't exciting, but it's essential! Learn how to protect yourself, your family, and your assets from unexpected events.",
    unlockCost: 1000,
    rewardCoins: 350,
    icon: "🛡️",
    difficulty: "Intermediate"
  },
  {
    levelNumber: 7,
    title: "Tax Essentials",
    description: "Understand taxes and legal ways to minimize them",
    introduction: "Taxes are inevitable, but paying more than necessary isn't! Learn about different types of taxes and smart strategies to keep more of your hard-earned money.",
    unlockCost: 1200,
    rewardCoins: 400,
    icon: "🧾",
    difficulty: "Intermediate"
  },
  {
    levelNumber: 8,
    title: "Retirement Planning",
    description: "Plan for a comfortable and secure retirement",
    introduction: "Retirement might seem far away, but starting early is the secret to a comfortable future. Learn how to build a retirement plan that works for you!",
    unlockCost: 1500,
    rewardCoins: 450,
    icon: "🌴",
    difficulty: "Advanced"
  },
  {
    levelNumber: 9,
    title: "Real Estate & Property",
    description: "Explore real estate as an investment and home ownership",
    introduction: "Real estate can be one of your biggest assets or expenses. Learn how to make smart decisions about buying, renting, and investing in property.",
    unlockCost: 1800,
    rewardCoins: 500,
    icon: "🏠",
    difficulty: "Advanced"
  },
  {
    levelNumber: 10,
    title: "Advanced Wealth Building",
    description: "Master advanced strategies for building and preserving wealth",
    introduction: "Congratulations on reaching the final level! Here you'll learn advanced strategies used by the wealthy to build, grow, and preserve their fortunes across generations.",
    unlockCost: 2000,
    rewardCoins: 1000,
    icon: "👑",
    difficulty: "Advanced"
  }
];

const questions = [
  // Level 1: Money Basics
  {
    levelNumber: 1,
    question: "What is the primary function of money in an economy?",
    options: ["To look pretty in your wallet", "Medium of exchange for goods and services", "To create debt", "Only for saving"],
    correctAnswer: 1,
    explanation: "Money's main purpose is to serve as a medium of exchange, making transactions easier than bartering. It also serves as a store of value and unit of account.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What does 'inflation' mean?",
    options: ["Money getting bigger", "Prices generally increasing over time", "Interest rates going down", "Your savings growing"],
    correctAnswer: 1,
    explanation: "Inflation is when the general level of prices for goods and services rises, causing your purchasing power to decrease over time.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "Which of these is an example of 'needs' rather than 'wants'?",
    options: ["Designer shoes", "Video game console", "Groceries for meals", "Luxury vacation"],
    correctAnswer: 2,
    explanation: "Needs are essentials required for survival like food, water, shelter, and basic clothing. Wants are things that enhance our lifestyle but aren't necessary.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What is compound interest?",
    options: ["Simple interest paid twice", "Interest earned on both principal and previous interest", "Interest that is really complicated", "Interest only on the original amount"],
    correctAnswer: 1,
    explanation: "Compound interest is interest calculated on the initial principal AND the accumulated interest from previous periods. It's often called 'interest on interest' and is powerful for growing wealth!",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What percentage of your income should ideally go to savings?",
    options: ["0-5%", "At least 10-20%", "50%", "Everything except $100"],
    correctAnswer: 1,
    explanation: "Financial experts typically recommend saving at least 10-20% of your income. The exact amount depends on your goals, but starting with something is better than nothing!",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is an emergency fund?",
    options: ["Money for fun emergencies", "Savings set aside for unexpected expenses", "Credit card for emergencies", "Money borrowed from family"],
    correctAnswer: 1,
    explanation: "An emergency fund is money saved specifically for unexpected expenses like medical bills, car repairs, or job loss. It's your financial safety net!",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "How many months of expenses should an emergency fund cover?",
    options: ["1 month", "3-6 months", "1 week", "10 years"],
    correctAnswer: 1,
    explanation: "Most financial advisors recommend having 3-6 months of living expenses in your emergency fund. This provides adequate protection for most emergencies.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is the main difference between debit and credit cards?",
    options: ["Color of the card", "Debit uses your money, credit borrows money", "No difference", "Debit is only for ATMs"],
    correctAnswer: 1,
    explanation: "A debit card withdraws money directly from your bank account, while a credit card borrows money that you must pay back, usually with interest if not paid in full.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What does APR stand for?",
    options: ["Annual Percentage Rate", "Average Price Range", "Automatic Payment Reminder", "April"],
    correctAnswer: 0,
    explanation: "APR stands for Annual Percentage Rate. It represents the yearly interest rate charged on borrowed money or earned on investments.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "Which payment method typically offers the best fraud protection?",
    options: ["Cash", "Check", "Credit card", "Wire transfer"],
    correctAnswer: 2,
    explanation: "Credit cards typically offer the best fraud protection with zero liability policies and easier dispute processes compared to other payment methods.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is 'opportunity cost'?",
    options: ["The cost of opportunities", "What you give up when choosing one option over another", "The price of a lottery ticket", "Interest you could earn"],
    correctAnswer: 1,
    explanation: "Opportunity cost is the value of the next best alternative you give up when making a choice. Every decision has an opportunity cost!",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is net income?",
    options: ["Income from the internet", "Total income before taxes", "Income after taxes and deductions", "Only income from your job"],
    correctAnswer: 2,
    explanation: "Net income, or 'take-home pay,' is what you receive after taxes and other deductions are removed from your gross income. This is what you actually have to spend or save.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What does it mean to 'live within your means'?",
    options: ["Living in a small house", "Spending less than you earn", "Being mean to save money", "Only buying cheap things"],
    correctAnswer: 1,
    explanation: "Living within your means simply means spending less money than you earn, allowing you to save and avoid debt. It's a fundamental principle of financial health!",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "Which of these best describes a 'financial goal'?",
    options: ["Hoping to win the lottery", "A specific target you plan and save for", "Dreaming about being rich", "Spending all your money"],
    correctAnswer: 1,
    explanation: "A financial goal is a specific, measurable target you work toward through planning and consistent action. Examples include saving for a house or paying off debt.",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What is diversification?",
    options: ["Making things diverse", "Spreading investments across different assets", "Investing in diversity", "Buying many of the same stock"],
    correctAnswer: 1,
    explanation: "Diversification means spreading your investments across different asset types to reduce risk. Don't put all your eggs in one basket!",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is a budget?",
    options: ["A wish list", "A plan for spending and saving money", "A restriction on fun", "A bank account"],
    correctAnswer: 1,
    explanation: "A budget is a financial plan that helps you track income and expenses, ensuring you spend wisely and save for your goals. It's not about restriction, it's about freedom!",
    difficulty: "easy"
  },
  {
    levelNumber: 1,
    question: "What does 'liquidity' mean?",
    options: ["How wet something is", "How quickly an asset can be converted to cash", "Amount of liquid assets", "Bank account balance"],
    correctAnswer: 1,
    explanation: "Liquidity refers to how easily and quickly an asset can be converted into cash without significant loss in value. Cash is the most liquid asset.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is the time value of money?",
    options: ["How long money lasts", "Money available today is worth more than the same amount in the future", "Time spent earning money", "Money saved over time"],
    correctAnswer: 1,
    explanation: "The time value of money principle states that money available today is worth more than the same amount in the future due to its earning potential through interest and investment returns.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "Which is an example of passive income?",
    options: ["Salary from your job", "Rental income from property", "Wages from overtime", "Commission from sales"],
    correctAnswer: 1,
    explanation: "Passive income is money earned with minimal active effort, such as rental income, dividends, or royalties. Active income requires ongoing work like wages or salaries.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is a financial liability?",
    options: ["Something you own", "Something you owe", "Your income", "Your savings"],
    correctAnswer: 1,
    explanation: "A liability is a financial obligation or debt you owe to someone else, such as loans, credit card debt, or mortgages. Assets are what you own; liabilities are what you owe.",
    difficulty: "medium"
  },
  {
    levelNumber: 1,
    question: "What is the difference between gross income and net income?",
    options: ["They are the same", "Gross is before taxes, net is after taxes and deductions", "Gross is yearly, net is monthly", "Net includes bonuses"],
    correctAnswer: 1,
    explanation: "Gross income is your total earnings before any deductions. Net income is what's left after taxes, insurance, retirement contributions, and other deductions are taken out - your 'take-home pay'.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is a credit score used for?",
    options: ["To determine how much credit you've used", "To evaluate your creditworthiness for loans and credit", "To calculate your income", "To track your spending"],
    correctAnswer: 1,
    explanation: "A credit score is a numerical representation of your creditworthiness. Lenders use it to decide whether to approve you for credit and what interest rate to charge. Higher scores mean better loan terms!",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is the Rule of 72?",
    options: ["A budgeting rule", "A formula to estimate how long it takes to double your money", "Maximum age for retirement", "Tax calculation method"],
    correctAnswer: 1,
    explanation: "The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Divide 72 by the annual interest rate. For example, at 8% interest, it takes about 9 years (72÷8=9) to double your money.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is the primary risk of keeping all your money in cash?",
    options: ["It might get stolen", "It loses purchasing power due to inflation", "Banks might close", "It's too liquid"],
    correctAnswer: 1,
    explanation: "While cash is safe from market volatility, it loses purchasing power over time due to inflation. Money sitting in cash doesn't grow to keep pace with rising prices, effectively making you poorer over time.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What does ROI stand for?",
    options: ["Rate of Inflation", "Return on Investment", "Risk of Income", "Retirement Obligation Index"],
    correctAnswer: 1,
    explanation: "ROI stands for Return on Investment. It measures the gain or loss generated on an investment relative to the amount invested, usually expressed as a percentage. It helps evaluate investment efficiency.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is a bull market?",
    options: ["A market that sells bulls", "A market where prices are rising and investor confidence is high", "A dangerous market", "A market for livestock"],
    correctAnswer: 1,
    explanation: "A bull market is a financial market condition where prices are rising or are expected to rise, typically accompanied by optimism and investor confidence. The opposite is a bear market, where prices fall.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is an asset?",
    options: ["Money you owe", "Something valuable you own that can provide future benefit", "Your monthly expenses", "Your credit card"],
    correctAnswer: 1,
    explanation: "An asset is anything of value that you own, such as cash, investments, real estate, or even valuable skills. Assets can generate income or appreciate in value over time.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is the difference between fixed and variable expenses?",
    options: ["Fixed costs more", "Fixed stays the same, variable changes monthly", "Variable is optional", "They mean the same thing"],
    correctAnswer: 1,
    explanation: "Fixed expenses remain constant each month (rent, insurance, loan payments), while variable expenses change based on usage or choices (groceries, utilities, entertainment). Both are important to track in your budget.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "Why is financial literacy important?",
    options: ["To impress people", "To make informed decisions about money and build wealth", "To become an accountant", "To avoid all risk"],
    correctAnswer: 1,
    explanation: "Financial literacy empowers you to make informed decisions about earning, spending, saving, and investing money. It's essential for building wealth, avoiding debt traps, and achieving financial independence.",
    difficulty: "hard"
  },
  {
    levelNumber: 1,
    question: "What is the purpose of a financial cushion?",
    options: ["To sit comfortably", "To provide funds for unexpected events or emergencies", "To increase spending", "To impress others"],
    correctAnswer: 1,
    explanation: "A financial cushion (emergency fund) provides a safety net for unexpected expenses or income loss, preventing you from going into debt during tough times. It creates financial security and peace of mind.",
    difficulty: "hard"
  },

  // Level 2: Budgeting Fundamentals
  {
    levelNumber: 2,
    question: "What is the 50/30/20 budget rule?",
    options: ["50% needs, 30% wants, 20% savings", "50% savings, 30% needs, 20% wants", "50% fun, 30% food, 20% rent", "Random numbers"],
    correctAnswer: 0,
    explanation: "The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, and 20% to savings and debt repayment. It's a simple framework for balanced budgeting!",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "Which is a 'fixed expense'?",
    options: ["Dining out", "Entertainment", "Rent payment", "Shopping"],
    correctAnswer: 2,
    explanation: "Fixed expenses are regular costs that stay the same each month, like rent, car payments, or insurance. They're predictable and easier to budget for!",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "What is 'zero-based budgeting'?",
    options: ["Having zero dollars", "Assigning every dollar a purpose", "Spending nothing", "Starting from scratch each year"],
    correctAnswer: 1,
    explanation: "Zero-based budgeting means giving every dollar of income a specific job until you reach zero. Income minus expenses equals zero, ensuring you account for all money!",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "How often should you review your budget?",
    options: ["Never, once is enough", "Every 10 years", "Monthly or when circumstances change", "Only when broke"],
    correctAnswer: 2,
    explanation: "You should review your budget monthly and adjust it when your income, expenses, or goals change. Regular reviews keep you on track!",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "What's the first step in creating a budget?",
    options: ["Cut all spending", "Track your income and expenses", "Buy budget software", "Feel guilty about spending"],
    correctAnswer: 1,
    explanation: "The first step is understanding where you are now by tracking all income and expenses. You can't improve what you don't measure!",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "Which expense category is often underestimated?",
    options: ["Rent", "Small daily purchases", "Phone bill", "Car payment"],
    correctAnswer: 1,
    explanation: "Small daily purchases like coffee, snacks, and small online purchases add up significantly but are often forgotten when budgeting. Track these 'budget leaks'!",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What is a 'sinking fund'?",
    options: ["Money going down the drain", "Savings gradually built for expected future expenses", "An emergency fund", "Retirement savings"],
    correctAnswer: 1,
    explanation: "A sinking fund is money you save gradually for expected future expenses like car repairs, holidays, or insurance premiums. It prevents these from becoming 'emergencies'!",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What should you do if your expenses exceed your income?",
    options: ["Ignore it", "Use credit cards", "Reduce expenses or increase income", "Stop budgeting"],
    correctAnswer: 2,
    explanation: "If spending exceeds income, you must either cut expenses or find ways to earn more. Living beyond your means leads to debt and financial stress.",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "Which budgeting method uses envelopes for different spending categories?",
    options: ["Digital budgeting", "Envelope system", "Spreadsheet method", "App-based budgeting"],
    correctAnswer: 1,
    explanation: "The envelope system uses physical envelopes with cash for different spending categories. When an envelope is empty, you stop spending in that category!",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "What percentage of Americans live paycheck to paycheck?",
    options: ["Less than 10%", "About 25%", "Over 60%", "Everyone"],
    correctAnswer: 2,
    explanation: "Studies show over 60% of Americans live paycheck to paycheck, highlighting the importance of budgeting and financial planning for everyone.",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What is 'lifestyle inflation'?",
    options: ["Inflation affecting lifestyle", "Increasing spending as income grows", "Rising cost of living", "Economic inflation"],
    correctAnswer: 1,
    explanation: "Lifestyle inflation (or lifestyle creep) is when spending increases as income grows, preventing wealth building. Combat this by maintaining your lifestyle as income rises!",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "Which tool is most commonly used for budgeting?",
    options: ["Crystal ball", "Spreadsheet or budgeting app", "Guessing", "Fortune cookie"],
    correctAnswer: 1,
    explanation: "Most people use spreadsheets or budgeting apps to track their finances. These tools help organize income and expenses and spot trends.",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "What is a 'budget variance'?",
    options: ["Different types of budgets", "Difference between budgeted and actual amounts", "Budget mistakes", "Variety in spending"],
    correctAnswer: 1,
    explanation: "Budget variance is the difference between what you planned to spend/earn and what actually happened. Analyzing variances helps improve future budgets!",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "Before major purchases, what should you do?",
    options: ["Buy immediately", "Wait 24-48 hours and consider if it fits your budget", "Ask your friends", "Buy on credit"],
    correctAnswer: 1,
    explanation: "The 24-48 hour rule helps prevent impulse purchases. Waiting lets you evaluate if the purchase aligns with your budget and goals.",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "What should be your first priority when you receive income?",
    options: ["Shopping", "Paying yourself (savings)", "Entertainment", "Dining out"],
    correctAnswer: 1,
    explanation: "'Pay yourself first' means prioritizing savings before other expenses. This ensures you're building wealth and not just spending what's left over.",
    difficulty: "easy"
  },
  {
    levelNumber: 2,
    question: "If your monthly expenses exceed your income, what budgeting strategy should you use?",
    options: ["Zero-based budgeting", "Ignore it", "Use credit cards", "Stop budgeting"],
    correctAnswer: 0,
    explanation: "Zero-based budgeting assigns every dollar a purpose, helping you find areas to cut. This ensures income minus expenses equals zero, forcing you to prioritize spending.",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What percentage of income do experts recommend saving for emergencies?",
    options: ["0-5%", "10-20%", "30-40%", "50-60%"],
    correctAnswer: 1,
    explanation: "Financial experts typically recommend saving 10-20% of your income. This builds a strong financial foundation while still allowing for other goals and expenses.",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "Which budgeting method gives every dollar a specific job?",
    options: ["Envelope system", "Zero-based budgeting", "Percentage budgeting", "Pay yourself first"],
    correctAnswer: 1,
    explanation: "Zero-based budgeting assigns every single dollar to a specific category (expenses, savings, debt) until income minus expenses equals zero. Nothing is left unallocated.",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What should you do with variable expenses in your budget?",
    options: ["Ignore them", "Estimate based on past averages", "Max them out", "Only track them yearly"],
    correctAnswer: 1,
    explanation: "Variable expenses (like utilities or groceries) fluctuate monthly. Use past spending data to estimate realistic averages, then adjust as needed.",
    difficulty: "medium"
  },
  {
    levelNumber: 2,
    question: "What is a sinking fund in budgeting?",
    options: ["A fund that loses value", "Money saved gradually for expected future expenses", "An emergency fund", "A retirement account"],
    correctAnswer: 1,
    explanation: "A sinking fund is money set aside regularly for anticipated expenses like car maintenance, annual insurance, or holiday gifts. It prevents these from feeling like emergencies.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "What is the primary weakness of the 50/30/20 budget rule?",
    options: ["Too complex", "Doesn't account for high cost-of-living areas", "Requires too much tracking", "Not flexible enough"],
    correctAnswer: 1,
    explanation: "The 50/30/20 rule (50% needs, 30% wants, 20% savings) may not work in high cost-of-living areas where needs exceed 50% of income. Income level matters.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "In zero-based budgeting, what does 'Income - Expenses = 0' actually mean?",
    options: ["You have no money left", "Every dollar is assigned a purpose", "You break even", "You're in debt"],
    correctAnswer: 1,
    explanation: "Zero-based budgeting doesn't mean $0 in your account! It means every dollar of income has been allocated to expenses, savings, or debt before the month begins.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "Which budget category is often overlooked but essential?",
    options: ["Entertainment", "Clothing", "Irregular expenses", "Subscriptions"],
    correctAnswer: 2,
    explanation: "Irregular expenses (car registration, annual insurance, gifts, home repairs) are easy to forget but can derail a budget. Track and plan for them with sinking funds.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "What is 'lifestyle inflation' and how does it affect budgeting?",
    options: ["Prices going up", "Spending more as income increases", "Economy inflation", "Housing costs rising"],
    correctAnswer: 1,
    explanation: "Lifestyle inflation means increasing spending when income rises. It prevents wealth building. Combat it by maintaining current spending levels and saving/investing raises.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "How often should you review and adjust your budget?",
    options: ["Never, set it once", "Yearly", "Monthly", "Every 5 years"],
    correctAnswer: 2,
    explanation: "Monthly budget reviews are ideal. Life changes constantly—income, expenses, goals. Regular reviews ensure your budget stays realistic and aligned with current circumstances.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "What is the 'budget creep' phenomenon?",
    options: ["Inflation affecting purchasing power", "Gradually spending more in flexible categories", "Unexpected expenses", "Income reduction"],
    correctAnswer: 1,
    explanation: "Budget creep is when spending gradually increases in flexible categories (groceries, dining out) without conscious decisions. Combat with regular tracking and category limits.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "Which budgeting approach works best for irregular income (freelancers)?",
    options: ["50/30/20 rule", "Base budget on lowest monthly income", "Spend everything each month", "Fixed percentages"],
    correctAnswer: 1,
    explanation: "Freelancers should budget based on their lowest typical monthly income. In higher-income months, extra goes to savings/debt. This prevents overspending in lean months.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "What is the anti-budget approach?",
    options: ["Not budgeting at all", "Track savings first, spend the rest freely", "Only tracking expenses", "Reverse budgeting"],
    correctAnswer: 1,
    explanation: "The anti-budget (or reverse budget) automates savings/investments first. Whatever remains can be spent guilt-free. Simpler than detailed tracking, but requires discipline.",
    difficulty: "hard"
  },
  {
    levelNumber: 2,
    question: "How should windfalls (bonuses, tax refunds) be treated in a budget?",
    options: ["Spend immediately on wants", "Split strategically: savings, debt, and some fun", "100% to savings", "Ignore them"],
    correctAnswer: 1,
    explanation: "The balanced approach: allocate a percentage to high-priority financial goals (debt, savings), but also allow some for enjoyment. Typically 70-80% to goals, 20-30% discretionary.",
    difficulty: "hard"
  },

  // Level 3: Saving Strategies
  {
    levelNumber: 3,
    question: "What does 'paying yourself first' mean?",
    options: ["Buying things for yourself", "Saving money before paying expenses", "Paying yourself a salary", "Getting a paycheck"],
    correctAnswer: 1,
    explanation: "Paying yourself first means automatically saving or investing money as soon as you receive income, before spending on anything else. This ensures savings actually happen!",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is a high-yield savings account?",
    options: ["A risky investment", "A savings account with higher interest rates", "A checking account", "A credit card"],
    correctAnswer: 1,
    explanation: "High-yield savings accounts offer significantly higher interest rates than traditional savings accounts, helping your money grow faster while remaining safe and accessible.",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is the 'latte factor'?",
    options: ["Love for coffee", "Small daily expenses that add up significantly", "Coffee shop profits", "Caffeine addiction"],
    correctAnswer: 1,
    explanation: "The latte factor refers to small, regular purchases (like daily coffee) that seem insignificant but add up to substantial amounts over time.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "How much should you ideally have in savings before investing?",
    options: ["Nothing, invest immediately", "3-6 months emergency fund", "$1 million", "Wait until retirement"],
    correctAnswer: 1,
    explanation: "Before investing, build an emergency fund covering 3-6 months of expenses. This protects you from having to sell investments during emergencies.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is 'automatic saving'?",
    options: ["Saving without thinking", "Automatic transfers from checking to savings", "Robots saving for you", "AI managing money"],
    correctAnswer: 1,
    explanation: "Automatic saving means setting up automatic transfers from your checking to savings account. This automates good behavior and ensures consistent saving!",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "Which savings strategy involves saving any $5 bills you receive?",
    options: ["The five-dollar challenge", "The coin jar method", "The envelope system", "The emergency fund"],
    correctAnswer: 0,
    explanation: "The five-dollar challenge is a fun savings hack where you save every $5 bill you receive. Over a year, this can add up to hundreds of dollars!",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is a Certificate of Deposit (CD)?",
    options: ["A music album", "A time-deposit account with fixed interest", "A credit card", "A type of loan"],
    correctAnswer: 1,
    explanation: "A CD is a savings account that holds money for a fixed period at a fixed interest rate, usually higher than regular savings. Early withdrawal typically incurs penalties.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What does FDIC insurance protect?",
    options: ["Stock investments", "Bank deposits up to $250,000", "Credit card debt", "All your money"],
    correctAnswer: 1,
    explanation: "FDIC (Federal Deposit Insurance Corporation) insures bank deposits up to $250,000 per depositor, per bank. Your savings are protected even if the bank fails!",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is the 'round-up' savings method?",
    options: ["Rounding numbers in budgets", "Rounding purchases to nearest dollar and saving difference", "Gathering savings together", "Savings with circular strategy"],
    correctAnswer: 1,
    explanation: "Round-up savings automatically rounds up purchases to the nearest dollar and transfers the difference to savings. Small amounts add up quickly!",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is dollar-cost averaging?",
    options: ["Calculating average costs", "Investing fixed amounts regularly regardless of price", "Averaging your expenses", "Finding average prices"],
    correctAnswer: 1,
    explanation: "Dollar-cost averaging means investing a fixed amount regularly, regardless of market conditions. This reduces the impact of market volatility and removes emotion from investing.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What should you do with a windfall (unexpected money)?",
    options: ["Spend it all immediately", "Save/invest a significant portion", "Buy a luxury item", "Give it all away"],
    correctAnswer: 1,
    explanation: "When receiving unexpected money, save or invest at least 50-80%. Use some for goals or treats, but windfalls are opportunities to accelerate financial progress!",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is a money market account?",
    options: ["Stock market account", "Savings account with checking features and higher interest", "Bitcoin account", "Retirement account"],
    correctAnswer: 1,
    explanation: "Money market accounts combine features of savings and checking accounts, offering higher interest rates while allowing limited check-writing and debit card access.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is the 30-day rule for purchases?",
    options: ["Buy everything in 30 days", "Wait 30 days before major purchases", "Return items within 30 days", "Shop every 30 days"],
    correctAnswer: 1,
    explanation: "The 30-day rule suggests waiting 30 days before making non-essential major purchases. This prevents impulse buying and ensures purchases align with goals.",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is 'geographic arbitrage' in savings?",
    options: ["Saving in different countries", "Moving to lower cost-of-living areas to save more", "International investments", "Currency exchange savings"],
    correctAnswer: 1,
    explanation: "Geographic arbitrage means living in areas with lower costs while earning income from higher-paying markets, maximizing savings and purchasing power.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What percentage of your savings should be easily accessible?",
    options: ["0%", "100%", "At least emergency fund portion", "None"],
    correctAnswer: 2,
    explanation: "Your emergency fund (3-6 months expenses) should be in easily accessible accounts. Other savings can be in less accessible accounts with higher returns.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is the simplest way to start saving?",
    options: ["Invest in stocks", "Automatic transfers to savings", "Manual transfers when you remember", "Save cash at home"],
    correctAnswer: 1,
    explanation: "Automatic transfers ensure consistency. Set it and forget it! Money moves to savings before you can spend it, making saving effortless.",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "Where should you keep your emergency fund?",
    options: ["Stock market", "High-yield savings account", "Under mattress", "In checking account"],
    correctAnswer: 1,
    explanation: "Emergency funds need to be safe and accessible. High-yield savings accounts offer FDIC insurance, easy access, and earn some interest.",
    difficulty: "easy"
  },
  {
    levelNumber: 3,
    question: "What is the ladder strategy for savings?",
    options: ["Climbing out of debt", "Splitting savings across different maturity CDs", "Saving in steps", "Increasing savings yearly"],
    correctAnswer: 1,
    explanation: "CD laddering spreads money across CDs with different maturity dates (3-month, 6-month, 1-year). Provides liquidity while earning higher rates than regular savings.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is house hacking as a savings strategy?",
    options: ["Breaking into houses", "Renting out part of your home to offset costs", "Home repair DIY", "Buying cheap houses"],
    correctAnswer: 1,
    explanation: "House hacking means buying a multi-unit property, living in one unit, and renting others. Rental income covers mortgage, effectively living for free or cheap.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What savings rate is recommended for early retirement (FIRE)?",
    options: ["10-20%", "25-40%", "50-70%+", "100%"],
    correctAnswer: 2,
    explanation: "Financial Independence Retire Early (FIRE) advocates typically save 50-70% or more of income. Higher savings rates dramatically accelerate retirement timelines.",
    difficulty: "medium"
  },
  {
    levelNumber: 3,
    question: "What is the 'latte factor' concept?",
    options: ["Only drinking expensive coffee", "Small daily expenses that add up significantly", "Coffee investment returns", "Rewarding yourself with treats"],
    correctAnswer: 1,
    explanation: "The latte factor illustrates how small daily purchases ($5 coffee) compound to huge amounts yearly ($1,825). It's about awareness, not deprivation.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is the optimal emergency fund size for freelancers?",
    options: ["3 months expenses", "6 months expenses", "9-12 months expenses", "1 month expenses"],
    correctAnswer: 2,
    explanation: "Freelancers face irregular income. A 9-12 month emergency fund provides buffer for slow periods, client loss, or economic downturns. More stability = peace of mind.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is tax-loss harvesting in savings/investment strategy?",
    options: ["Not paying taxes", "Selling losing investments to offset tax on gains", "Harvesting crops", "Saving tax refunds"],
    correctAnswer: 1,
    explanation: "Tax-loss harvesting sells investments at a loss to offset capital gains taxes. The loss reduces taxable income, saving money. Then reinvest in similar assets.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is the 'savings cone' approach?",
    options: ["Saving in one account", "Dividing savings into different tiers by accessibility and purpose", "Cone-shaped piggy bank", "Saving less over time"],
    correctAnswer: 1,
    explanation: "The savings cone structures money in layers: liquid emergency fund (base), medium-term goals (middle), long-term investments (top). Balances accessibility with growth.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "How does the 1% rule apply to savings motivation?",
    options: ["Save only 1%", "Improve savings rate by 1% regularly", "Earn 1% interest", "1% goes to charity"],
    correctAnswer: 1,
    explanation: "The 1% rule suggests increasing your savings rate by 1% periodically (annually or per raise). Small incremental increases compound to dramatic savings growth.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is opportunity cost in savings decisions?",
    options: ["Cost of opportunities", "Value of what you give up when choosing one option over another", "Investment fees", "Missed sales"],
    correctAnswer: 1,
    explanation: "Opportunity cost is the benefit you miss when choosing one thing over another. Spending $1,000 costs not just that money, but also investment growth it could have generated.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is the 'savings glitch' trick?",
    options: ["Finding bank errors", "Treating direct-deposited money as never received, saving it immediately", "Software that saves automatically", "Saving spare change"],
    correctAnswer: 1,
    explanation: "The savings glitch means treating money as non-existent the moment it arrives. Direct deposit goes straight to savings—you never 'receive' it mentally, so you don't miss it.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "How does dollar-cost averaging apply to savings?",
    options: ["Converting to dollars", "Investing fixed amounts regularly regardless of market conditions", "Averaging spending", "Comparing costs"],
    correctAnswer: 1,
    explanation: "Dollar-cost averaging invests the same amount regularly (weekly, monthly). Buys more when prices are low, less when high. Removes emotion and timing risk from investing.",
    difficulty: "hard"
  },
  {
    levelNumber: 3,
    question: "What is the primary benefit of micro-saving apps?",
    options: ["High returns", "Automating tiny amounts so saving is painless", "Investment advice", "Credit score improvement"],
    correctAnswer: 1,
    explanation: "Micro-saving apps (Acorns, Digit) round up purchases and save tiny amounts automatically. Painless saving builds significant balances over time without lifestyle impact.",
    difficulty: "hard"
  },

  // Level 4: Understanding Credit
  {
    levelNumber: 4,
    question: "What is a credit score?",
    options: ["Your bank balance", "A number representing creditworthiness", "Your income level", "Number of credit cards"],
    correctAnswer: 1,
    explanation: "A credit score is a three-digit number (typically 300-850) that represents your creditworthiness based on your credit history. Higher scores mean better credit!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is considered an excellent credit score?",
    options: ["500-600", "600-700", "700-750", "750-850"],
    correctAnswer: 3,
    explanation: "Credit scores of 750-850 are considered excellent. With excellent credit, you qualify for the best interest rates and loan terms!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What percentage of your credit score is based on payment history?",
    options: ["10%", "20%", "35%", "50%"],
    correctAnswer: 2,
    explanation: "Payment history accounts for 35% of your FICO score, making it the most important factor. Always pay bills on time!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is credit utilization?",
    options: ["Using all available credit", "Percentage of available credit you're using", "Number of credit cards", "Credit score"],
    correctAnswer: 1,
    explanation: "Credit utilization is the percentage of your available credit that you're currently using. Keeping this below 30% (ideally below 10%) helps your credit score.",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is a hard inquiry on your credit report?",
    options: ["A difficult question", "Credit check when applying for credit", "Annual credit report", "Checking your own credit"],
    correctAnswer: 1,
    explanation: "A hard inquiry occurs when a lender checks your credit for lending decisions. Multiple hard inquiries in a short time can temporarily lower your score.",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "How long does negative information typically stay on your credit report?",
    options: ["Forever", "1 year", "7 years", "10 years"],
    correctAnswer: 2,
    explanation: "Most negative information stays on your credit report for 7 years, though bankruptcy can stay for 10 years. Time heals credit wounds!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is the minimum payment trap?",
    options: ["Minimum payment is ideal", "Only paying minimum keeps you in debt longer with more interest", "A credit card feature", "A way to save money"],
    correctAnswer: 1,
    explanation: "Paying only the minimum payment keeps you in debt much longer and costs significantly more in interest. Always pay more than the minimum when possible!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is an interest-free grace period?",
    options: ["Free interest forever", "Time to pay balance before interest charges", "Bank forgiveness", "Credit card reward"],
    correctAnswer: 1,
    explanation: "A grace period (usually 21-25 days) is the time between your statement date and due date when no interest is charged if you pay in full. Use this wisely!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is a secured credit card?",
    options: ["Very safe credit card", "Card requiring a cash deposit as collateral", "Card with security features", "Bank's credit card"],
    correctAnswer: 1,
    explanation: "A secured credit card requires a cash deposit that becomes your credit limit. It's a great tool for building or rebuilding credit!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What does it mean to be an authorized user?",
    options: ["You own the account", "You can use someone else's credit card account", "You authorize payments", "You work for credit card company"],
    correctAnswer: 1,
    explanation: "As an authorized user, you can use someone's credit card account, and their payment history may affect your credit score. Great for building credit!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is the debt avalanche method?",
    options: ["Paying debts randomly", "Paying highest interest debts first", "Paying smallest debts first", "Ignoring debt"],
    correctAnswer: 1,
    explanation: "The debt avalanche method focuses on paying off debts with the highest interest rates first while making minimum payments on others. Saves the most money on interest!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is the debt snowball method?",
    options: ["Letting debt pile up", "Paying smallest debts first for psychological wins", "Paying highest debts first", "Rolling debt together"],
    correctAnswer: 1,
    explanation: "The debt snowball method pays off smallest debts first regardless of interest rate. Quick wins provide motivation to keep going!",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "How often can you check your credit report for free?",
    options: ["Never", "Once every 12 months from each bureau", "Unlimited", "Once in a lifetime"],
    correctAnswer: 1,
    explanation: "You're entitled to one free credit report every 12 months from each of the three major credit bureaus (Equifax, Experian, TransUnion) at AnnualCreditReport.com.",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What should you do if you find errors on your credit report?",
    options: ["Ignore them", "Dispute them with the credit bureau", "Apply for new credit", "Close all accounts"],
    correctAnswer: 1,
    explanation: "Dispute errors in writing with the credit bureau. They must investigate within 30 days. Correcting errors can significantly improve your score!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is a balance transfer?",
    options: ["Transferring money between banks", "Moving credit card debt to a card with lower interest", "Checking account transfer", "Investment transfer"],
    correctAnswer: 1,
    explanation: "A balance transfer moves debt from one credit card to another, often to take advantage of a lower interest rate or 0% promotional period.",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is the minimum payment on a credit card?",
    options: ["Full balance", "The least you must pay to avoid penalties", "Interest only", "Nothing"],
    correctAnswer: 1,
    explanation: "The minimum payment is the smallest amount you can pay to keep the account in good standing. However, paying only the minimum costs you significantly in interest!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is APR on a credit card?",
    options: ["Monthly fee", "Annual Percentage Rate - the yearly interest cost", "Minimum payment", "Reward points"],
    correctAnswer: 1,
    explanation: "APR is the Annual Percentage Rate—the yearly cost of borrowing expressed as a percentage. Lower APR means less interest charged on unpaid balances.",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What happens to your credit score when you apply for new credit?",
    options: ["It always improves", "It temporarily decreases slightly", "Nothing", "It doubles"],
    correctAnswer: 1,
    explanation: "Hard inquiries from credit applications cause small, temporary score decreases. Multiple inquiries in short periods can compound this effect. Apply strategically!",
    difficulty: "easy"
  },
  {
    levelNumber: 4,
    question: "What is a secured credit card?",
    options: ["Card with high security", "Card requiring cash deposit as collateral", "Card for secure websites", "Card with insurance"],
    correctAnswer: 1,
    explanation: "Secured cards require a cash deposit (usually $200-500) that becomes your credit limit. Great for building or rebuilding credit when traditional cards aren't available.",
    difficulty: "medium"
  },
  {
    levelNumber: 4,
    question: "What is the 'credit utilization sweet spot' for optimal scores?",
    options: ["100%", "50-70%", "Under 30%, ideally under 10%", "80-90%"],
    correctAnswer: 2,
    explanation: "While under 30% is good, under 10% utilization is optimal for credit scores. Some experts suggest 1-9% shows active responsible use without over-reliance.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is a credit freeze vs. credit lock?",
    options: ["Same thing", "Freeze is free and regulated, lock is a service with fees", "Freeze is temporary, lock is permanent", "Only one affects your score"],
    correctAnswer: 1,
    explanation: "Credit freezes are free, regulated by law, and prevent access to your credit report. Locks are paid services from bureaus with convenience features but fewer protections.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is credit card churning?",
    options: ["Using cards frequently", "Opening cards for signup bonuses then closing them", "Making butter", "Paying off cards"],
    correctAnswer: 1,
    explanation: "Churning means strategically opening credit cards for signup bonuses, meeting minimum spend, collecting rewards, then closing or downgrading. Requires excellent credit and organization.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is the 5/24 rule in credit applications?",
    options: ["Pay in 5-24 months", "Chase denies applicants with 5+ new cards in 24 months", "Credit limit calculation", "Minimum age requirement"],
    correctAnswer: 1,
    explanation: "Chase's 5/24 rule automatically denies credit card applications from people who've opened 5 or more cards (any bank) in the past 24 months. Know this before applying!",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is piggybacking in credit building?",
    options: ["Sharing bank accounts", "Being added as authorized user on someone's good credit account", "Copying credit habits", "Joint accounts"],
    correctAnswer: 1,
    explanation: "Credit piggybacking means being added as an authorized user to someone's credit card with good history. Their positive history can appear on your credit report, boosting your score.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is the difference between utilization per card vs. overall?",
    options: ["No difference", "Per-card matters more - keep each under 30%", "Only total matters", "Neither matters"],
    correctAnswer: 1,
    explanation: "Credit scoring considers both individual card utilization and total. Having one maxed card hurts even if overall utilization is low. Distribute balances across cards.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is a goodwill adjustment letter?",
    options: ["Thank you note", "Request to creditor to remove negative mark as a courtesy", "Legal document", "Billing dispute"],
    correctAnswer: 1,
    explanation: "A goodwill letter asks a creditor to remove a negative item (like late payment) as a favor, especially if you have otherwise good history. No guarantee, but sometimes works!",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "How does rapid rescoring work?",
    options: ["Instant score improvement", "Lenders pay to update your credit report faster (3 days vs 30)", "Score estimation", "Automatic score fix"],
    correctAnswer: 1,
    explanation: "Rapid rescoring is when a lender pays to have corrections or updates reflected in your credit report within days instead of weeks. Used during time-sensitive applications like mortgages.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is the statute of limitations on debt?",
    options: ["Debt lasts forever", "Time period creditors can legally sue for debt", "Credit report removal time", "Payment plan duration"],
    correctAnswer: 1,
    explanation: "Statute of limitations (varies by state, typically 3-6 years) limits how long creditors can sue for unpaid debt. After this, debt becomes 'time-barred' but doesn't disappear from reports.",
    difficulty: "hard"
  },
  {
    levelNumber: 4,
    question: "What is the credit card float strategy?",
    options: ["Floating debt forever", "Using credit card grace period while money earns interest elsewhere", "Balance transfers", "Cash advances"],
    correctAnswer: 1,
    explanation: "The float uses credit card grace periods (typically 21-25 days) to keep money in interest-bearing accounts longer before paying the bill. Requires paying in full monthly.",
    difficulty: "hard"
  },

  // Level 5: Investment Basics
  {
    levelNumber: 5,
    question: "What is a stock?",
    options: ["Stored goods", "Ownership share in a company", "A type of bond", "Inventory"],
    correctAnswer: 1,
    explanation: "A stock represents partial ownership in a company. When you buy stock, you become a shareholder and can profit from the company's growth!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is a bond?",
    options: ["Strong connection", "Loan to a company or government", "Type of stock", "Savings account"],
    correctAnswer: 1,
    explanation: "A bond is essentially a loan you make to a company or government. They pay you interest over time and return your principal at maturity.",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What does 'bull market' mean?",
    options: ["Market selling bulls", "Market prices rising", "Market prices falling", "Aggressive trading"],
    correctAnswer: 1,
    explanation: "A bull market is when stock prices are rising or expected to rise. Bulls thrust their horns upward, hence the term!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What does 'bear market' mean?",
    options: ["Market selling bears", "Market prices falling 20% or more", "Market prices rising", "Hibernating market"],
    correctAnswer: 1,
    explanation: "A bear market is when stock prices fall 20% or more from recent highs. Bears swipe their paws downward, hence the term!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is a mutual fund?",
    options: ["Fund from friends", "Pool of money from many investors investing in diversified securities", "Savings account", "Single stock"],
    correctAnswer: 1,
    explanation: "A mutual fund pools money from many investors to buy a diversified portfolio of stocks, bonds, or other securities, managed by professionals.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is an ETF (Exchange-Traded Fund)?",
    options: ["Electronic Trading Format", "Fund traded on exchanges like a stock", "Emergency Trading Fund", "European Trade Fund"],
    correctAnswer: 1,
    explanation: "An ETF is a collection of securities that trades on an exchange like a stock. It combines mutual fund diversification with stock-like trading flexibility!",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is dividend?",
    options: ["Dividing your investment", "Company profit shared with shareholders", "Stock price", "Investment loss"],
    correctAnswer: 1,
    explanation: "A dividend is a portion of a company's profits paid to shareholders, usually quarterly. It's like getting paid for owning stock!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is compound growth in investing?",
    options: ["Complex growth", "Earning returns on your returns", "Simple growth", "No growth"],
    correctAnswer: 1,
    explanation: "Compound growth is when your investment returns generate their own returns. Over time, this creates exponential growth—the power of compounding!",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is asset allocation?",
    options: ["Allocating assets randomly", "Dividing investments among different asset categories", "Buying only stocks", "Selling everything"],
    correctAnswer: 1,
    explanation: "Asset allocation is dividing your portfolio among different asset types (stocks, bonds, cash) based on your goals, risk tolerance, and time horizon.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is 'market volatility'?",
    options: ["Market being violent", "Rate and extent of price changes", "Market closing", "Trading volume"],
    correctAnswer: 1,
    explanation: "Volatility measures how much and how quickly investment prices change. High volatility means more dramatic price swings—more risk and opportunity!",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is the S&P 500?",
    options: ["Savings Plan for 500 people", "Index of 500 large US companies", "500 investment strategies", "Stock price limit"],
    correctAnswer: 1,
    explanation: "The S&P 500 is a stock market index tracking 500 of the largest US companies. It's often used as a benchmark for the overall market.",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What does 'time in the market beats timing the market' mean?",
    options: ["Being punctual", "Staying invested long-term is better than trying to predict peaks", "Trading frequently", "Market hours matter"],
    correctAnswer: 1,
    explanation: "This means staying invested long-term typically outperforms trying to predict market highs and lows. Time, not timing, builds wealth!",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is a 401(k)?",
    options: ["401 thousand dollars", "Employer-sponsored retirement account", "Government benefit", "Type of stock"],
    correctAnswer: 1,
    explanation: "A 401(k) is an employer-sponsored retirement account where you contribute pre-tax income. Many employers match contributions—free money!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is an IRA?",
    options: ["Irish Republican Army", "Individual Retirement Account", "Investment Risk Assessment", "International Return Agreement"],
    correctAnswer: 1,
    explanation: "An IRA (Individual Retirement Account) is a tax-advantaged account for retirement savings. Traditional IRAs offer tax deductions now; Roth IRAs offer tax-free withdrawals later.",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is the main advantage of starting to invest early?",
    options: ["You'll be smarter", "More time for compound growth", "Lower prices", "Less risk"],
    correctAnswer: 1,
    explanation: "Starting early gives compound growth more time to work its magic. Even small amounts invested early can grow substantially over decades!",
    difficulty: "easy"
  },
  {
    levelNumber: 5,
    question: "What is asset allocation?",
    options: ["Selling assets", "Dividing investments among different asset categories", "Buying one stock", "Real estate only"],
    correctAnswer: 1,
    explanation: "Asset allocation spreads investments across different categories (stocks, bonds, real estate, cash) to balance risk and reward based on your goals and timeline.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is the difference between active and passive investing?",
    options: ["Active costs less", "Active tries to beat market, passive tracks it", "No difference", "Active is for beginners"],
    correctAnswer: 1,
    explanation: "Active investing involves picking individual stocks to beat the market. Passive investing tracks market indexes. Passive typically has lower fees and often better long-term results.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is sector rotation in investing?",
    options: ["Spinning investments", "Shifting investments between sectors based on market cycles", "Rotating accounts", "Diversification"],
    correctAnswer: 1,
    explanation: "Sector rotation moves investments between different economic sectors (tech, healthcare, energy) based on which sectors perform best in different economic cycles.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is a REIT?",
    options: ["Retail Investment", "Real Estate Investment Trust - company owning income properties", "Risk Evaluation Tool", "Retirement Plan"],
    correctAnswer: 1,
    explanation: "REITs (Real Estate Investment Trusts) are companies that own and operate income-producing real estate. They let you invest in real estate without buying property directly.",
    difficulty: "medium"
  },
  {
    levelNumber: 5,
    question: "What is the 'wash sale' rule?",
    options: ["Cleaning investments", "Can't claim loss if you rebuy same security within 30 days", "Selling at profit", "Tax-free trading"],
    correctAnswer: 1,
    explanation: "The wash sale rule prevents claiming a tax loss if you buy substantially identical securities within 30 days before or after the sale. Wait 31 days to avoid this.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is dollar-weighted return vs. time-weighted return?",
    options: ["Same calculation", "Dollar accounts for cash flows, time doesn't", "Only name difference", "One is yearly"],
    correctAnswer: 1,
    explanation: "Time-weighted return measures investment performance regardless of money added/withdrawn. Dollar-weighted includes timing of contributions—shows your actual experience including bad timing.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is the Efficient Market Hypothesis (EMH)?",
    options: ["Markets are slow", "Stock prices reflect all available information instantly", "Markets are predictable", "Timing markets works"],
    correctAnswer: 1,
    explanation: "EMH suggests stock prices instantly incorporate all known information, making it impossible to consistently beat the market through stock picking. Supports passive index investing.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is sequence of returns risk?",
    options: ["Order doesn't matter", "Risk of poor returns early in retirement depleting savings", "Market timing risk", "Risk of high returns"],
    correctAnswer: 1,
    explanation: "Sequence risk means poor market returns early in retirement (when withdrawing funds) can devastate a portfolio more than same returns later. Order matters when withdrawing!",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is tax-loss harvesting?",
    options: ["Avoiding taxes", "Selling losing investments to offset capital gains taxes", "Farming taxes", "Tax evasion"],
    correctAnswer: 1,
    explanation: "Tax-loss harvesting sells investments at a loss to offset capital gains, reducing taxes owed. You can then reinvest in similar (but not identical) securities to maintain position.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is the 4% rule in retirement?",
    options: ["4% annual gain", "Withdraw 4% of portfolio yearly for 30-year retirement", "4% inflation", "4% fee"],
    correctAnswer: 1,
    explanation: "The 4% rule suggests withdrawing 4% of your portfolio in year one of retirement, adjusting for inflation thereafter. Historically provides 30-year sustainability with stock/bond mix.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is the difference between market cap and enterprise value?",
    options: ["No difference", "Market cap is shares x price, enterprise includes debt and cash", "Same thing", "One is for bonds"],
    correctAnswer: 1,
    explanation: "Market cap = share price × shares outstanding. Enterprise value = market cap + debt - cash. EV gives truer picture of company cost including its debt obligations.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is the Sharpe ratio?",
    options: ["Profit measure", "Risk-adjusted return metric comparing excess return to volatility", "Stock price trend", "Portfolio size"],
    correctAnswer: 1,
    explanation: "Sharpe ratio measures return per unit of risk. Higher ratios mean better risk-adjusted performance. Formula: (Return - Risk-free rate) / Standard deviation.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is front-running in investing?",
    options: ["Fast trading", "Illegal practice of trading ahead of client orders using inside info", "Running investments", "Early investment"],
    correctAnswer: 1,
    explanation: "Front-running is when brokers trade for themselves before executing large client orders, profiting from anticipated price movement. It's illegal and unethical.",
    difficulty: "hard"
  },
  {
    levelNumber: 5,
    question: "What is a covered call strategy?",
    options: ["Hidden investment", "Owning stock and selling call options on it for income", "Insurance purchase", "Bond strategy"],
    correctAnswer: 1,
    explanation: "Covered calls involve owning stock and selling call options against it. Generates income from premiums but caps upside if stock price rises above strike price.",
    difficulty: "hard"
  },

  // Level 6: Insurance & Risk Management
  {
    levelNumber: 6,
    question: "What is the primary purpose of insurance?",
    options: ["Make insurance companies rich", "Transfer financial risk", "Guarantee no losses", "Investment vehicle"],
    correctAnswer: 1,
    explanation: "Insurance transfers the financial risk of potential losses from you to the insurance company in exchange for premium payments. It protects against catastrophic losses!",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is a deductible?",
    options: ["Tax deduction", "Amount you pay before insurance covers the rest", "Insurance discount", "Monthly payment"],
    correctAnswer: 1,
    explanation: "A deductible is the amount you must pay out-of-pocket before your insurance coverage kicks in. Higher deductibles usually mean lower premiums.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is a premium?",
    options: ["High-quality insurance", "Regular payment for insurance coverage", "Insurance discount", "Maximum coverage"],
    correctAnswer: 1,
    explanation: "A premium is the regular payment (usually monthly or annually) you make to keep your insurance policy active and maintain coverage.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is term life insurance?",
    options: ["Insurance with terms and conditions", "Coverage for a specific time period", "Permanent insurance", "College term insurance"],
    correctAnswer: 1,
    explanation: "Term life insurance provides coverage for a specific period (10, 20, 30 years). It's typically cheaper than permanent insurance and ideal for temporary needs.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What does comprehensive auto insurance cover?",
    options: ["Only accidents you cause", "Non-collision damage (theft, weather, vandalism)", "Only other people's cars", "Nothing important"],
    correctAnswer: 1,
    explanation: "Comprehensive coverage pays for damage to your vehicle from non-collision events like theft, weather, vandalism, or hitting an animal.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is an out-of-pocket maximum in health insurance?",
    options: ["Your pocket costs", "Maximum you pay before insurance covers 100%", "Deductible", "Premium limit"],
    correctAnswer: 1,
    explanation: "The out-of-pocket maximum is the most you'll pay in a year for covered services. After reaching it, insurance pays 100% of covered costs.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is disability insurance?",
    options: ["Insurance for disabled people only", "Replaces income if you can't work due to illness/injury", "Medicare supplement", "Car insurance"],
    correctAnswer: 1,
    explanation: "Disability insurance replaces a portion of your income if you become unable to work due to illness or injury. Your ability to earn is your most valuable asset!",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is an umbrella insurance policy?",
    options: ["Insurance for umbrellas", "Extra liability coverage beyond other policies", "Weather insurance", "All-in-one insurance"],
    correctAnswer: 1,
    explanation: "Umbrella insurance provides additional liability coverage beyond your other policies' limits, protecting your assets from major claims or lawsuits.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is a co-pay?",
    options: ["Paying together", "Fixed amount you pay for medical services", "Your share of premium", "Deductible"],
    correctAnswer: 1,
    explanation: "A co-pay is a fixed amount you pay for specific medical services (like $25 for a doctor visit). It's your share of the cost at the time of service.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is coinsurance?",
    options: ["Insurance with others", "Percentage of costs you pay after deductible", "Co-pay", "Premium sharing"],
    correctAnswer: 1,
    explanation: "Coinsurance is your share of costs after meeting your deductible, expressed as a percentage. For example, 20% coinsurance means you pay 20%, insurance pays 80%.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What does renters insurance typically cover?",
    options: ["The building structure", "Your personal belongings and liability", "Your landlord's losses", "Nothing useful"],
    correctAnswer: 1,
    explanation: "Renters insurance covers your personal belongings, liability if someone is injured in your rental, and additional living expenses if your rental becomes uninhabitable.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is self-insurance?",
    options: ["Buying your own insurance", "Setting aside money to cover potential losses yourself", "Insurance fraud", "Being uninsured"],
    correctAnswer: 1,
    explanation: "Self-insurance means setting aside money to cover potential losses instead of buying insurance. This works for manageable risks but not catastrophic ones.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "When might you need flood insurance?",
    options: ["Only if you live on a boat", "If in flood-prone areas (not covered by standard homeowners)", "Never necessary", "Only in hurricanes"],
    correctAnswer: 1,
    explanation: "Flood insurance is separate from homeowners insurance and necessary if you live in flood-prone areas. Standard homeowners policies don't cover flood damage!",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is a beneficiary?",
    options: ["Insurance company", "Person who receives insurance benefits", "Agent", "Premium payer"],
    correctAnswer: 1,
    explanation: "A beneficiary is the person or entity designated to receive insurance benefits (like life insurance proceeds) when a claim is made.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What's the relationship between deductibles and premiums?",
    options: ["No relationship", "Higher deductible = lower premium", "Always the same", "Higher deductible = higher premium"],
    correctAnswer: 1,
    explanation: "Higher deductibles typically mean lower premiums and vice versa. You're taking on more of the initial risk, so the insurance company charges less.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is a premium in insurance?",
    options: ["High quality insurance", "Regular payment to maintain coverage", "Deductible amount", "Claim payout"],
    correctAnswer: 1,
    explanation: "A premium is the regular payment (monthly, quarterly, or annual) you make to keep your insurance policy active. Miss payments and you lose coverage.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is coinsurance?",
    options: ["Having two policies", "Percentage you pay after deductible is met", "Full coverage", "Group insurance"],
    correctAnswer: 1,
    explanation: "Coinsurance is the percentage of costs you share with your insurer after meeting your deductible. E.g., 80/20 means insurer pays 80%, you pay 20%.",
    difficulty: "easy"
  },
  {
    levelNumber: 6,
    question: "What is an umbrella insurance policy?",
    options: ["Weather insurance", "Extra liability coverage beyond standard policies", "One policy covering everything", "Temporary coverage"],
    correctAnswer: 1,
    explanation: "Umbrella insurance provides additional liability coverage above your home and auto policies. Protects assets if you're sued beyond standard policy limits.",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is a health savings account (HSA)?",
    options: ["Regular savings", "Tax-advantaged account paired with high-deductible health plan", "Hospital account", "Insurance premium account"],
    correctAnswer: 1,
    explanation: "HSAs offer triple tax benefits with high-deductible health plans: tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses. Very powerful!",
    difficulty: "medium"
  },
  {
    levelNumber: 6,
    question: "What is the difference between term and whole life insurance?",
    options: ["No difference", "Term is temporary, whole is permanent with cash value", "Same cost", "Term is more expensive"],
    correctAnswer: 1,
    explanation: "Term life covers you for a specific period (10-30 years) and is cheaper. Whole life is permanent with cash value component but costs 10-15x more. Most need term.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is self-insurance?",
    options: ["DIY insurance", "Setting aside funds to cover potential losses instead of buying insurance", "Being your own agent", "No insurance"],
    correctAnswer: 1,
    explanation: "Self-insurance means saving money to cover potential losses rather than paying premiums. Works for smaller, manageable risks. E.g., $500 deductible vs $250 with higher premiums.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is subrogation in insurance?",
    options: ["Sub-par coverage", "Insurer's right to pursue third party responsible for loss after paying you", "Policy cancellation", "Premium reduction"],
    correctAnswer: 1,
    explanation: "Subrogation lets your insurer pursue the party who caused your loss after paying your claim. They try to recover costs from the responsible party.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is longevity risk?",
    options: ["Living too short", "Risk of outliving your money in retirement", "Life insurance risk", "Health risks"],
    correctAnswer: 1,
    explanation: "Longevity risk is the financial risk of living longer than expected and running out of money. Annuities and conservative withdrawal rates help manage this.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is the purpose of disability insurance?",
    options: ["Medical coverage", "Replace income if you can't work due to illness/injury", "Retirement income", "Death benefits"],
    correctAnswer: 1,
    explanation: "Disability insurance replaces a portion of your income if illness or injury prevents you from working. More likely to use than life insurance during working years!",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is occurrence vs. claims-made liability insurance?",
    options: ["Same thing", "Occurrence covers when incident happens, claims-made when claim is filed", "One is cheaper", "Only for doctors"],
    correctAnswer: 1,
    explanation: "Occurrence policies cover incidents that happened during the policy period regardless of when claimed. Claims-made covers claims filed during policy period. Occurrence is better but pricier.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is adverse selection in insurance?",
    options: ["Bad insurance choice", "Higher-risk individuals seeking more coverage than lower-risk individuals", "Policy rejection", "Premium increase"],
    correctAnswer: 1,
    explanation: "Adverse selection means those most likely to have claims are most likely to buy insurance, driving up costs. Insurers combat this with underwriting and risk-based pricing.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is reinsurance?",
    options: ["Renewing insurance", "Insurance that insurance companies buy to cover their own risk", "Double coverage", "Life insurance renewal"],
    correctAnswer: 1,
    explanation: "Reinsurance is insurance for insurance companies. It helps insurers manage risk exposure and avoid bankruptcy from catastrophic claims like hurricanes.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is the emergency fund rule before buying life insurance?",
    options: ["No rule", "Build 3-6 month emergency fund first, then consider insurance", "Buy insurance immediately", "Emergency fund isn't important"],
    correctAnswer: 1,
    explanation: "Financial priority order: 1) Emergency fund 2) Employer 401(k) match 3) High-interest debt 4) Life insurance if dependents need it. Cash buffer comes first!",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "What is a captive insurance company?",
    options: ["Held hostage", "Insurance company owned by insured to cover their own risks", "Mandatory insurance", "Group policy"],
    correctAnswer: 1,
    explanation: "Large companies sometimes create captive insurance companies to insure their own risks, gaining tax benefits and retaining underwriting profits. Complex but powerful for corporations.",
    difficulty: "hard"
  },

  // Level 7: Tax Essentials
  {
    levelNumber: 7,
    question: "What is the difference between tax deduction and tax credit?",
    options: ["No difference", "Deduction reduces taxable income, credit reduces tax owed", "Both same thing", "Deduction is better always"],
    correctAnswer: 1,
    explanation: "A tax deduction reduces your taxable income, while a tax credit directly reduces your tax owed. Credits are generally more valuable dollar-for-dollar!",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What are progressive taxes?",
    options: ["Modern taxes", "Higher income = higher tax rate", "Taxes that progress over time", "Liberal taxes"],
    correctAnswer: 1,
    explanation: "Progressive taxes mean higher income earners pay a higher percentage in taxes. The US income tax system is progressive with multiple tax brackets.",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is a W-2 form?",
    options: ["Tax return form", "Form showing annual wages and taxes withheld from employer", "Investment form", "Application form"],
    correctAnswer: 1,
    explanation: "A W-2 form is provided by your employer showing your annual wages and the taxes withheld. You need it to file your tax return!",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is a 1099 form used for?",
    options: ["Employee income", "Non-employee income (freelance, contract, investment)", "Tax refunds", "Deductions"],
    correctAnswer: 1,
    explanation: "1099 forms report various types of non-employee income like freelance work, investment income, and other payments. You may receive multiple 1099s!",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is the standard deduction?",
    options: ["Default tax rate", "Fixed amount reducing taxable income without itemizing", "Maximum deduction", "Minimum tax payment"],
    correctAnswer: 1,
    explanation: "The standard deduction is a fixed dollar amount that reduces your taxable income. Most people use this instead of itemizing deductions.",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "When are federal taxes typically due?",
    options: ["December 31", "January 1", "April 15", "Whenever you want"],
    correctAnswer: 2,
    explanation: "Federal tax returns are typically due April 15 (or the next business day if it falls on a weekend). Extensions are available but taxes owed are still due!",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is tax withholding?",
    options: ["Hiding from taxes", "Taxes taken from your paycheck by employer", "Tax savings", "Tax refund"],
    correctAnswer: 1,
    explanation: "Tax withholding is when your employer automatically takes taxes from your paycheck and sends them to the government. It prevents owing a large sum at tax time.",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is a tax bracket?",
    options: ["Tax holder", "Income range taxed at a specific rate", "Total taxes owed", "Tax deduction"],
    correctAnswer: 1,
    explanation: "Tax brackets are income ranges taxed at specific rates. Your income may span multiple brackets, with only income in each bracket taxed at that rate (marginal taxation).",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is itemizing deductions?",
    options: ["Listing items you bought", "Listing specific deductible expenses instead of standard deduction", "Counting inventory", "Tax evasion"],
    correctAnswer: 1,
    explanation: "Itemizing means listing specific deductible expenses (mortgage interest, charitable donations, etc.) instead of taking the standard deduction. Do this only if it exceeds the standard deduction!",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is capital gains tax?",
    options: ["Tax on your capital", "Tax on profit from selling investments", "Tax on wages", "Property tax"],
    correctAnswer: 1,
    explanation: "Capital gains tax is paid on profit from selling investments. Long-term gains (held over 1 year) are taxed at lower rates than short-term gains or ordinary income.",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is a tax refund?",
    options: ["Free money from government", "Return of overpaid taxes", "Government gift", "Tax credit"],
    correctAnswer: 1,
    explanation: "A tax refund is money returned to you because you paid more in taxes during the year than you actually owed. It's your own money, not a gift!",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is self-employment tax?",
    options: ["Tax on being self-employed", "Social Security and Medicare taxes for self-employed people", "Business tax", "Sales tax"],
    correctAnswer: 1,
    explanation: "Self-employment tax covers Social Security and Medicare taxes for self-employed individuals. It's about 15.3% of net earnings since you pay both employer and employee portions.",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is an HSA (Health Savings Account)?",
    options: ["Hospital Savings Account", "Tax-advantaged account for medical expenses", "Health insurance", "Retirement account"],
    correctAnswer: 1,
    explanation: "An HSA is a tax-advantaged account for medical expenses. Contributions are tax-deductible, growth is tax-free, and withdrawals for qualified medical expenses are tax-free. Triple tax advantage!",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is tax evasion vs. tax avoidance?",
    options: ["Same thing", "Evasion is illegal, avoidance is legal tax reduction", "Both illegal", "Both legal"],
    correctAnswer: 1,
    explanation: "Tax evasion is illegally avoiding taxes (crime). Tax avoidance is legally minimizing taxes using deductions, credits, and strategies. Always stay legal!",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is estimated tax?",
    options: ["Guessing your taxes", "Quarterly payments for self-employed or those without withholding", "Annual tax estimate", "Approximate tax"],
    correctAnswer: 1,
    explanation: "Estimated taxes are quarterly payments made by self-employed individuals and others who don't have taxes withheld. This prevents owing a huge amount in April!",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is the standard deduction?",
    options: ["Any deduction", "Fixed amount that reduces taxable income without itemizing", "Maximum deduction", "Minimum tax"],
    correctAnswer: 1,
    explanation: "The standard deduction is a fixed dollar amount that reduces taxable income. Most taxpayers use it instead of itemizing because it's simpler and often larger.",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is tax withholding?",
    options: ["Refusing to pay", "Money automatically taken from paycheck for taxes", "Hiding income", "Tax savings"],
    correctAnswer: 1,
    explanation: "Tax withholding is when employers automatically deduct estimated taxes from your paycheck and send them to the government. Prevents a huge tax bill at year-end.",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is filing status on tax returns?",
    options: ["Employed or not", "Category like single, married filing jointly, head of household", "Income level", "State residence"],
    correctAnswer: 1,
    explanation: "Filing status determines your tax rates and standard deduction. Options include single, married filing jointly/separately, head of household, and qualifying widow(er).",
    difficulty: "easy"
  },
  {
    levelNumber: 7,
    question: "What is the Alternative Minimum Tax (AMT)?",
    options: ["Minimum wage tax", "Parallel tax system ensuring high earners pay minimum tax", "Small business tax", "State tax"],
    correctAnswer: 1,
    explanation: "AMT is a separate tax calculation that limits certain deductions for high earners. If AMT is higher than regular tax, you pay the AMT. Prevents wealthy from paying zero taxes.",
    difficulty: "medium"
  },
  {
    levelNumber: 7,
    question: "What is tax loss harvesting?",
    options: ["Farming taxes", "Selling losing investments to offset capital gains and reduce taxes", "Tax evasion", "Collecting tax refunds"],
    correctAnswer: 1,
    explanation: "Tax loss harvesting sells investments at a loss to offset capital gains, reducing taxable income. Can offset up to $3,000 ordinary income yearly. Strategy continues yearly.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the difference between marginal and effective tax rate?",
    options: ["No difference", "Marginal is rate on next dollar, effective is average rate paid", "Both same", "Effective is always higher"],
    correctAnswer: 1,
    explanation: "Marginal rate is the tax on your last dollar earned (top bracket). Effective rate is total taxes divided by total income—your actual average rate. Always lower than marginal.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is a backdoor Roth IRA?",
    options: ["Illegal IRA", "Converting traditional IRA to Roth to bypass income limits", "Secret account", "Stolen retirement"],
    correctAnswer: 1,
    explanation: "Backdoor Roth lets high earners contribute to Roth IRAs despite income limits by contributing to traditional IRA (no limit) then immediately converting to Roth. Completely legal!",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the kiddie tax?",
    options: ["Tax on children", "Tax on child's unearned income above threshold at parent's rate", "Childcare tax credit", "Dependent credit"],
    correctAnswer: 1,
    explanation: "Kiddie tax applies to unearned income (interest, dividends, capital gains) of children under 19 (or 24 if student) above $2,500. Prevents parents from shifting investment income to kids.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is tax gain/loss harvesting timing?",
    options: ["Random selling", "Strategic realization of gains in low-income years, losses in high-income years", "Always harvest losses", "Never matters"],
    correctAnswer: 1,
    explanation: "Harvest capital gains in low-income years (lower capital gains rate or even 0%). Harvest losses in high-income years to offset ordinary income. Timing maximizes tax benefits.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the SALT deduction cap?",
    options: ["Food tax", "$10,000 limit on state and local tax deductions", "Unlimited deduction", "Salt production tax"],
    correctAnswer: 1,
    explanation: "Tax Cuts and Jobs Act capped state and local tax (SALT) deductions at $10,000. Particularly affects high-tax states like CA, NY, NJ where property and income taxes are high.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the marriage penalty/bonus?",
    options: ["Wedding tax", "Tax impact (increase or decrease) from marriage vs filing single", "Marriage license fee", "Gift tax"],
    correctAnswer: 1,
    explanation: "Marriage penalty occurs when two similar high earners pay more tax jointly than separately. Marriage bonus occurs when incomes are disparate. Depends on income levels and splits.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is tax alpha?",
    options: ["First tax", "Value added through tax-efficient strategies beyond investment returns", "Alpha returns", "Tax rate"],
    correctAnswer: 1,
    explanation: "Tax alpha is the additional after-tax return generated through tax-efficient strategies: asset location, tax-loss harvesting, Roth conversions. Can add 1-2% annual returns.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the net investment income tax (NIIT)?",
    options: ["Capital gains tax", "3.8% surtax on investment income for high earners", "Net worth tax", "Business income tax"],
    correctAnswer: 1,
    explanation: "NIIT is an additional 3.8% tax on investment income (interest, dividends, capital gains) for individuals earning over $200K ($250K married). Part of Affordable Care Act funding.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is qualified business income (QBI) deduction?",
    options: ["Business expense", "20% deduction for pass-through business income", "Corporation tax break", "Sales tax"],
    correctAnswer: 1,
    explanation: "QBI deduction allows pass-through entities (sole props, partnerships, S-corps) to deduct up to 20% of qualified business income. Complex rules with income phaseouts and limitations.",
    difficulty: "hard"
  },

  // Level 8: Retirement Planning
  {
    levelNumber: 8,
    question: "What is the 'rule of 72'?",
    options: ["Retire at 72", "Dividing 72 by interest rate estimates doubling time", "Save for 72 years", "Spend 72% of income"],
    correctAnswer: 1,
    explanation: "The rule of 72 estimates how long it takes money to double: divide 72 by your annual return rate. At 8% return, money doubles in about 9 years (72÷8)!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a Roth IRA?",
    options: ["Traditional IRA", "Retirement account with tax-free withdrawals", "Employer retirement plan", "Pension"],
    correctAnswer: 1,
    explanation: "A Roth IRA is funded with after-tax dollars, but qualified withdrawals in retirement are completely tax-free. Great for younger people expecting higher future tax rates!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a Traditional IRA?",
    options: ["Old-fashioned IRA", "Retirement account with tax-deductible contributions", "Roth IRA", "Pension plan"],
    correctAnswer: 1,
    explanation: "Traditional IRA contributions may be tax-deductible now, but you pay taxes on withdrawals in retirement. Good if you expect lower tax rates in retirement.",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is employer 401(k) matching?",
    options: ["Employer copies your investments", "Employer contributes money matching yours up to a limit", "Comparing 401(k)s", "Employer takes your money"],
    correctAnswer: 1,
    explanation: "Employer matching means your employer contributes to your 401(k) matching your contributions up to a certain percentage. It's free money—always take it!",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "At what age can you withdraw from IRAs without penalty?",
    options: ["55", "59½", "62", "65"],
    correctAnswer: 1,
    explanation: "You can withdraw from IRAs penalty-free starting at age 59½. Early withdrawals usually incur a 10% penalty plus taxes (some exceptions apply).",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What are Required Minimum Distributions (RMDs)?",
    options: ["Minimum contributions", "Mandatory withdrawals starting at age 73", "Optional withdrawals", "Minimum balance"],
    correctAnswer: 1,
    explanation: "RMDs are mandatory minimum withdrawals from traditional retirement accounts starting at age 73 (as of 2023). Roth IRAs don't have RMDs during the owner's lifetime!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a pension?",
    options: ["Retirement savings account", "Employer-paid retirement benefit based on salary and years worked", "Government program", "401(k)"],
    correctAnswer: 1,
    explanation: "A pension is a defined benefit plan where your employer pays you a fixed amount in retirement based on your salary and years of service. Less common today.",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is Social Security?",
    options: ["Security company", "Government retirement benefit based on earnings history", "Private pension", "Investment account"],
    correctAnswer: 1,
    explanation: "Social Security is a government program providing retirement benefits based on your earnings history. Your full retirement age depends on when you were born.",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is the 4% rule in retirement?",
    options: ["Save 4% of income", "Withdraw 4% of retirement savings annually", "Earn 4% interest", "Invest 4% in stocks"],
    correctAnswer: 1,
    explanation: "The 4% rule suggests withdrawing 4% of your retirement savings in year one, adjusted for inflation thereafter. This aims to make your money last 30+ years.",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a 403(b)?",
    options: ["Better than 401(k)", "Retirement plan for nonprofits and schools", "Government savings plan", "Type of IRA"],
    correctAnswer: 1,
    explanation: "A 403(b) is similar to a 401(k) but for employees of nonprofits, schools, and certain public organizations. Same tax advantages, different eligibility!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "How much should you aim to save for retirement?",
    options: ["$100,000", "10-12x your final salary", "Whatever you have", "$1 million minimum"],
    correctAnswer: 1,
    explanation: "Financial planners often suggest saving 10-12x your final salary by retirement. This varies based on lifestyle, Social Security, and other factors.",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a target-date fund?",
    options: ["Fund that targets dates", "Fund that automatically adjusts allocation based on retirement date", "Calendar fund", "Time deposit"],
    correctAnswer: 1,
    explanation: "Target-date funds automatically adjust their asset allocation becoming more conservative as you approach your target retirement date. Set-it-and-forget-it investing!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is vesting?",
    options: ["Wearing a vest", "Earning ownership rights to employer contributions over time", "Investing", "Retirement age"],
    correctAnswer: 1,
    explanation: "Vesting is the process of earning ownership of employer contributions to your retirement account over time. You're always 100% vested in your own contributions!",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is a rollover?",
    options: ["Rolling over savings", "Moving retirement funds from one account to another", "Reinvesting dividends", "Retirement"],
    correctAnswer: 1,
    explanation: "A rollover is moving retirement funds from one account to another (like from a 401(k) to an IRA when changing jobs) without taxes or penalties if done correctly.",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What's an early withdrawal penalty for retirement accounts?",
    options: ["No penalty", "Typically 10% plus taxes", "Lost interest", "Account closure"],
    correctAnswer: 1,
    explanation: "Withdrawing from retirement accounts before age 59½ typically incurs a 10% penalty plus ordinary income taxes. Exceptions exist for certain hardships.",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is Social Security?",
    options: ["Social network", "Government retirement benefit program", "Investment account", "Insurance policy"],
    correctAnswer: 1,
    explanation: "Social Security is a government program providing retirement income based on your work history and earnings. Most receive benefits starting age 62-70.",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is the difference between traditional and Roth 401(k)?",
    options: ["No difference", "Traditional is pre-tax, Roth is after-tax contributions", "Roth is employer-only", "Traditional has no limit"],
    correctAnswer: 1,
    explanation: "Traditional 401(k) uses pre-tax dollars (lower taxable income now) but withdrawals are taxed. Roth 401(k) uses after-tax dollars but withdrawals are tax-free!",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is required minimum distribution (RMD)?",
    options: ["Minimum contribution", "Minimum withdrawal required at age 73 from retirement accounts", "Distribution fee", "Voluntary withdrawal"],
    correctAnswer: 1,
    explanation: "RMDs force you to withdraw and pay taxes on traditional retirement accounts starting at age 73. Roth IRAs have no RMDs during owner's lifetime. Plan accordingly!",
    difficulty: "easy"
  },
  {
    levelNumber: 8,
    question: "What is a pension?",
    options: ["Modern retirement plan", "Employer-funded retirement benefit paying fixed monthly amount", "401(k) equivalent", "IRA type"],
    correctAnswer: 1,
    explanation: "Pensions (defined benefit plans) pay fixed monthly amounts in retirement based on salary and years of service. Rare today but still common in government jobs.",
    difficulty: "medium"
  },
  {
    levelNumber: 8,
    question: "What is the mega backdoor Roth?",
    options: ["Large Roth IRA", "Converting after-tax 401(k) contributions to Roth", "Backdoor doubled", "Illegal strategy"],
    correctAnswer: 1,
    explanation: "Mega backdoor Roth allows contributing after-tax dollars beyond normal 401(k) limits ($69,000+ total in 2024) then converting to Roth. Requires employer plan support.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is the rule of 25 for retirement?",
    options: ["Retire at 25", "Need 25x annual expenses saved for retirement", "Save 25% of income", "Withdraw 25%"],
    correctAnswer: 1,
    explanation: "Rule of 25 suggests needing 25x your annual expenses saved for retirement. Combined with 4% withdrawal rate (100÷25=4%), provides 30+ year sustainability.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is a Roth conversion ladder?",
    options: ["Climbing tool", "Strategy converting traditional IRA to Roth yearly for early retirement access", "Investment ladder", "Backdoor variant"],
    correctAnswer: 1,
    explanation: "Roth conversion ladder converts traditional IRA funds to Roth IRA over multiple years. After 5 years, converted amounts accessible penalty-free. Enables early retirement withdrawals.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is substantially equal periodic payments (SEPP/72(t))?",
    options: ["Equal monthly payments", "IRS rule allowing penalty-free early withdrawals with strict rules", "Annuity payment", "Social Security formula"],
    correctAnswer: 1,
    explanation: "SEPP (72(t)) allows penalty-free withdrawals before 59½ if you take substantially equal payments for 5 years or until age 59½, whichever is longer. Very rigid rules—break them, penalties apply retroactively!",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is a safe withdrawal rate?",
    options: ["Any amount", "Percentage you can withdraw yearly without depleting retirement funds", "4% fixed", "Maximum withdrawal"],
    correctAnswer: 1,
    explanation: "Safe withdrawal rate (typically 3.5-4%) is the annual percentage you can withdraw from retirement portfolio with high confidence of lasting 30+ years. Varies by asset allocation and market conditions.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is the Roth IRA 5-year rule?",
    options: ["Wait 5 years to open", "Must wait 5 years from first contribution for tax-free withdrawal of earnings", "5 year holding period", "Age 65 minus 5"],
    correctAnswer: 1,
    explanation: "Roth IRA has dual 5-year rules: 1) Account must be open 5+ years for tax-free earnings withdrawals at 59½+, 2) Each conversion has its own 5-year clock for penalty-free access.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is the Social Security earnings test?",
    options: ["Test to qualify", "Benefit reduction if claiming before full retirement age while working", "Income verification", "Maximum earnings"],
    correctAnswer: 1,
    explanation: "If claiming Social Security before full retirement age (67) while working, benefits are reduced $1 for every $2 earned above threshold ($22,320 in 2024). Eliminated at FRA.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is tax diversification in retirement accounts?",
    options: ["Having one account type", "Spreading retirement assets across taxable, tax-deferred, and tax-free accounts", "Diverse investments", "Multiple 401(k)s"],
    correctAnswer: 1,
    explanation: "Tax diversification means having traditional (tax-deferred), Roth (tax-free), and taxable accounts. Provides flexibility to optimize withdrawals and manage tax brackets in retirement.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is the health savings account (HSA) retirement triple play?",
    options: ["Three HSAs", "Tax-deductible contributions, tax-free growth, tax-free medical withdrawals", "Triple returns", "Three beneficiaries"],
    correctAnswer: 1,
    explanation: "HSAs offer triple tax benefit: contributions are tax-deductible, growth is tax-free, withdrawals for medical expenses are tax-free. After 65, works like traditional IRA for non-medical.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What is the retirement 'go-go, slow-go, no-go' spending pattern?",
    options: ["Exercise routine", "Spending typically decreases as you age through retirement phases", "Travel schedule", "Investment strategy"],
    correctAnswer: 1,
    explanation: "Spending patterns in retirement: Go-go years (60s, active, higher spending), slow-go (70s, less travel, moderate spending), no-go (80s+, mainly healthcare, lower discretionary). Plan accordingly!",
    difficulty: "hard"
  },

  // Level 9: Real Estate & Property
  {
    levelNumber: 9,
    question: "What is a mortgage?",
    options: ["More debt", "Loan secured by real estate", "Rent payment", "Property tax"],
    correctAnswer: 1,
    explanation: "A mortgage is a loan secured by real estate. If you don't repay, the lender can foreclose and take the property. It allows buying property without paying full price upfront.",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is a down payment?",
    options: ["Payment that's down", "Initial cash payment when buying property", "Monthly mortgage payment", "Final payment"],
    correctAnswer: 1,
    explanation: "A down payment is the initial cash payment when buying property, typically 3-20% of the purchase price. Larger down payments mean lower monthly payments and better rates!",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is PMI (Private Mortgage Insurance)?",
    options: ["Property Maintenance Insurance", "Insurance required with less than 20% down payment", "Post-Move Insurance", "Optional insurance"],
    correctAnswer: 1,
    explanation: "PMI protects the lender if you default and is typically required if you put down less than 20%. It adds to your monthly payment but can be removed later!",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is home equity?",
    options: ["Equality for homes", "Your ownership stake in property (value minus debt)", "Home value", "Mortgage balance"],
    correctAnswer: 1,
    explanation: "Home equity is your ownership stake: the property's current market value minus what you owe. As you pay down the mortgage and property appreciates, equity grows!",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is a fixed-rate mortgage?",
    options: ["Mortgage that's fixed", "Mortgage with interest rate that never changes", "Mortgage with adjustable rate", "Short-term mortgage"],
    correctAnswer: 1,
    explanation: "A fixed-rate mortgage has an interest rate that stays the same for the entire loan term. Predictable payments make budgeting easier!",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is an ARM (Adjustable Rate Mortgage)?",
    options: ["Armed mortgage", "Mortgage with interest rate that can change", "Fixed mortgage", "Arm's length transaction"],
    correctAnswer: 1,
    explanation: "An ARM has an interest rate that adjusts periodically based on market conditions. Initial rates are often lower but can increase, making payments less predictable.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is closing costs?",
    options: ["Cost of closing doors", "Fees paid when finalizing property purchase", "Monthly mortgage payments", "Down payment"],
    correctAnswer: 1,
    explanation: "Closing costs are fees paid when finalizing a property purchase, typically 2-5% of the purchase price. They include appraisal, title insurance, attorney fees, and more.",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is property appreciation?",
    options: ["Thanking your property", "Increase in property value over time", "Property depreciation", "Property taxes"],
    correctAnswer: 1,
    explanation: "Property appreciation is when real estate increases in value over time due to market conditions, improvements, or other factors. It builds wealth!",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is a HELOC?",
    options: ["Helicopter", "Home Equity Line of Credit", "High Equity Loan Option", "Housing Expense Limit"],
    correctAnswer: 1,
    explanation: "A HELOC is a line of credit secured by your home equity. You can borrow against it as needed, paying interest only on what you use. Great for renovations!",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is rental yield?",
    options: ["Giving up renting", "Annual rental income as percentage of property value", "Rent increase", "Yield sign for rentals"],
    correctAnswer: 1,
    explanation: "Rental yield is annual rental income divided by property value, expressed as a percentage. It helps evaluate investment property profitability.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is the 1% rule in real estate investing?",
    options: ["1% down payment", "Monthly rent should be 1% or more of purchase price", "1% interest rate", "1% appreciation"],
    correctAnswer: 1,
    explanation: "The 1% rule suggests monthly rent should be at least 1% of the property's purchase price for good cash flow. A $200,000 property should rent for $2,000/month.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What are property taxes based on?",
    options: ["Property color", "Assessed property value", "Number of rooms", "Property age"],
    correctAnswer: 1,
    explanation: "Property taxes are based on the assessed value of your property, set by local tax assessors. Rates vary by location and fund local services.",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is a real estate agent's commission typically?",
    options: ["1%", "5-6% split between buyer's and seller's agents", "10%", "Fixed $1000"],
    correctAnswer: 1,
    explanation: "Real estate commissions are typically 5-6% of the sale price, split between buyer's and seller's agents. This is usually paid by the seller.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is foreclosure?",
    options: ["Closing early", "Lender seizing property due to payment default", "Selling property", "Refinancing"],
    correctAnswer: 1,
    explanation: "Foreclosure is when a lender seizes and sells property because the borrower failed to make mortgage payments. It severely damages credit and should be avoided!",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is rent vs. buy break-even point?",
    options: ["Never breaks even", "Time when buying becomes cheaper than renting", "When rent equals mortgage", "5 years always"],
    correctAnswer: 1,
    explanation: "The break-even point is how long you must own before buying becomes cheaper than renting, considering all costs. Often 5-7 years but varies by location.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is PMI (Private Mortgage Insurance)?",
    options: ["Property maintenance insurance", "Insurance required when down payment is less than 20%", "Penalty for missing payments", "Primary mortgage investment"],
    correctAnswer: 1,
    explanation: "PMI protects the lender if you default with less than 20% down. Costs 0.5-1.5% of loan annually. Avoid by putting 20% down or using piggyback loans.",
    difficulty: "easy"
  },
  {
    levelNumber: 9,
    question: "What is a cash-out refinance?",
    options: ["Paying mortgage in cash", "Refinancing for more than owed and taking difference as cash", "Selling for cash", "Cash only purchase"],
    correctAnswer: 1,
    explanation: "Cash-out refinance replaces your mortgage with a larger one, giving you the difference in cash. Useful for home improvements or debt consolidation, but increases debt.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is the 1% rule in real estate investing?",
    options: ["1% interest rate", "Monthly rent should equal 1% of purchase price", "1% down payment", "1% appreciation"],
    correctAnswer: 1,
    explanation: "The 1% rule suggests monthly rent should equal at least 1% of the property's purchase price for positive cash flow. E.g., $200K property should rent for $2K/month.",
    difficulty: "medium"
  },
  {
    levelNumber: 9,
    question: "What is a 1031 exchange?",
    options: ["Currency exchange", "Tax-deferred exchange of investment properties", "Stock trade", "Home sale"],
    correctAnswer: 1,
    explanation: "1031 exchange allows selling investment property and buying another while deferring capital gains taxes. Must be like-kind property and follow strict timelines. Powerful wealth builder!",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is the BRRRR strategy?",
    options: ["Cold investing", "Buy, Rehab, Rent, Refinance, Repeat", "Buy and rent immediately", "Flipping strategy"],
    correctAnswer: 1,
    explanation: "BRRRR: Buy undervalued property, Rehab to increase value, Rent for income, Refinance to pull equity out, Repeat with recycled capital. Scales rental portfolio quickly.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is the debt service coverage ratio (DSCR)?",
    options: ["Debt amount", "Net operating income divided by debt payments", "Loan-to-value ratio", "Interest rate"],
    correctAnswer: 1,
    explanation: "DSCR = NOI ÷ debt service. Measures if property generates enough income to cover debt. Lenders typically want 1.25+ DSCR (125% coverage). Below 1.0 means negative cash flow.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is cap rate in real estate?",
    options: ["Maximum rate", "Net operating income divided by property value", "Interest rate cap", "Appreciation rate"],
    correctAnswer: 1,
    explanation: "Cap rate = NOI ÷ property value. Measures investment return independent of financing. Higher cap = higher return but often more risk. Compare similar properties in same market.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is house hacking?",
    options: ["Breaking into houses", "Living in multi-unit property while renting other units", "Home security", "Buying foreclosures"],
    correctAnswer: 1,
    explanation: "House hacking: buy duplex/triplex/fourplex, live in one unit, rent others. Rental income covers mortgage, essentially living free. Great way to start building wealth!",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is the real estate capital stack?",
    options: ["Building height", "Hierarchy of capital sources from senior debt to equity", "Renovation budget", "Property layers"],
    correctAnswer: 1,
    explanation: "Capital stack orders investment by risk/return: senior debt (lowest risk/return), mezzanine debt, preferred equity, common equity (highest risk/return). Determines payout priority in liquidation.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is depreciation recapture?",
    options: ["Getting depreciation back", "Taxed when selling property after claiming depreciation deductions", "Property appreciation", "Maintenance reclaim"],
    correctAnswer: 1,
    explanation: "When selling rental property, previously claimed depreciation is 'recaptured' and taxed at 25%. Sale price minus depreciated basis = gain. 1031 exchange defers this.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is a syndication in real estate?",
    options: ["Crime group", "Pooling money from multiple investors to buy larger properties", "Single investor purchase", "Developer group"],
    correctAnswer: 1,
    explanation: "Real estate syndication pools capital from passive investors (limited partners) with sponsor/operator (general partner) to buy large properties. Provides access to bigger deals.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is basis in real estate?",
    options: ["Foundation", "Original cost plus improvements minus depreciation", "Current market value", "Purchase price only"],
    correctAnswer: 1,
    explanation: "Tax basis = purchase price + closing costs + improvements - depreciation taken. When selling, gain = sale price - basis. Lower basis = higher taxable gain. Track improvements!",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is the 2% rule in real estate?",
    options: ["2% down payment", "Monthly rent should equal 2% of purchase price", "2% interest rate", "2% appreciation"],
    correctAnswer: 1,
    explanation: "The 2% rule (more aggressive than 1% rule) suggests monthly rent = 2% of purchase price for strong cash flow. Harder to find but ensures excellent returns. $100K property needs $2K rent.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "What is an FHA loan?",
    options: ["Federal Housing Administration loan with low down payment", "Foreign house agreement", "First home advance", "Fixed housing arrangement"],
    correctAnswer: 0,
    explanation: "FHA loans are government-backed mortgages requiring as little as 3.5% down. Great for first-time buyers with limited savings but includes mortgage insurance.",
    difficulty: "medium"
  },

  // Level 10: Advanced Wealth Building
  {
    levelNumber: 10,
    question: "What is passive income?",
    options: ["Income from being passive", "Money earned without active involvement", "Part-time income", "Lazy money"],
    correctAnswer: 1,
    explanation: "Passive income is money earned with minimal active effort, like rental income, dividends, royalties, or business income where you're not actively involved.",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is a trust?",
    options: ["Trusting someone", "Legal arrangement where assets are held for beneficiaries", "Bank account", "Investment fund"],
    correctAnswer: 1,
    explanation: "A trust is a legal arrangement where a trustee holds and manages assets for beneficiaries. Trusts help with estate planning, tax management, and asset protection.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is estate planning?",
    options: ["Planning an estate", "Arranging transfer of assets after death", "Real estate planning", "Retirement planning"],
    correctAnswer: 1,
    explanation: "Estate planning is arranging how your assets will be transferred after death, including wills, trusts, beneficiaries, and minimizing taxes. Everyone needs this!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is tax-loss harvesting?",
    options: ["Losing money on taxes", "Selling investments at loss to offset taxable gains", "Tax evasion", "Harvest tax credits"],
    correctAnswer: 1,
    explanation: "Tax-loss harvesting means selling investments at a loss to offset capital gains, reducing your tax bill. You can then reinvest in similar assets.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is a backdoor Roth IRA?",
    options: ["Illegal Roth IRA", "Strategy to contribute to Roth IRA despite income limits", "Roth IRA withdrawal method", "Hidden Roth IRA"],
    correctAnswer: 1,
    explanation: "A backdoor Roth IRA is a legal strategy where high earners contribute to a traditional IRA then convert to Roth, bypassing income limits. Consult a tax professional!",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the FIRE movement?",
    options: ["Firefighter retirement", "Financial Independence, Retire Early", "Fire your employer", "Hot investment trend"],
    correctAnswer: 1,
    explanation: "FIRE stands for Financial Independence, Retire Early. Followers save aggressively (often 50-70% of income) to retire decades earlier than traditional retirement age.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is angel investing?",
    options: ["Investing from heaven", "Investing in early-stage startups", "Safe investments", "Stock market investing"],
    correctAnswer: 1,
    explanation: "Angel investing means investing in early-stage startups in exchange for equity. High risk but potential for massive returns. Requires significant capital and expertise.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is a holding company?",
    options: ["Company that holds things", "Company that owns other companies' stock", "Storage company", "Real estate holding"],
    correctAnswer: 1,
    explanation: "A holding company's primary business is owning controlling interests in other companies. It provides liability protection and tax advantages for multiple businesses.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is leverage in investing?",
    options: ["Using a lever", "Using borrowed money to invest", "Mechanical advantage", "Investment power"],
    correctAnswer: 1,
    explanation: "Leverage means using borrowed money to invest, amplifying both potential gains and losses. Real estate and margin trading are common leveraged investments.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is an LLC?",
    options: ["Legal Liability Company", "Limited Liability Company", "Low-Level Corporation", "Leverage Loan Company"],
    correctAnswer: 1,
    explanation: "An LLC (Limited Liability Company) is a business structure that protects owners' personal assets from business liabilities. It combines corporation benefits with partnership flexibility.",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is the difference between income and wealth?",
    options: ["No difference", "Income is earnings, wealth is accumulated assets", "Wealth is better", "Income is monthly, wealth is yearly"],
    correctAnswer: 1,
    explanation: "Income is what you earn (salary, wages), while wealth is what you accumulate (net worth, assets). You can have high income but low wealth if you don't save!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is generational wealth?",
    options: ["wealth from your generation", "Wealth passed down through families", "Modern wealth", "Old money"],
    correctAnswer: 1,
    explanation: "Generational wealth is financial assets and resources passed from one generation to the next, creating lasting family prosperity through proper planning and management.",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is asset protection?",
    options: ["Security systems", "Legal strategies to shield assets from creditors", "Insurance only", "Hiding money"],
    correctAnswer: 1,
    explanation: "Asset protection uses legal strategies like trusts, LLCs, and insurance to shield assets from lawsuits, creditors, and claims. Plan before trouble arises!",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is a family office?",
    options: ["Home office for family", "Wealth management firm for ultra-wealthy families", "Family business", "Office building"],
    correctAnswer: 1,
    explanation: "A family office is a private wealth management firm serving ultra-high-net-worth families, handling investments, taxes, estate planning, and philanthropy.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the best wealth-building advice?",
    options: ["Get rich quick", "Consistently save, invest, and learn over time", "Win the lottery", "Inherit money"],
    correctAnswer: 1,
    explanation: "The best wealth-building strategy is consistently saving and investing over long periods, continuously learning, and avoiding get-rich-quick schemes. Time and discipline win!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is compound interest?",
    options: ["Complex interest", "Earning interest on interest over time", "Simple interest", "Doubled interest"],
    correctAnswer: 1,
    explanation: "Compound interest means earning interest on both your principal and previously earned interest. Einstein allegedly called it the 'eighth wonder of the world.' Start early!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is financial independence?",
    options: ["Living alone", "Having enough passive income to cover expenses", "Getting a job", "Moving out"],
    correctAnswer: 1,
    explanation: "Financial independence means your passive income (investments, real estate, business) covers all living expenses. You work by choice, not necessity. The ultimate goal!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is a will?",
    options: ["Willpower", "Legal document directing asset distribution after death", "Testament", "Trust fund"],
    correctAnswer: 1,
    explanation: "A will is a legal document specifying how your assets should be distributed after death and who should care for minor children. Everyone over 18 needs one!",
    difficulty: "easy"
  },
  {
    levelNumber: 10,
    question: "What is the rule of 72?",
    options: ["Retirement age", "Dividing 72 by return rate estimates doubling time", "Investment rule at age 72", "72% savings rate"],
    correctAnswer: 1,
    explanation: "The rule of 72 helps calculate how long it takes money to double: divide 72 by your annual rate of return. At 9% return, money doubles in 8 years (72÷9=8).",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is dollar-cost averaging?",
    options: ["Price averaging", "Investing fixed amounts regularly regardless of price", "Buying at lowest price", "Selling strategy"],
    correctAnswer: 1,
    explanation: "Dollar-cost averaging invests the same amount at regular intervals (monthly, quarterly). Buys more shares when prices are low, fewer when high. Reduces timing risk.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is the difference between revocable and irrevocable trusts?",
    options: ["No difference", "Revocable can be changed, irrevocable cannot", "Revocable is temporary", "Irrevocable costs more"],
    correctAnswer: 1,
    explanation: "Revocable trusts can be modified or dissolved by the grantor. Irrevocable trusts cannot be easily changed but offer better asset protection and tax benefits.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is a charitable remainder trust (CRT)?",
    options: ["Charity savings", "Trust paying income to you, remainder to charity", "Donation account", "Volunteer trust"],
    correctAnswer: 1,
    explanation: "CRT provides income stream to you (or beneficiaries) for specified period, then remainder goes to charity. Gets immediate tax deduction and avoids capital gains on appreciated assets.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is asset location (not allocation)?",
    options: ["Where you buy assets", "Placing assets in optimal account types for tax efficiency", "Asset addresses", "Storage location"],
    correctAnswer: 1,
    explanation: "Asset location puts tax-inefficient investments (bonds, REITs) in tax-deferred accounts and tax-efficient investments (stocks, index funds) in taxable accounts. Can boost returns 0.5-1%.",
    difficulty: "medium"
  },
  {
    levelNumber: 10,
    question: "What is the qualified small business stock (QSBS) exemption?",
    options: ["Small business subsidy", "Exclude up to $10M in gains from qualifying startup stock sales", "Business license", "Startup loan"],
    correctAnswer: 1,
    explanation: "Section 1202 QSBS exemption allows excluding up to $10M (or 10x basis) in capital gains when selling qualified small business stock held 5+ years. Huge benefit for startup investors/founders!",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the step-up in basis at death?",
    options: ["Walking up stairs", "Inherited assets get new basis at market value on death date", "Price increase", "Estate tax"],
    correctAnswer: 1,
    explanation: "Step-up in basis resets inherited assets to fair market value at death, eliminating capital gains tax on appreciation during deceased's lifetime. Powerful wealth transfer tool.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the infinite banking concept?",
    options: ["Unlimited banking", "Using whole life insurance as personal banking system", "Bank ownership", "Cryptocurrency"],
    correctAnswer: 1,
    explanation: "Infinite banking borrows against whole life insurance cash value for purchases, then repays yourself with interest. Controversial strategy with high costs—works for some, not most.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is carried interest?",
    options: ["Interest carried forward", "Performance fee share of profits for fund managers", "Loan interest", "Rolling interest"],
    correctAnswer: 1,
    explanation: "Carried interest (typically 20%) is the profit share fund managers receive beyond management fees. Taxed as long-term capital gains, not ordinary income—controversial tax treatment.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is geographic arbitrage for wealth building?",
    options: ["Currency trading", "Earning in high-income location while living in low-cost location", "Moving money abroad", "Real estate flipping"],
    correctAnswer: 1,
    explanation: "Geographic arbitrage means earning income from high-paying markets (US, EU) while living in low-cost areas (Thailand, Portugal). Dramatically increases savings rate and quality of life.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the dynasty trust strategy?",
    options: ["Family business", "Multi-generational trust avoiding estate tax for 100+ years", "Historical wealth", "Real estate empire"],
    correctAnswer: 1,
    explanation: "Dynasty trusts (in states allowing perpetual trusts) can last for generations, avoiding estate taxes at each generational transfer. Controversial but legal way to preserve family wealth.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "If inflation is 6% and your portfolio return is 8%, what is your approximate real return before tax?",
    options: ["2%", "6%", "8%", "14%"],
    correctAnswer: 0,
    explanation: "Real return is roughly nominal return minus inflation for small values. Here it is about 2%.",
    difficulty: "hard"
  },
  {
    levelNumber: 6,
    question: "Why can sequence-of-returns risk hurt retirees even when long-term average returns look good?",
    options: ["Because inflation disappears", "Early negative returns combined with withdrawals can permanently reduce portfolio longevity", "Because bonds always fail", "Because dividends stop"],
    correctAnswer: 1,
    explanation: "Large losses early in retirement, while withdrawing, can damage the portfolio so much that later gains cannot fully recover it.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "What is the main purpose of tax-loss harvesting in a taxable portfolio?",
    options: ["Increase dividends", "Use realized losses to offset gains and potentially reduce taxes", "Avoid all taxes forever", "Convert stocks to bonds"],
    correctAnswer: 1,
    explanation: "Tax-loss harvesting realizes losses that can offset capital gains and sometimes a limited amount of ordinary income.",
    difficulty: "hard"
  },
  {
    levelNumber: 7,
    question: "A bond has duration of 7. If yields rise by 1%, what is the approximate price impact?",
    options: ["+7%", "-7%", "+1%", "No change"],
    correctAnswer: 1,
    explanation: "Duration estimates sensitivity: price change is approximately negative duration times yield change, so about -7%.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "What does a low expense ratio primarily improve for long-term investors?",
    options: ["Daily volatility", "Net compounded returns after fees", "Tax bracket", "FDIC insurance"],
    correctAnswer: 1,
    explanation: "Lower recurring costs leave more return invested each year, which compounds into a meaningful long-term difference.",
    difficulty: "hard"
  },
  {
    levelNumber: 8,
    question: "Which metric best captures risk-adjusted return among similar portfolios?",
    options: ["Sharpe ratio", "Dividend yield", "Price-to-book", "Coupon rate"],
    correctAnswer: 0,
    explanation: "Sharpe ratio compares excess return to volatility, helping evaluate return per unit of risk.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "In options, what does implied volatility most directly represent?",
    options: ["Past realized volatility", "Market expectation of future volatility embedded in option prices", "Interest rate risk", "Dividend payout"],
    correctAnswer: 1,
    explanation: "Implied volatility is derived from option prices and reflects the market's expected future price movement magnitude.",
    difficulty: "hard"
  },
  {
    levelNumber: 9,
    question: "Why is concentration risk dangerous even in a high-conviction portfolio?",
    options: ["Because diversification guarantees profits", "A single adverse event can severely damage total wealth", "Because ETFs are illegal", "Because cash has no risk"],
    correctAnswer: 1,
    explanation: "Concentration can amplify upside and downside. One major negative event can materially impair portfolio value.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What is the primary downside of high leverage in investing?",
    options: ["Lower transaction speed", "Amplified losses that can trigger liquidation", "Guaranteed lower returns", "Fewer tax forms"],
    correctAnswer: 1,
    explanation: "Leverage magnifies gains and losses. Large adverse moves can lead to margin calls and forced selling.",
    difficulty: "hard"
  },
  {
    levelNumber: 10,
    question: "What does correlation close to 1 between two assets imply?",
    options: ["They move mostly together", "They always move opposite", "They are risk-free", "They have equal returns"],
    correctAnswer: 0,
    explanation: "Correlation near 1 means assets tend to move in the same direction, reducing diversification benefit between them.",
    difficulty: "hard"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🗑️  Clearing existing data...');
    await Level.deleteMany({});
    await Question.deleteMany({});
    
    console.log('🌱 Seeding levels...');
    await Level.insertMany(levels);
    
    console.log('🌱 Seeding questions...');
    await Question.insertMany(questions);
    
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${levels.length} levels`);
    console.log(`❓ Created ${questions.length} questions`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
