"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  IoMoonOutline,
  IoSunnyOutline,
  IoDesktopOutline,
  IoNotificationsOutline,
  IoMailOutline,
} from "react-icons/io5";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useOnboarding } from "@/lib/queries/useOnboarding";
import { useOnboardingData } from "@/store/onboarding-store";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  notifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

export function PreferencesStep() {
  const { preferences, updatePreferences } = useOnboardingData();
  const { updateDraft } = useOnboarding();

  const form = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: preferences?.theme || "system",
      notifications: preferences?.notifications ?? true,
      emailUpdates: preferences?.emailUpdates ?? true,
    },
  });

  const onSubmit = useCallback(
    async (data: PreferencesForm) => {
      updatePreferences(data);
      try {
        const payload = {
          data: {
            preferences: data,
          },
        };

        await updateDraft(payload);
      } catch (error) {
        console.error("🟨 Preferences updateDraft ERROR:", error);
      }
    },
    [updatePreferences, updateDraft]
  );

  // Auto-save disabled to prevent infinite loops
  // Manual save only on form submission
  // const watchedValues = form.watch();
  // React.useEffect(() => {
  //   // Auto-save logic disabled due to infinite re-render issues
  // }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Customize Your Experience
        </h2>
        <p className="text-gray-600">
          Set your preferences for how TaskSphere looks and behaves. You can
          change these anytime in your settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IoSunnyOutline className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Preference</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <IoSunnyOutline className="w-4 h-4" />
                              Light Mode
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <IoMoonOutline className="w-4 h-4" />
                              Dark Mode
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <IoDesktopOutline className="w-4 h-4" />
                              System Default
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how TaskSphere looks. System default follows your
                        device settings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IoNotificationsOutline className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Browser Notifications
                        </FormLabel>
                        <FormDescription>
                          Get notified about task updates, comments, and
                          deadlines.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <IoMailOutline className="w-4 h-4" />
                          Email Updates
                        </FormLabel>
                        <FormDescription>
                          Receive weekly summaries and important project updates
                          via email.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-blue-800">
                You can always adjust these preferences later in your account
                settings. We recommend keeping notifications enabled to stay on
                top of important updates.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
