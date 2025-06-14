import { useState } from "react";
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiBars3BottomLeft,
} from "react-icons/hi2";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectsFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="relative">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <HiFunnel className="w-4 h-4 mr-2" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-48">
          <HiBars3BottomLeft className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="name">Name A-Z</SelectItem>
          <SelectItem value="deadline">Deadline</SelectItem>
          <SelectItem value="progress">Progress</SelectItem>
          <SelectItem value="time-progress">Time Progress</SelectItem>
          <SelectItem value="task-progress">Task Progress</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
