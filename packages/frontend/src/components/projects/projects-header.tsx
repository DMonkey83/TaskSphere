import { Briefcase } from "lucide-react";

export function ProjectsHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
        <Briefcase className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all your projects in one place
        </p>
      </div>
    </div>
  );
}
