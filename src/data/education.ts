export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EducationLesson {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Budgeting & Saving' | 'Debt & Credit' | 'Investing & Growth' | 'Security';
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  content: string;
  quiz: QuizQuestion;
}

export const EDUCATION_LESSONS: EducationLesson[] = [
  {
    id: 'lesson_budgeting_503020',
    title: 'The 50/30/20 Rule: Smart Budgeting Without Deprivation',
    category: 'Budgeting & Saving',
    readTime: '3 min',
    summary: 'Master the timeless framework that balances basic survival needs, personal happiness, and wealth building.',
    keyTakeaways: [
      '50% for Needs: Rent, essential groceries, transport, utilities.',
      '30% for Wants: Hobbies, dining out, recreation, entertainment.',
      '20% for Future: Savings buffer, investments, and debt reduction.',
    ],
    content: `Budgeting does not mean giving up coffee with friends or living an ascetic life. Instead, it is giving every currency unit a job before the month starts.

The **50/30/20 framework** splits your net take-home income into three clean buckets:
1. **Needs (50% max):** Expenses you cannot avoid without significant life disruption. This includes shared rent, basic groceries, bus/metro transit, prescription medicine, and basic mobile recharge.
2. **Wants (30% max):** Upgrades and pleasures that make life enjoyable. Dining at cafes, gaming subscriptions, new shoes, cinema outings.
3. **Savings & Debt Elimination (20% minimum):** This is the foundation of freedom. It funds your liquid emergency deposit and long-term index investments.

*Young Earner Tip:* If you live with parents and have lower baseline needs, elevate the savings/investing bucket to 40% or 50% early to take advantage of multi-decade compound growth!`,
    quiz: {
      id: 'q_503020',
      question: 'Under the 50/30/20 rule, which category does a weekend concert ticket belong to?',
      options: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)', 'Fixed Liabilities'],
      correctIndex: 1,
      explanation: 'A concert is discretionary entertainment, which falls strictly under Wants (30%).',
    },
  },
  {
    id: 'lesson_compound_interest',
    title: 'The Eighth Wonder: The Mathematical Power of Compounding',
    category: 'Investing & Growth',
    readTime: '4 min',
    summary: 'Why starting with even ₹500 or $10 a month at age 18 beats starting with $1,000 a month at age 35.',
    keyTakeaways: [
      'Compound interest earns interest on top of past interest.',
      'Time in the market is vastly more powerful than timing the market.',
      'The Rule of 72 estimates how fast your money doubles: 72 / Interest Rate.',
    ],
    content: `Simple interest pays you return only on your original principal. But **compound interest** pays you return on both your principal and all previous accumulated returns.

The mathematical formula is:
**A = P(1 + r/n)^(nt)**

Where *P* is your initial deposit, *r* is the annual return rate, *n* is the compounding frequency per year, and *t* is time in years.

Notice that **time (*t*) is an exponent**. In mathematics, exponential growth starts slow and imperceptible, then bends upward vertically.

*The Rule of 72:*
Want to know how many years it takes for your investment to double? Divide 72 by the annual return rate.
- At 12% annual return (historical broad equity index average), money doubles in: 72 / 12 = **6 years**.
- Over 24 years, ₹10,000 doubles four times: ₹10,000 → ₹20,000 → ₹40,000 → ₹80,000 → **₹160,000** without adding another penny!`,
    quiz: {
      id: 'q_compound',
      question: 'According to the Rule of 72, how many years will it take for an investment to double at an 8% annual return?',
      options: ['6 years', '9 years', '12 years', '72 years'],
      correctIndex: 1,
      explanation: '72 divided by 8 equals 9 years.',
    },
  },
  {
    id: 'lesson_needs_vs_wants',
    title: 'Needs vs. Wants: The 48-Hour Purchase Rule',
    category: 'Fundamentals',
    readTime: '3 min',
    summary: 'How to conquer impulse buying and emotional retail dopamine in a world designed for one-click purchases.',
    keyTakeaways: [
      'Needs are non-negotiable survival essentials; wants are comfort upgrades.',
      'Marketers intentionally package wants to masquerade as urgent needs.',
      'Apply the 48-Hour Cooling Off Rule for non-essential purchases above ₹1,000.',
    ],
    content: `Modern e-commerce and algorithmic feeds are engineered to trigger sudden dopamine surges. Flash sales and countdown timers manufacture artificial urgency.

**The Test of Time:**
Ask yourself: *“If I do not buy this today, will my health, safety, or core education be impaired in 7 days?”* If the answer is no, it is a Want.

**The 48-Hour Protocol:**
When you feel the sudden urge to buy a gadget, designer hoodie, or collectible:
1. Bookmark the item or put it in your cart.
2. Step away and wait exactly 48 hours.
3. If after 48 hours you still desire it AND it fits cleanly within your 30% Wants monthly allocation, proceed guilt-free.
In over 70% of cases, the dopamine wave fades and you keep your hard-earned money.`,
    quiz: {
      id: 'q_needs_wants',
      question: 'Which of the following is considered a core "Need" rather than a "Want"?',
      options: ['Latest flagship smartphone', 'Nutritious basic groceries and water', 'Premium gaming pass', 'Designer sneakers'],
      correctIndex: 1,
      explanation: 'Basic nutritious nourishment is essential for biological health and survival.',
    },
  },
  {
    id: 'lesson_emergency_fund',
    title: 'The Shock Absorber: Building Your Emergency Fund',
    category: 'Fundamentals',
    readTime: '4 min',
    summary: 'Why an emergency fund is your financial airbag that stops one accident or job gap from turning into high-interest debt.',
    keyTakeaways: [
      'Target 3 to 6 months of baseline mandatory living expenses.',
      'Keep it in ultra-safe, liquid accounts (high-yield savings or instant-sweep fixed deposits).',
      'Never invest your emergency fund in volatile stocks or speculative crypto.',
    ],
    content: `Life is unpredictable. Laptops break right before final exams, medical copays appear, or freelance retainers pause.

Without cash reserves, individuals are forced to take high-interest personal loans or carry credit card balances at 36-42% interest rates, trapping them in debt cycles.

**How to calculate your target:**
If your mandatory rent, food, and bills total ₹15,000/month:
- Beginner Target: 1 month buffer = ₹15,000.
- Full Safety Net: 3 to 6 months buffer = ₹45,000 to ₹90,000.

**Where to park it:**
An emergency fund must be liquid and capital-protected. A dedicated savings bank account or an auto-sweep Fixed Deposit is ideal. Do not invest it in equity stocks, because market downturns often coincide with economic recessions!`,
    quiz: {
      id: 'q_emergency',
      question: 'Where should an emergency fund ideally be parked?',
      options: ['High-risk speculative equities', 'Under your mattress in cash only', 'A safe, liquid savings account or auto-sweep FD', 'Long-term locked retirement bonds'],
      correctIndex: 2,
      explanation: 'Emergency funds must remain safe and instantly accessible without risk of capital loss.',
    },
  },
  {
    id: 'lesson_inflation',
    title: 'The Silent Thief: Demystifying Inflation and Purchasing Power',
    category: 'Fundamentals',
    readTime: '3 min',
    summary: 'Why keeping all your wealth in physical cash or 3% savings accounts guarantees guaranteed real loss over time.',
    keyTakeaways: [
      'Inflation is the general rise in prices and decline in currency purchasing power.',
      'Real Return = Nominal Interest Rate minus Inflation Rate.',
      'To build long-term wealth, investments must outpace inflation.',
    ],
    content: `Imagine ₹100 could buy 10 notebooks a decade ago, but today can only buy 4 notebooks. The ₹100 bill itself hasn't changed, but its **purchasing power** has shrunk.

If inflation runs at 6% annually, an item costing ₹10,000 today will cost approximately **₹17,908 in 10 years**.

**Real Return Formula:**
*Real Return = Nominal Return - Inflation Rate*

If your bank account gives you 3.5% interest, but annual inflation is 6%:
*Real Return = 3.5% - 6% = -2.5% per year!*

You are literally losing 2.5% of real purchasing power each year. That is why learning to invest in growth assets (like broad-market index funds) is mandatory for financial preservation.`,
    quiz: {
      id: 'q_inflation',
      question: 'If a bank pays 4% interest and inflation is 6%, what is your real annual purchasing power return?',
      options: ['+10%', '+2%', '-2%', '0%'],
      correctIndex: 2,
      explanation: '4% nominal minus 6% inflation results in a negative real return of -2%.',
    },
  },
  {
    id: 'lesson_debt_credit',
    title: 'Debt & Loans: Good Debt vs. Toxic High-Interest Traps',
    category: 'Debt & Credit',
    readTime: '4 min',
    summary: 'Distinguish leverage that increases future earning capacity from predatory consumer loans and credit card revolving balances.',
    keyTakeaways: [
      'Good debt builds long-term earnings (e.g. low-interest education for in-demand skills).',
      'Toxic debt finances depreciating consumer goods at high interest rates.',
      'Always pay credit card statements in full every month—never revolve balances.',
    ],
    content: `Debt is a financial amplifier. When used cautiously for productive assets (such as an affordable education loan that unlocks a career), it can act as positive leverage.

However, consumer debt for vacations, clothes, or lifestyle inflation is toxic. Credit card interest typically ranges from **36% to 44% APR**, compounding daily if unpaid.

**The Golden Rules of Credit:**
1. **Treat Credit Cards like Debit Cards:** Never spend money on a credit card that you do not already possess in your checking account.
2. **Pay the Entire Statement Balance:** The "Minimum Amount Due" is a trap designed to keep you paying interest for decades.
3. **Credit Utilization Ratio:** Keep your credit usage below 30% of your allocated limit to build a stellar credit score.`,
    quiz: {
      id: 'q_debt',
      question: 'What happens if you only pay the "Minimum Amount Due" on a credit card?',
      options: [
        'The bank forgives the remaining balance.',
        'High interest (36-44% APR) continues compounding on the entire unpaid balance.',
        'Your credit score automatically increases to maximum.',
        'You pay zero interest.',
      ],
      correctIndex: 1,
      explanation: 'Paying only the minimum due triggers exorbitant interest on the entire outstanding amount.',
    },
  },
  {
    id: 'lesson_digital_safety',
    title: 'Digital Financial Safety: Shielding Your Wealth from Modern Scams',
    category: 'Security',
    readTime: '3 min',
    summary: 'Essential cybersecurity habits to protect your UPI, banking apps, and personal identity.',
    keyTakeaways: [
      'UPI PIN is entered ONLY to send money, NEVER to receive funds.',
      'Banks will never ask for your passwords, OTP, or remote screen-sharing apps.',
      'Enable two-factor authentication (2FA) and monitor transaction alerts.',
    ],
    content: `In the digital era, financial security is synonymous with digital literacy.

**Critical Rules for Digital Safety:**
1. **Receiving Money Never Requires a PIN:** Scammers often send a "collect request" claiming you won a reward. If you enter your UPI PIN, money leaves your account immediately.
2. **Beware of Screen Sharing Apps:** Never install AnyDesk, TeamViewer, or QuickSupport on the instruction of an unsolicited caller claiming to be bank support.
3. **Phishing Links:** Verify domain URLs before entering banking credentials. Banks communicate through registered SMS headers and official app notifications.
4. **Public Wi-Fi:** Avoid conducting financial transfers over unencrypted public Wi-Fi networks (airports, cafes) without a secure VPN.`,
    quiz: {
      id: 'q_security',
      question: 'When should you enter your UPI PIN on your phone?',
      options: [
        'When someone sends you a prize reward.',
        'Only when you are deliberately transferring money OUT of your account.',
        'When customer care asks you to verify your identity.',
        'Whenever an unknown caller requests it.',
      ],
      correctIndex: 1,
      explanation: 'A UPI PIN is an authorization to deduct money; it is never required to receive money.',
    },
  },
];
