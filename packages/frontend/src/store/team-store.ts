import { create } from "zustand";

import { TeamsResponse } from "@shared/dto/team.dto";

interface TeamState {
  teams: TeamsResponse;
  setTeams: (teams: TeamsResponse) => void;
  updateTeam: (teamId: string, updatedTeam: Partial<TeamsResponse>) => void;
  removeTeam: (teamId: string) => void;
}

export const teamStore = create<TeamState>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
  updateTeam: (teamId, updatedTeam) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, ...updatedTeam } : team
      ),
    })),
  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== teamId),
    })),
}));
