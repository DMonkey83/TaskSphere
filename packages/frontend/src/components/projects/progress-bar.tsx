import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number | null;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  if (progress === null) return null;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <Progress value={clampedProgress} className={className} />
      {showLabel && (
        <span className="text-xs text-gray-600 mt-1">{clampedProgress}%</span>
      )}
    </div>
  );
}
