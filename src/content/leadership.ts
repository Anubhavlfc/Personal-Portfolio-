export type LeadershipEntry = {
  id: string
  role: string
  org: string
  focus: string
}

export const leadership: LeadershipEntry[] = [
  {
    id: 'finance-committee',
    role: 'Finance Committee Head Advisor',
    org: 'Associated Students of The College of Idaho',
    focus: 'Owns budget review and financial reporting for student-funded events. See “Beyond the Code” below.',
  },
  {
    id: 'campus-safety',
    role: 'Office Manager Coordinator',
    org: 'The College of Idaho Campus Safety',
    focus: 'Coordinates office operations and administrative organization for the department.',
  },
  {
    id: 'asa',
    role: 'President',
    org: 'Asian Student Association',
    focus: 'Leads the organization’s direction, events, and membership.',
  },
  {
    id: 'chess-club',
    role: 'President / Chess.com College Ambassador',
    org: 'Chess Club',
    focus: 'Runs the club and represents the college as a Chess.com College Ambassador.',
  },
]

export const financeSpotlight = {
  role: 'Finance Committee Head Advisor',
  org: 'Associated Students of The College of Idaho',
  scaleLabel: '10+',
  scaleUnit: 'Events',
  description:
    'Manages event budgets for student organizations — reviewing funding proposals, tracking allocations and expenditures, reconciling actuals against approved amounts, and reporting consolidated financials to student leadership.',
  highlights: [
    'Managing event budgets',
    'Tracking allocations and expenditures',
    'Reconciling actuals against approved amounts',
    'Reviewing funding proposals',
    'Forecasting costs',
    'Consolidating financial data',
    'Reporting to student leadership',
  ],
  flow: ['Budget', 'Allocation', 'Spending', 'Reconciliation', 'Reporting'],
}
