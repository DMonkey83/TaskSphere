export const calculateTimeProgress = (
  startDate?: Date,
  endDate?: Date
): number | null => {
  if (!startDate || !endDate) return null;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 0;
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
  const statusProgress = {
    "in-progress": 50,
    completed: 100,
    "on-hold": 50,
    "not-started": 0,
    cancelled: 0,
    planned: 0,
  };
  return statusProgress[status] || 0;
};
