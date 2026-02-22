const mongoose = require('mongoose');
const Scenario = require('./models/Scenario');

const scenarios = [
  {
    scenarioNumber: 1,
    title: "Financial Emergency: Medical Crisis",
    description: "Navigate through a family medical emergency and make critical financial decisions",
    icon: "🚨",
    category: "Emergency",
    introduction: "Your father has been hospitalized unexpectedly. You have ₹50,000 in your account, and the initial hospital bill is ₹80,000. Navigate this crisis by making smart financial decisions.",
    totalQuestions: 10,
    rewardPoints: 500,
    questions: [
      {
        questionNumber: 1,
        questionType: "yes-no",
        situation: "Day 1: Your father has been admitted to the ICU. The hospital asks for ₹80,000 immediately. You have ₹50,000 in savings.",
        question: "Should you immediately break your Fixed Deposit (FD) of ₹40,000 which matures in 3 months to cover the bill?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Current savings: ₹50,000. FD: ₹40,000 (matures in 3 months). Hospital bill: ₹80,000.",
        explanation: "Breaking FD early will incur a penalty of 1-2% and loss of interest. First, check if hospital accepts payment in installments, use your health insurance if available, or take a medical emergency loan which has lower interest than FD penalty. Your health insurance should be the first option.",
        nextQuestionContext: "You check your father's health insurance policy..."
      },
      {
        questionNumber: 2,
        questionType: "mcq",
        situation: "You find out your father has a health insurance policy with ₹5 lakh coverage. The hospital is asking for payment upfront.",
        question: "What should be your immediate action?",
        options: [
          "Pay from savings and claim reimbursement later",
          "Inform hospital about insurance and ask for cashless hospitalization",
          "Take a personal loan to pay the bill",
          "Ask relatives for money"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Savings: ₹50,000. Insurance coverage: ₹5,00,000. Hospital bill: ₹80,000.",
        explanation: "Always inform the hospital about insurance IMMEDIATELY and request cashless hospitalization. Most hospitals have tie-ups with insurance companies. This way, the insurance company directly settles with the hospital, and you don't need to use your savings at all. Keep your savings for other expenses during recovery.",
        nextQuestionContext: "The hospital approves cashless treatment. Now you need to arrange money for daily expenses during your father's recovery..."
      },
      {
        questionNumber: 3,
        questionType: "mcq",
        situation: "Your father will be hospitalized for 15 days. You need ₹20,000 for medicines, food, and travel expenses that insurance doesn't cover.",
        question: "What's the smartest way to arrange this ₹20,000?",
        options: [
          "Use credit card and pay later with interest",
          "Borrow from friends and family at zero interest",
          "Use your emergency fund (if you have one) specifically meant for such situations",
          "Take a high-interest personal loan"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your savings: ₹50,000. Required: ₹20,000 for expenses. Credit card limit: ₹1,00,000.",
        explanation: "Emergency fund is meant for exactly such situations. Using ₹20,000 from your ₹50,000 savings is the right choice. You'll still have ₹30,000 left for other emergencies. Avoid credit card debt or loans with interest when you have sufficient savings. This is what emergency funds are for!",
        nextQuestionContext: "You use ₹20,000 from savings. Three friends offer to help financially..."
      },
      {
        questionNumber: 4,
        questionType: "yes-no",
        situation: "Three friends offered to lend you ₹10,000 each (₹30,000 total) interest-free to help during this crisis. You still have ₹30,000 in your account.",
        question: "Should you accept their money even though you have ₹30,000 left?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your remaining savings: ₹30,000. Estimated remaining expenses: ₹15,000. Friends' offer: ₹30,000 interest-free.",
        explanation: "Don't borrow money you don't need! You have ₹30,000 and need only ₹15,000 more approximately. Taking unnecessary debt creates social obligation even if it's interest-free. Politely thank them and say you'll ask if needed. Keep borrowing as an absolute last resort. Financial independence matters.",
        nextQuestionContext: "Your father is recovering well. On day 10, the hospital mentions an optional advanced treatment..."
      },
      {
        questionNumber: 5,
        questionType: "mcq",
        situation: "Day 10: Doctor suggests an optional advanced treatment costing ₹1,50,000 that could speed recovery by 1 week. Your father will recover anyway without it, just takes longer.",
        question: "What should you do?",
        options: [
          "Take the treatment immediately - health is priceless",
          "Discuss with doctor if it's medically necessary or just faster recovery",
          "Take a loan and go for the treatment",
          "Refuse completely without discussion"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your remaining savings: ₹30,000. Treatment cost: ₹1,50,000. Insurance may not cover optional treatments.",
        explanation: "Always discuss with doctors openly! Ask: Is this medically necessary or just convenience? What are the risks of not taking it? If recovery is guaranteed without it, spending ₹1.5 lakh for saving 1 week may not be financially wise. Get a second opinion. Don't make emotional financial decisions under pressure. Health is important, but avoid unnecessary expensive treatments.",
        nextQuestionContext: "After discussion, doctor confirms it's optional. You decide to continue regular treatment. Your father is discharged on day 15..."
      },
      {
        questionNumber: 6,
        questionType: "yes-no",
        situation: "Day 15: Your father is discharged! Total insurance claim: ₹75,000 (cashless). Your expenses: ₹22,000 from savings. A medical equipment company is offering a '₹5,000 discount today only' on a home health monitoring device costing ₹25,000.",
        question: "Should you buy this device right now with the discount?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your remaining savings: ₹28,000. Device cost: ₹25,000 (with discount). Regular price: ₹30,000.",
        explanation: "NO! This is a classic sales pressure tactic. After a medical emergency, you need to rebuild your emergency fund, not spend it on 'discounted' devices. Ask doctor if this device is necessary. Most home monitoring (BP, sugar) can be done at local medical shops for ₹20-50. Don't deplete emergency funds for non-essential purchases, even with discounts.",
        nextQuestionContext: "You wisely decline the device. Two weeks later, your father is recovering at home..."
      },
      {
        questionNumber: 7,
        questionType: "mcq",
        situation: "Week 3: Your father needs follow-up medicines costing ₹3,000/month for 6 months. Some are expensive branded medicines.",
        question: "What should you do about medicine costs?",
        options: [
          "Buy branded medicines as prescribed without question",
          "Ask doctor if generic alternatives (Jan Aushadhi) are available - same effectiveness, lower cost",
          "Skip some medicines to save money",
          "Buy only 1 month and see if needed later"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Monthly medicine cost: ₹3,000 for branded. Generic alternatives: ~₹800. Your current savings: ₹28,000.",
        explanation: "Always ask doctors about generic alternatives! Jan Aushadhi Kendras offer generic medicines at 50-90% lower cost with SAME effectiveness. Doctors usually prescribe branded out of habit. Generic medicines have same composition. This can save you ₹2,200/month × 6 = ₹13,200! Never skip medicines or reduce course duration without doctor's advice.",
        nextQuestionContext: "You switch to generics, saving ₹2,200/month. Now you're thinking about future preparedness..."
      },
      {
        questionNumber: 8,
        questionType: "yes-no",
        situation: "After this experience, you realize the importance of being prepared. You have ₹25,000 in savings now.",
        question: "Should you immediately buy a health insurance policy for yourself (₹500/month premium) even though you're young and healthy?",
        options: ["Yes", "No"],
        correctAnswer: true,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your age: 22 years. Premium: ₹500/month (₹6,000/year). Current savings: ₹25,000. Monthly income: ₹30,000.",
        explanation: "YES! Health insurance is CHEAPEST when you're young and healthy. At 22, ₹500/month gets you ₹5-10 lakh coverage. If you wait till 35, same coverage costs ₹1,500/month. Plus, pre-existing diseases get excluded if you buy late. ₹6,000/year is small compared to potential ₹5 lakh hospital bills. This crisis taught you the importance of insurance!",
        nextQuestionContext: "You buy a ₹5 lakh health insurance policy. Three months later, your finances are recovering..."
      },
      {
        questionNumber: 9,
        questionType: "mcq",
        situation: "3 months later: Your savings are back to ₹40,000. Your father is fully recovered. You receive a bonus of ₹30,000 at work.",
        question: "What's the smartest way to use this ₹30,000 bonus?",
        options: [
          "Celebrate and spend on gadgets/shopping",
          "Rebuild emergency fund to 6 months' expenses (₹1,80,000 target)",
          "Invest entirely in high-risk stocks for quick returns",
          "Give it to parents for household expenses"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Current savings: ₹40,000. Bonus: ₹30,000. Monthly expenses: ₹30,000. Emergency fund goal: 6 months = ₹1,80,000.",
        explanation: "Rebuild your emergency fund FIRST! This crisis showed you need 6 months' expenses (₹1,80,000) as a safety net. Add ₹30,000 to your ₹40,000 = ₹70,000. Keep building till ₹1,80,000. Emergency fund should be in liquid assets (savings account, liquid mutual funds), NOT stocks. Only after emergency fund is complete, invest in stocks or spend on wants.",
        nextQuestionContext: "You add to emergency fund: ₹70,000 now. Final reflection on this journey..."
      },
      {
        questionNumber: 10,
        questionType: "mcq",
        situation: "Final reflection: You've learned so much from this crisis. Your father is healthy, you have ₹70,000 saved, and health insurance for both of you.",
        question: "Looking back, what was the MOST important financial lesson from this crisis?",
        options: [
          "Health insurance is mandatory, not optional",
          "Emergency fund of 6 months' expenses is crucial",
          "Don't take emotional financial decisions under pressure",
          "All of the above - Preparation, Insurance, and Smart Decision-Making"
        ],
        correctAnswer: 3,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Journey: Started with ₹50,000 savings, No health insurance. Now: ₹70,000 savings, Health insurance for 2, Emergency preparedness.",
        explanation: "ALL OF THE ABOVE! This crisis taught you: (1) Health insurance saves lakhs - ₹5L coverage for ₹6k/year. (2) Emergency fund prevents panic - you had savings to handle extra expenses. (3) Smart decisions under pressure - chose cashless over loans, generic over branded, and rebuilding over spending. Financial literacy isn't just about earning money, it's about being PREPARED for life's emergencies. You handled this crisis beautifully!",
        nextQuestionContext: "Congratulations! You successfully navigated a medical emergency with smart financial decisions. You're now better prepared for future challenges!"
      }
    ]
  },
  {
    scenarioNumber: 2,
    title: "Startup or Stability: Career Choice",
    description: "You have a stable job offer vs. a startup opportunity. Make crucial career and financial decisions.",
    icon: "🚀",
    category: "Career",
    introduction: "You're 25, working in a company earning ₹6 LPA. You get two opportunities: (1) A stable bank job at ₹8 LPA, or (2) A startup offering ₹5 LPA + 0.5% equity. Navigate this critical career decision with smart financial planning.",
    totalQuestions: 10,
    rewardPoints: 500,
    questions: [
      {
        questionNumber: 1,
        questionType: "mcq",
        situation: "Day 1: You receive offers: (A) Bank job - ₹8 LPA, stable, good benefits. (B) Startup - ₹5 LPA + 0.5% equity, exciting work, uncertain future. Current job: ₹6 LPA.",
        question: "What should be your FIRST step before deciding?",
        options: [
          "Accept the higher salary bank job immediately",
          "Accept the exciting startup offer immediately",
          "Analyze your financial situation, expenses, savings, and family responsibilities",
          "Quit current job and take a break to think"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Current salary: ₹6 LPA (₹50,000/month). Savings: ₹2,00,000. Monthly expenses: ₹30,000. EMI: None. Dependents: None.",
        explanation: "NEVER make career decisions based only on salary! First, analyze your situation: (1) Monthly expenses vs. income, (2) Savings buffer, (3) Family financial responsibilities, (4) Career goals, (5) Risk appetite. Only after understanding your financial position can you evaluate if you can afford the lower startup salary or need the stability of bank job. Financial awareness before career decisions!",
        nextQuestionContext: "You analyze your finances. You realize you can afford a ₹5 LPA job for 1-2 years as you have no major financial obligations..."
      },
      {
        questionNumber: 2,
        questionType: "yes-no",
        situation: "Your friend advises: 'Always join startups when you're young! Equity can make you rich! Don't worry about lower salary.' Should you follow this advice blindly?",
        question: "Is this advice correct for everyone?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Startup salary: ₹5 LPA (₹41,666/month). Your expenses: ₹30,000/month. Savings: ₹2,00,000.",
        explanation: "NO! Generic advice doesn't work for everyone. Startup is good IF: (1) You have 6-12 months emergency fund, (2) No major financial responsibilities (EMIs, dependents), (3) Can survive on lower salary, (4) Passionate about startup's mission, (5) Young with time to recover. If you have EMI, parents depending on you, or no savings - stable job is smarter. Assess YOUR situation, not friend's situation!",
        nextQuestionContext: "You carefully evaluate both offers based on YOUR situation..."
      },
      {
        questionNumber: 3,
        questionType: "mcq",
        situation: "You shortlist key factors. Startup founder says: '0.5% equity means ₹50 lakhs if company reaches ₹100 crore valuation in 5 years!' Bank job has pension and job security.",
        question: "How should you evaluate the startup's equity offer?",
        options: [
          "Believe the founder's valuation promise - ₹50 lakhs is huge!",
          "Ignore equity completely, it's worthless",
          "Assume equity value is ZERO until company actually succeeds. Don't make decisions based on uncertain future money.",
          "Calculate monthly loss of ₹25,000 salary (₹8L - ₹5L = ₹3L/year) without considering other factors"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Bank job: ₹8 LPA guaranteed. Startup: ₹5 LPA guaranteed + equity (value uncertain). Difference: ₹3 LPA = ₹25,000/month less.",
        explanation: "Treat equity as ZERO until it actually gives returns! 90% startups fail. 9% survive but don't give returns. Only 1% succeed. Founder's '₹100 crore valuation' is a dream, not reality. Make decision on ₹5 LPA salary only. If startup succeeds, equity is a bonus. But don't sacrifice ₹3 lakhs/year CERTAIN money for uncertain future equity. Financial planning needs realistic assumptions, not dreams!",
        nextQuestionContext: "You decide to treat equity as zero and focus on guaranteed salary. Now considering other factors..."
      },
      {
        questionNumber: 4,
        questionType: "mcq",
        situation: "You compare: Bank (₹8L, stable, 9-6 job, good work-life balance) vs Startup (₹5L, uncertain, long hours, exciting work, learning opportunities). Your passion is technology.",
        question: "Which factor should weigh MOST in your decision?",
        options: [
          "Only salary - choose ₹8 LPA bank job",
          "Only passion - choose ₹5 LPA startup",
          "Balance: Can you afford startup financially + Does it align with career goals?",
          "Choose based on what friends/family say"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your monthly expenses: ₹30,000. Startup salary: ₹41,666/month (₹11,666 savings potential). Bank salary: ₹66,666/month (₹36,666 savings potential).",
        explanation: "Career decisions need BOTH financial and personal analysis! Ask: (1) Can I survive financially on ₹5L? YES (₹11k savings/month). (2) Is this work aligned with my career goals? If yes, then startup makes sense. (3) What's the opportunity cost? You lose ₹3L/year but gain startup experience. If both financially feasible AND aligned with goals, choose passion. But if financially risky, choose stability first!",
        nextQuestionContext: "You realize you CAN afford the startup and it aligns with your tech career goals. You decide to join the startup..."
      },
      {
        questionNumber: 5,
        questionType: "yes-no",
        situation: "Decision made: You're joining the startup! Salary drops from ₹6 LPA to ₹5 LPA. Your lifestyle costs ₹30,000/month (dining out, shopping, subscriptions, gym).",
        question: "Should you continue the same ₹30,000/month lifestyle?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "New salary: ₹41,666/month. Current lifestyle: ₹30,000/month. Savings per month: ₹11,666 only.",
        explanation: "NO! Lower salary means lifestyle adjustment! ₹11,666/month savings is just ₹1.4 lakhs/year - too low for emergency fund building. Reduce discretionary spending to ₹20,000/month to save ₹21,666/month. Cut unnecessary subscriptions, reduce dining out, find cheaper alternatives. Lifestyle should match income. This isn't permanent - once you're financially stable or get a raise, you can upgrade lifestyle again. Short-term sacrifice for long-term goals!",
        nextQuestionContext: "You wisely reduce lifestyle costs to ₹20,000/month. Six months into the startup..."
      },
      {
        questionNumber: 6,
        questionType: "mcq",
        situation: "Month 6: Startup is growing well! Founder offers you an opportunity to 'invest' ₹5 lakhs and get 2% more equity (total 2.5% equity). You have ₹3 lakhs saved.",
        question: "What should you do?",
        options: [
          "Invest all ₹3 lakhs + borrow ₹2 lakhs to get this 'opportunity'",
          "Invest ₹3 lakhs savings completely",
          "Politely decline - don't invest money you can't afford to lose completely",
          "Invest ₹1 lakh and keep ₹2 lakhs as emergency fund"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your savings: ₹3,00,000. Investment ask: ₹5,00,000 for extra 2% equity. Emergency fund target: 6 months = ₹1,80,000.",
        explanation: "DECLINE THE OFFER! Never invest money you can't afford to lose completely! Your ₹3 lakhs is your ONLY safety net. You're already taking risk by working at lower salary. Investing savings means zero emergency fund. Rule: First build 6 months emergency fund, THEN invest in high-risk assets. Even ₹1 lakh investment is risky. If startup values employees, they'd give you equity as bonus, not ask for investment. Red flag!",
        nextQuestionContext: "You decline the investment. Founder respects your decision. Month 9: Your friend from bank job (₹8 LPA) bought a new car (₹7 lakhs loan)..."
      },
      {
        questionNumber: 7,
        questionType: "yes-no",
        situation: "Month 9: Your bank friend bought a car (₹7L loan, ₹15,000 EMI/month). He earns ₹8 LPA, you earn ₹5 LPA. You feel left behind. Should you also take a car loan to 'keep up'?",
        question: "Should you take a car loan now?",
        options: ["Yes", "No"],
        correctAnswer: false,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Your salary: ₹41,666/month. Potential car EMI: ₹15,000/month. Current savings: ₹11,666/month. EMI would leave ₹26,666 for all expenses.",
        explanation: "Absolutely NO! This is 'lifestyle creep' and comparison trap! Your friend earns ₹66k/month, can afford ₹15k EMI. You earn ₹41k/month - ₹15k EMI means ₹26k left for EVERYTHING (rent, food, expenses, savings). You'll have ZERO savings and one emergency will destroy you financially. Never compare with others earning more! Your financial goals are different. Buy car when you can afford it comfortably, not to impress others. Focus on YOUR journey!",
        nextQuestionContext: "You resist peer pressure and avoid the loan. Smart move! Month 12: Startup gets funding! Founder announces 20% salary hike for all employees..."
      },
      {
        questionNumber: 8,
        questionType: "mcq",
        situation: "Month 12: Great news! Startup raised funding. Your salary increases 20%: ₹5 LPA → ₹6 LPA (₹50,000/month). You now earn the same as your old job but gained valuable startup experience!",
        question: "How should you use this ₹8,333/month salary increase?",
        options: [
          "Upgrade lifestyle immediately - now you can afford it!",
          "Split smartly: 50% increase savings (₹4,166), 50% lifestyle (₹4,166)",
          "Save 100% of the increase - maintain same lifestyle",
          "Invest it all in cryptocurrency for higher returns"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Old salary: ₹41,666/month. New salary: ₹50,000/month. Increase: ₹8,333/month. Current lifestyle: ₹20,000/month. Current savings: ₹21,666/month.",
        explanation: "SMART SPLIT - 50-50 rule! Financial success isn't about extreme sacrifice. Split salary increases: 50% boost savings (₹4,166 more = ₹25,832/month savings), 50% improve lifestyle (₹4,166 more = ₹24,166 expenses). This way you build wealth AND enjoy life. If you save everything, you'll burn out. If you spend everything, no financial progress. Balance is key! Your new savings rate: ₹3.1 lakhs/year - much better!",
        nextQuestionContext: "You implement the 50-50 split. Month 18: Company is doing really well. LinkedIn messages flood in with job offers..."
      },
      {
        questionNumber: 9,
        questionType: "mcq",
        situation: "Month 18: A big tech company offers you ₹12 LPA to join them. That's 2X your current ₹6 LPA! Your startup is doing well, you have 0.5% equity, and you're learning a lot.",
        question: "What factors should you consider?",
        options: [
          "Accept immediately - ₹12 LPA is double the salary!",
          "Reject immediately - loyalty to startup matters",
          "Evaluate: Financial growth opportunity vs Career growth opportunity vs Future equity value vs Learning opportunities",
          "Negotiate with startup to match ₹12 LPA"
        ],
        correctAnswer: 2,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "Current: ₹6 LPA + 0.5% equity + high learning. Offer: ₹12 LPA + corporate experience + stability. Increase: ₹6 LPA more = ₹50,000/month extra.",
        explanation: "EVALUATE ALL FACTORS, not just salary! Consider: (1) Financial: ₹6L more/year is significant. (2) Career: Startup role vs Big Tech role - which helps long-term career? (3) Learning: Are you still learning or plateauing? (4) Equity: Is startup likely to succeed? (5) Life stage: Any financial pressures? THEN decide. If you've learned enough and need faster financial growth, switch. If equity has real potential and you're learning, stay. No right/wrong, only right for YOUR situation!",
        nextQuestionContext: "You evaluate carefully. Your startup is pre-profitability, equity value is uncertain, but learning is immense. You also want faster financial growth..."
      },
      {
        questionNumber: 10,
        questionType: "mcq",
        situation: "Final decision time: After deep thought, you need to choose. You're 26 now, want to buy house at 30 (need down payment), also want to continue learning.",
        question: "What's the wisest decision considering your financial goal (house) and career goal (learning)?",
        options: [
          "Stay at startup - loyalty and equity potential",
          "Join big tech - ₹12 LPA helps save for house faster, can learn there too",
          "Negotiate with startup - ask for ₹9 LPA, stay if they match",
          "Start your own startup - maximum learning and equity"
        ],
        correctAnswer: 1,
        correctPoints: 50,
        wrongPenalty: 25,
        virtualMoneyContext: "House down payment needed by 30: ₹20 lakhs. Current age: 26. Time: 4 years. At ₹6 LPA: Can save ~₹2.5L/year = ₹10L in 4 years (not enough). At ₹12 LPA: Can save ~₹6L/year = ₹24L in 4 years (enough!).",
        explanation: "Join Big Tech! Here's why: (1) Financial: ₹12L helps you save ₹6L/year → ₹24L in 4 years = house down payment achieved! At ₹6L, you'll save only ₹10L = goal missed. (2) Career: Big tech also offers learning, different experience than startup. (3) Risk: You've already taken startup risk for 18 months, gained experience. Now reduce risk, increase savings. (4) Equity value: 0.5% in unproven startup is speculation, not financial planning. Congratulations on thinking through this completely! You made data-driven career choice aligned with financial goals!",
        nextQuestionContext: "Congratulations! You navigated a complex career choice by balancing passion, financial goals, risk tolerance, and life stage. You're now earning ₹12 LPA with valuable startup experience on your resume. You're set up for success!"
      }
    ]
  }
];

mongoose.connect('mongodb://localhost:27017/finmaster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  // Clear existing scenarios
  await Scenario.deleteMany({});
  console.log('Cleared existing scenarios');
  
  // Insert new scenarios
  await Scenario.insertMany(scenarios);
  console.log('Scenarios seeded successfully!');
  console.log(`✅ Scenario 1: ${scenarios[0].title} - ${scenarios[0].totalQuestions} questions`);
  console.log(`✅ Scenario 2: ${scenarios[1].title} - ${scenarios[1].totalQuestions} questions`);
  
  mongoose.connection.close();
  console.log('Database connection closed');
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
