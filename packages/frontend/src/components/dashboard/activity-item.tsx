import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "@/types/dashboard.types";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={activity.user.avatar || "/placeholder.svg"}
          alt={activity.user.name}
        />
        <AvatarFallback>{activity.user.initials}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <p className="text-sm">
          <span className="font-medium">{activity.user.name}</span>{" "}
          {activity.action}{" "}
          <span className="font-medium">{activity.target}</span> in{" "}
          <span className="font-medium">{activity.project}</span>
        </p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
    </div>
  );
}
