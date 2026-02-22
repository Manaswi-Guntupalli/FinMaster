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
