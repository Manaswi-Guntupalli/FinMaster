const mongoose = require('mongoose');
require('dotenv').config();
const Blog = require('./models/Blog');
const User = require('./models/User');

// Sample blogs data
const sampleBlogs = [
  {
    title: "Understanding Credit Scores: Your Financial Report Card",
    excerpt: "Learn how credit scores work in India, why they matter, and simple strategies to build and maintain a healthy credit score from your early twenties.",
    content: `
      <h2>What is a Credit Score?</h2>
      <p>A credit score is a three-digit number that represents your creditworthiness. In India, scores typically range from 300 to 900, with anything above 750 considered excellent. Think of it as your financial report card that lenders check before giving you loans or credit cards.</p>
      
      <h2>Why Does Your Credit Score Matter?</h2>
      <p>Your credit score affects:</p>
      <ul>
        <li><strong>Loan Approvals:</strong> Higher scores mean easier approval for home loans, car loans, and personal loans</li>
        <li><strong>Interest Rates:</strong> Better scores can save you lakhs in interest over time</li>
        <li><strong>Credit Card Limits:</strong> Good scores lead to higher limits and better rewards</li>
        <li><strong>Rental Applications:</strong> Some landlords check credit scores</li>
      </ul>
      
      <h2>How to Build a Good Credit Score</h2>
      <h3>1. Start Early with a Credit Card</h3>
      <p>Get a student or entry-level credit card in your early twenties. Use it for small purchases and pay the full amount on time every month.</p>
      
      <h3>2. Pay Bills On Time, Always</h3>
      <p>Payment history is the most important factor (35% of your score). Set up auto-pay for credit card bills, EMIs, and utility payments to never miss a due date.</p>
      
      <h3>3. Keep Credit Utilization Low</h3>
      <p>Try to use less than 30% of your credit limit. If your card has a ₹50,000 limit, keep spending below ₹15,000 monthly.</p>
      
      <h3>4. Don't Apply for Multiple Cards/Loans</h3>
      <p>Each application creates a "hard inquiry" that temporarily lowers your score. Space out applications by at least 6 months.</p>
      
      <h2>Common Myths Debunked</h2>
      <blockquote>
        <p>"Checking my own credit score will lower it" - FALSE! Checking your own score is a "soft inquiry" and doesn't affect it.</p>
      </blockquote>
      
      <blockquote>
        <p>"I need to carry a balance to build credit" - FALSE! Pay your full balance every month. Carrying a balance only costs you interest.</p>
      </blockquote>
      
      <h2>Free Credit Score Checks in India</h2>
      <p>You can check your credit score for free once a year from:</p>
      <ul>
        <li>CIBIL - www.cibil.com</li>
        <li>Experian - www.experian.in</li>
        <li>Equifax - www.equifax.co.in</li>
        <li>CRIF High Mark - www.crifhighmark.com</li>
      </ul>
      
      <h2>Action Steps for Students & Young Professionals</h2>
      <ol>
        <li>Apply for your first credit card (secured card if you're new)</li>
        <li>Set up automatic payments for all bills</li>
        <li>Check your credit score every 6 months</li>
        <li>Keep documentation of all loan payments</li>
        <li>Dispute any errors on your credit report immediately</li>
      </ol>
      
      <p><strong>Remember:</strong> Building good credit is a marathon, not a sprint. Start early, stay consistent, and your future self will thank you when you're applying for that dream home loan!</p>
    `,
    tags: ["Credit Score", "Financial Health", "Credit Cards", "Loans", "CIBIL"]
  },
  {
    title: "The Power of Compound Interest: Why Starting Early Matters",
    excerpt: "Discover how compound interest can turn small monthly investments into crorepatis. Learn the magic formula that Einstein called the 'eighth wonder of the world' and why your 20s are crucial.",
    content: `
      <h2>What is Compound Interest?</h2>
      <p>Compound interest is when you earn interest not just on your initial investment, but also on the interest you've already earned. It's like a snowball rolling down a hill - it gets bigger and bigger as it picks up more snow!</p>
      
      <h3>The Formula (Don't Worry, It's Simple!)</h3>
      <p><strong>A = P(1 + r/n)^(nt)</strong></p>
      <p>Where:</p>
      <ul>
        <li>A = Final amount</li>
        <li>P = Principal (initial investment)</li>
        <li>r = Annual interest rate (as decimal)</li>
        <li>n = Number of times interest is compounded per year</li>
        <li>t = Time in years</li>
      </ul>
      
      <h2>Real Example: The Power of Starting Early</h2>
      
      <h3>Scenario 1: Priya (Starts at 22)</h3>
      <ul>
        <li>Invests ₹5,000 per month</li>
        <li>12% annual return (realistic for equity mutual funds)</li>
        <li>Invests until age 60 (38 years)</li>
        <li><strong>Total invested: ₹22.8 lakhs</strong></li>
        <li><strong>Final corpus: ₹2.89 CRORES!</strong></li>
      </ul>
      
      <h3>Scenario 2: Rahul (Starts at 32)</h3>
      <ul>
        <li>Invests ₹5,000 per month</li>
        <li>12% annual return</li>
        <li>Invests until age 60 (28 years)</li>
        <li><strong>Total invested: ₹16.8 lakhs</strong></li>
        <li><strong>Final corpus: ₹88.5 lakhs</strong></li>
      </ul>
      
      <blockquote>
        <p>By starting just 10 years earlier, Priya ends up with 3.3X more money, even though she only invested ₹6 lakhs more!</p>
      </blockquote>
      
      <h2>The 8th Wonder of the World</h2>
      <p>Albert Einstein reportedly said: <em>"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."</em></p>
      
      <p>This means compound interest works both ways:</p>
      <ul>
        <li><strong>FOR you:</strong> When investing in mutual funds, FDs, stocks</li>
        <li><strong>AGAINST you:</strong> When carrying credit card debt (18-36% interest!)</li>
      </ul>
      
      <h2>Practical Ways to Harness Compound Interest</h2>
      
      <h3>1. Start a SIP in Mutual Funds</h3>
      <p>Systematic Investment Plan - invest as little as ₹500/month. Apps like Groww, Zerodha, Paytm Money make it easy.</p>
      
      <h3>2. Use Your PPF (Public Provident Fund)</h3>
      <p>Tax-free returns of ~7-8% annually. Lock-in period of 15 years. Perfect for long-term goals.</p>
      
      <h3>3. Don't Break Fixed Deposits Early</h3>
      <p>Let them mature to get the full compounding benefit. Most FDs compound quarterly.</p>
      
      <h3>4. Reinvest Dividends</h3>
      <p>Choose "Growth" option in mutual funds instead of "Dividend" to let your money compound faster.</p>
      
      <h2>The Rule of 72</h2>
      <p>Quick formula to know when your money will double:</p>
      <p><strong>Years to double = 72 ÷ Interest Rate</strong></p>
      
      <p>Examples:</p>
      <ul>
        <li>At 8% return: 72 ÷ 8 = 9 years to double</li>
        <li>At 12% return: 72 ÷ 12 = 6 years to double</li>
        <li>At 18% return: 72 ÷ 18 = 4 years to double</li>
      </ul>
      
      <h2>Your Action Plan (Start TODAY!)</h2>
      <ol>
        <li><strong>This Month:</strong> Start a SIP of ₹500-₹1,000 in an index fund</li>
        <li><strong>This Quarter:</strong> Open a PPF account, deposit ₹12,000 (gets tax deduction too!)</li>
        <li><strong>This Year:</strong> Increase SIP by 10% every year (use Step-Up SIP feature)</li>
        <li><strong>Every Year:</strong> Invest any bonus, gifts, or tax refunds instead of spending</li>
      </ol>
      
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Waiting for the "perfect time" - there isn't one, start NOW</li>
        <li>Stopping SIPs during market crashes (worst mistake!)</li>
        <li>Withdrawing early and breaking the compounding chain</li>
        <li>Not increasing investment amount as salary grows</li>
      </ul>
      
      <p><strong>Bottom Line:</strong> Time in the market beats timing the market. The best time to plant a tree was 20 years ago. The second-best time is TODAY. Start your compounding journey now! 🚀</p>
    `,
    tags: ["Investing", "Compound Interest", "SIP", "Mutual Funds", "Wealth Building", "Personal Finance"]
  },
  {
    title: "Budgeting 101: The 50/30/20 Rule for Indian Youth",
    excerpt: "Master your money with the simple 50/30/20 budgeting rule. Perfect for students, first-jobbers, and young professionals earning between ₹20k to ₹1L per month. Includes Indian examples!",
    content: `
      <h2>What is the 50/30/20 Rule?</h2>
      <p>It's the simplest budgeting framework that divides your after-tax income into three categories:</p>
      <ul>
        <li><strong>50% - Needs:</strong> Essential expenses you can't avoid</li>
        <li><strong>30% - Wants:</strong> Things you desire but don't need</li>
        <li><strong>20% - Savings:</strong> Emergency fund, investments, debt repayment</li>
      </ul>
      
      <h2>Breaking Down Each Category</h2>
      
      <h3>🏠 Needs (50%) - The Non-Negotiables</h3>
      <p>These are expenses required for basic survival and work:</p>
      <ul>
        <li>Rent (PG, flat share, or contribution to parents)</li>
        <li>Groceries and home-cooked food</li>
        <li>Transportation (metro pass, bike EMI, petrol)</li>
        <li>Utilities (electricity, water, internet, mobile bill)</li>
        <li>Health insurance premium</li>
        <li>Medicine and basic healthcare</li>
        <li>Minimum debt payments (education loan EMI)</li>
      </ul>
      <p><em>If needs exceed 50%, look for roommates, cook more at home, or take public transport.</em></p>
      
      <h3>🎉 Wants (30%) - The Fun Stuff</h3>
      <p>These make life enjoyable but aren't essential:</p>
      <ul>
        <li>Dining out, cafes, food delivery</li>
        <li>OTT subscriptions (Netflix, Prime, Hotstar)</li>
        <li>Shopping (clothes, gadgets, accessories)</li>
        <li>Entertainment (movies, concerts, trips)</li>
        <li>Gym membership, sports, hobbies</li>
        <li>Salon, grooming, self-care</li>
        <li>Gifts for friends and family</li>
      </ul>
      <p><em>This is where you have the most flexibility. Can cut back here if needed.</em></p>
      
      <h3>💰 Savings (20%) - Your Future Self</h3>
      <p>This is the most important category:</p>
      <ul>
        <li>Emergency fund (6 months expenses in FD/savings account)</li>
        <li>SIP in mutual funds</li>
        <li>PPF/EPF contributions (tax-saving!)</li>
        <li>Extra debt payment (credit card, loans)</li>
        <li>Goal-based savings (car, home down payment, wedding)</li>
      </ul>
      <p><em>Pay yourself FIRST - set up auto-debit on salary day!</em></p>
      
      <h2>Real-Life Examples for Indian Youth</h2>
      
      <h3>Example 1: Neha (₹30,000/month in Pune)</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f1f5f9;">
          <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Category</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Needs (50%)</strong></td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;"><strong>₹15,000</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">PG rent</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹8,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Food & groceries</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹4,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Transport (metro)</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹1,500</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Mobile & internet</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹1,500</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Wants (30%)</strong></td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;"><strong>₹9,000</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Eating out</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹3,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Shopping</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹3,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Entertainment</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹2,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">OTT subscriptions</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹1,000</td>
        </tr>
        <tr style="background: #dcfce7;">
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Savings (20%)</strong></td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;"><strong>₹6,000</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">SIP in mutual fund</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹3,000</td>
        </tr>
        <tr>
          <td style="padding: 10px; padding-left: 30px; border: 1px solid #e2e8f0;">Emergency fund</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">₹3,000</td>
        </tr>
      </table>
      
      <h3>Example 2: Arjun (₹60,000/month in Bangalore)</h3>
      <ul>
        <li><strong>Needs (₹30,000):</strong> Rent ₹15k, Food ₹8k, Transport ₹3k, Utilities ₹2k, Insurance ₹2k</li>
        <li><strong>Wants (₹18,000):</strong> Restaurants ₹6k, Weekend trips ₹5k, Shopping ₹4k, Gym ₹3k</li>
        <li><strong>Savings (₹12,000):</strong> SIP ₹5k, PPF ₹4k, Emergency fund ₹3k</li>
      </ul>
      
      <h2>How to Implement This Rule</h2>
      
      <h3>Step 1: Track Expenses for 1 Month</h3>
      <p>Use apps like:</p>
      <ul>
        <li>Walnut (automatically reads SMS)</li>
        <li>Money Manager</li>
        <li>Google Sheets (manual but flexible)</li>
        <li>ET Money</li>
      </ul>
      
      <h3>Step 2: Categorize Everything</h3>
      <p>Go through each expense and mark as Need, Want, or Savings. Be HONEST!</p>
      
      <h3>Step 3: Adjust and Optimize</h3>
      <p>If your split is 65/30/5, you need to:</p>
      <ul>
        <li>Find cheaper housing or add roommates</li>
        <li>Cook more meals at home</li>
        <li>Use public transport instead of cabs</li>
        <li>Cancel unused subscriptions</li>
      </ul>
      
      <h3>Step 4: Automate Savings</h3>
      <p>On salary day:</p>
      <ol>
        <li>Auto-debit for SIP</li>
        <li>Auto-transfer to savings account</li>
        <li>Pay credit card bill</li>
        <li>THEN spend what's left</li>
      </ol>
      
      <h2>When the Rule Doesn't Work</h2>
      
      <h3>Living with Parents?</h3>
      <p>Lucky you! Your needs might be only 20-30%. Try:</p>
      <ul>
        <li><strong>40% Needs</strong> (contribute to household)</li>
        <li><strong>20% Wants</strong> (don't go overboard)</li>
        <li><strong>40% Savings</strong> (supercharge your future!)</li>
      </ul>
      
      <h3>High-Cost City (Mumbai, Bangalore)?</h3>
      <p>Rent is killing you? Consider:</p>
      <ul>
        <li><strong>60% Needs</strong> (temporarily)</li>
        <li><strong>25% Wants</strong></li>
        <li><strong>15% Savings</strong> (minimum, increase ASAP)</li>
      </ul>
      
      <h3>Paying Off Debt?</h3>
      <ul>
        <li><strong>50% Needs</strong></li>
        <li><strong>20% Wants</strong> (sacrifice now, enjoy later)</li>
        <li><strong>30% Savings + Extra Debt Payment</strong></li>
      </ul>
      
      <h2>Pro Tips for Indian Youth</h2>
      
      <ol>
        <li><strong>Track net salary,</strong> not gross (after PF, tax deduction)</li>
        <li><strong>Annual expenses count too!</strong> Divide by 12 (insurance, gifts, vacations)</li>
        <li><strong>Review monthly,</strong> adjust quarterly as salary changes</li>
        <li><strong>Share flats</strong> to keep rent under 30% of income</li>
        <li><strong>Cook in bulk</strong> on weekends, save thousands</li>
        <li><strong>Use credit cards wisely</strong> for rewards, but pay full every month</li>
        <li><strong>Build emergency fund first,</strong> then aggressive investing</li>
      </ol>
      
      <h2>Your Challenge This Month</h2>
      <blockquote>
        <p>📊 Download a budgeting app TODAY and track EVERY rupee for 30 days. You'll be shocked where money disappears. Knowledge is the first step to control!</p>
      </blockquote>
      
      <p><strong>Remember:</strong> The 50/30/20 rule isn't rigid - it's a guideline. Adjust based on your situation, but ALWAYS prioritize the 20% savings. Your future depends on it! 💪</p>
    `,
    tags: ["Budgeting", "50-30-20 Rule", "Money Management", "Personal Finance", "Savings", "Financial Planning"]
  }
];

async function seedBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find or create a default author
    let author = await User.findOne({ email: { $exists: true } }).limit(1);
    
    if (!author) {
      console.log('⚠️  No users found. Creating a default blog author...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('blogauthor123', 10);
      author = await User.create({
        username: 'FinMaster Team',
        email: 'team@finmaster.com',
        password: hashedPassword
      });
      console.log('✅ Created default author: FinMaster Team');
    } else {
      console.log(`✅ Using existing user as author: ${author.username}`);
    }

    // Delete existing blogs (optional - remove this line if you want to keep existing blogs)
    await Blog.deleteMany({});
    console.log('🗑️  Cleared existing blogs');

    // Create blogs
    for (const blogData of sampleBlogs) {
      const blog = await Blog.create({
        ...blogData,
        author: author._id,
        authorName: author.username,
        likes: Math.floor(Math.random() * 50) + 10, // Random likes between 10-60
        views: Math.floor(Math.random() * 200) + 50 // Random views between 50-250
      });
      console.log(`✅ Created blog: "${blog.title}"`);
    }

    console.log('\n🎉 Blog seeding completed successfully!');
    console.log(`📊 Total blogs created: ${sampleBlogs.length}`);
    console.log('\n💡 You can now:');
    console.log('   1. Visit http://localhost:3000');
    console.log('   2. Click the "📰 Blogs" button in header');
    console.log('   3. See all 3 blogs on the blog page!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBlogs();
