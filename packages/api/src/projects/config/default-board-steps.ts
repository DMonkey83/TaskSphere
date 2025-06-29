interface StepDefinition {
  name: string;
  status:
    | 'backlog'
    | 'planned'
    | 'in_progress'
    | 'on_hold'
    | 'completed'
    | 'cancelled'; // or statusId if normalized
}

export const industryDefaultSteps: Record<string, StepDefinition[]> = {
  programming: [
    { name: 'Backlog', status: 'backlog' },
    { name: 'To Do', status: 'planned' },
    { name: 'In Progress', status: 'in_progress' },
    { name: 'Code Review', status: 'in_progress' },
    { name: 'QA', status: 'in_progress' },
    { name: 'Done', status: 'completed' },
  ],
  marketing: [
    { name: 'Ideas', status: 'planned' },
    { name: 'Production', status: 'in_progress' },
    { name: 'Review', status: 'on_hold' },
    { name: 'Published', status: 'completed' },
  ],
  legal: [
    { name: 'Drafting', status: 'in_progress' },
    { name: 'Internal Review', status: 'on_hold' },
    { name: 'Client Review', status: 'on_hold' },
    { name: 'Finalized', status: 'completed' },
  ],
  product: [
    { name: 'Research', status: 'planned' },
    { name: 'Design', status: 'in_progress' },
    { name: 'Validation', status: 'on_hold' },
    { name: 'Launch', status: 'completed' },
  ],
  logistics: [
    { name: 'Order Received', status: 'planned' },
    { name: 'Packing', status: 'in_progress' },
    { name: 'Shipping', status: 'in_progress' },
    { name: 'Delivered', status: 'completed' },
  ],
  other: [
    { name: 'To Do', status: 'planned' },
    { name: 'Doing', status: 'in_progress' },
    { name: 'Done', status: 'completed' },
  ],
};

export function getDefaultStepsForIndustry(industry: string): StepDefinition[] {
  return industryDefaultSteps[industry] ?? industryDefaultSteps.other;
}
