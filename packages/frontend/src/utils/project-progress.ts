export const calculateTimeProgress = (
  startDate?: Date | null,
  endDate?: Date | null
): number | null => {
  // Return null if either date is missing
  if (!startDate || !endDate) return null;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  // Check if startDate is the Unix epoch (indicates null was converted to Date)
  // Unix epoch is January 1, 1970 00:00:00 UTC
  if (start.getTime() === 0 || start.getFullYear() === 1970) {
    return null;
  }

  // Project hasn't started yet
  if (now < start) return 0;
  
  // Project is past deadline - cap at 100% but this represents time elapsed, not completion
  if (now > end) return 100;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  return Math.round((elapsed / totalDuration) * 100);
};

export const calculateTaskProgress = (
  config?: Record<string, string | number | boolean>
): number | null => {
  if (!config) return null;

  if (config.tasksCompleted && config.totalTasks) {
    return Math.round(
      ((config.tasksCompleted as number) / (config.totalTasks as number)) * 100
    );
  }
  if (config.completedMilestones && config.milestones) {
    return Math.round(
      ((config.completedMilestones as number) / (config.milestones as number)) *
        100
    );
  }
  if (config.documentsReviewed && config.totalDocuments) {
    return Math.round(
      ((config.documentsReviewed as number) /
        (config.totalDocuments as number)) *
        100
    );
  }
  if (config.spent && config.budget) {
    return Math.round(
      ((config.spent as number) / (config.budget as number)) * 100
    );
  }
  return null;
};

export const getProgressFromStatus = (status: string): number => {
  const statusProgress: Record<string, number> = {
    "in-progress": 50,
    "in_progress": 50,
    completed: 100,
    "on-hold": 50,
    "on_hold": 50,
    "not-started": 0,
    "not_started": 0,
    cancelled: 0,
    canceled: 0,
    planned: 0,
  };
  
  // Normalize status to lowercase and handle different formats
  const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '-');
  
  return statusProgress[normalizedStatus] || statusProgress[status] || 0;
};
