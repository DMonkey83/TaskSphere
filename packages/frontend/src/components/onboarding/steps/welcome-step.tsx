"use client";

import {
  IoRocketOutline,
  IoCheckmarkCircle,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";

import { Card, CardContent } from "@/components/ui/card";
import { userStore } from "@/store/user-store";

export function WelcomeStep() {
  const user = userStore((state) => state.user);

  const features = [
    {
      icon: IoPeopleOutline,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members",
    },
    {
      icon: IoSettingsOutline,
      title: "Customizable Workflows",
      description: "Adapt TaskSphere to your team's process",
    },
    {
      icon: IoCheckmarkCircle,
      title: "Task Management",
      description: "Keep track of progress and deadlines",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <IoRocketOutline className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to TaskSphere, {user?.firstName || "there"}!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We&aposre excited to help you and your team stay organized and
          productive. Let&aposs get your account set up with a quick 3-step
          process.
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-l-4 border-l-blue-500">
            <CardContent className="flex items-center gap-3 p-4">
              <feature.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          <strong>Quick setup:</strong> This will only take 2-3 minutes and will
          help us personalize your TaskSphere experience.
        </p>
      </div>
    </div>
  );
}
