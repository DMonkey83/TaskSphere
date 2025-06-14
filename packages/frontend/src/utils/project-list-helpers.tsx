import {
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiXCircle,
  HiDocumentText,
  HiArchiveBox,
  HiGlobeAlt as HiGlobe,
  HiLockClosed,
  HiShieldCheck,
} from "react-icons/hi2";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <HiCheckCircle className="w-4 h-4 text-green-500" />;
    case "in-progress":
      return <HiClock className="w-4 h-4 text-blue-500" />;
    case "on-hold":
      return <HiExclamationCircle className="w-4 h-4 text-yellow-500" />;
    case "cancelled":
      return <HiXCircle className="w-4 h-4 text-red-500" />;
    case "not-started":
    case "planned":
      return <HiDocumentText className="w-4 h-4 text-gray-500" />;
    case "archived":
      return <HiArchiveBox className="w-4 h-4 text-gray-400" />;
    default:
      return <HiClock className="w-4 h-4 text-gray-500" />;
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "active":
      return "default";
    case "on-hold":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "not-started":
      return "outline";
    case "planned":
      return "outline";
    case "archived":
      return "outline";
    default:
      return "outline";
  }
};

export const getVisibilityIcon = (visibility?: string) => {
  switch (visibility?.toLowerCase()) {
    case "public":
      return <HiGlobe className="w-3 h-3 text-green-500" />;
    case "internal":
    case "private":
      return <HiLockClosed className="w-3 h-3 text-red-500" />;
    case "confidential":
    case "team":
      return <HiShieldCheck className="w-3 h-3 text-blue-500" />;
    default:
      return null;
  }
};

export const formatDate = (date?: Date) => {
  if (!date) return "No deadline";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatWorkflow = (workflow: string) => {
  return workflow.charAt(0).toUpperCase() + workflow.slice(1).toLowerCase();
};

export const getDaysRemaining = (endDate?: Date) => {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
