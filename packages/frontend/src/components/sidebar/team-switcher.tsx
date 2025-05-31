import * as React from "react";
import { MdExpandMore, MdCheck } from "react-icons/md";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/store/use-sidebar-store";
import { teams } from "@/lib/sidebar-config";

export function TeamSwitcher() {
  const { isCollapsed } = useSidebar();
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0]);

  console.log("Selected Team:", selectedTeam, "isCollapsed:", isCollapsed);

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {selectedTeam.logo}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto p-3"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {selectedTeam.logo}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 leading-none text-left">
            <span className="font-semibold">{selectedTeam.name}</span>
            <span className="text-xs text-muted-foreground">Team</span>
          </div>
          <MdExpandMore className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onSelect={() => setSelectedTeam(team)}
            className={cn(
              "flex items-center gap-2",
              selectedTeam.id === team.id && "bg-accent"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{team.logo}</AvatarFallback>
            </Avatar>
            <span>{team.name}</span>
            {selectedTeam.id === team.id && (
              <MdCheck className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
