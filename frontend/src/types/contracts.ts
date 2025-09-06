export interface Proposal {
  id: number
  description: string
  targetProjectId: number
  amount: string
  recipient: string
  votesFor: string
  votesAgainst: string
  deadline: number
  executed: boolean
  proposer: string
  createdAt: number
}

export interface Project {
  id: number
  name: string
  description: string
  totalDonations: string
  totalReleased: string
  available: string
}

export interface Donation {
  donor: string
  projectId: number
  amount: string
  timestamp: number
}

export interface VotingPower {
  address: string
  power: string
  donations: Donation[]
}

