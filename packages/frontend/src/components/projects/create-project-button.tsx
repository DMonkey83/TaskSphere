import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateProjectButton() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = () => {
    setIsCreating(true);
    // Here you would typically open a modal or navigate to create project form
    // For now, just simulate the action
    setTimeout(() => {
      setIsCreating(false);
      // You could show a success message or redirect
    }, 1000);
  };

  return (
    <button
      onClick={handleCreateProject}
      disabled={isCreating}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Plus className="w-4 h-4" />
      {isCreating ? "Creating..." : "New Project"}
    </button>
  );
}
