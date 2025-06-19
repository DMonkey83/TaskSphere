"use client";

import {
  IoCheckmarkCircle,
  IoRocketOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoStarOutline,
} from "react-icons/io5";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboardingData } from "@/store/onboarding-store";
import { userStore } from "@/store/user-store";

export function CompletionStep() {
  const user = userStore((state) => state.user);
  const { projectDefaults, preferences } = useOnboardingData();

  const setupSummary = [
    {
      title: "Project Defaults",
      items: [
        projectDefaults?.industry && `Industry: ${projectDefaults.industry}`,
        projectDefaults?.workflow && `Workflow: ${projectDefaults.workflow}`,
        projectDefaults?.visibility &&
          `Visibility: ${projectDefaults.visibility}`,
      ].filter(Boolean),
    },
    {
      title: "Preferences",
      items: [
        preferences?.theme && `Theme: ${preferences.theme}`,
        `Notifications: ${preferences?.notifications ? "Enabled" : "Disabled"}`,
        `Email Updates: ${preferences?.emailUpdates ? "Enabled" : "Disabled"}`,
      ].filter(Boolean),
    },
  ];

  const nextSteps = [
    {
      icon: IoPeopleOutline,
      title: "Invite Your Team",
      description: "Add team members to start collaborating",
    },
    {
      icon: IoRocketOutline,
      title: "Create Your First Project",
      description: "Put your new settings to work",
    },
    {
      icon: IoSettingsOutline,
      title: "Explore Features",
      description: "Discover all TaskSphere has to offer",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Welcome aboard, {user?.firstName}! 🎉
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your TaskSphere account is now set up and ready to go. Let&apos;s
          start building something amazing together!
        </p>
      </div>

      {/* Setup Summary */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <IoStarOutline className="w-5 h-5 text-green-600" />
            Your Setup Summary
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {setupSummary.map((section) => (
              <div key={section.title}>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs mr-1 mb-1"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div>
        <h3 className="font-semibold mb-4 text-center">What&aposs Next?</h3>
        <div className="grid gap-4">
          {nextSteps.map((step) => (
            <Card
              key={step.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click &quot;Finish&quot; to go to your dashboard and start using
          TaskSphere.
        </p>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
          <span>Need help?</span>
          <span className="text-blue-600 font-medium">
            Check out our documentation
          </span>
        </div>
      </div>
    </div>
  );
}
