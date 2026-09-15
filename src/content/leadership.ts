export type LeadershipEntry = {
  id: string
  role: string
  org: string
  focus: string
}

export const financeSpotlight = {
  role: 'Finance Committee Head Advisor',
  org: 'Associated Students of The College of Idaho',
  eventCount: 10,
  eventUnit: 'events funded',
  description:
    'Reviews funding proposals from student organizations and manages the budgets behind them — tracking allocations against spending, reconciling actuals to approved amounts, forecasting costs, and reporting consolidated financials back to student leadership.',
  flow: ['Budget', 'Allocation', 'Spending', 'Reconciliation', 'Reporting'],
}

export const leadership: LeadershipEntry[] = [
  {
    id: 'asa',
    role: 'President',
    org: 'Asian Student Association',
    focus: 'Sets the organization’s direction and runs its events and membership.',
  },
  {
    id: 'chess-club',
    role: 'President · Chess.com College Ambassador',
    org: 'Chess Club',
    focus: 'Runs the club and represents the college as a Chess.com College Ambassador.',
  },
  {
    id: 'campus-safety',
    role: 'Office Manager Coordinator',
    org: 'The College of Idaho Campus Safety',
    focus: 'Coordinates office operations and administrative organization for the department.',
  },
]
