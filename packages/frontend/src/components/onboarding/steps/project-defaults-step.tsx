"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOnboarding } from "@/lib/queries/useOnboarding";
import { useOnboardingData } from "@/store/onboarding-store";

const projectDefaultsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  industry: z
    .enum([
      "programming",
      "legal",
      "logistics",
      "marketing",
      "product",
      "other",
    ])
    .optional(),
  workflow: z
    .enum(["kanban", "scrum", "timeline", "calendar", "checklist"])
    .default("kanban"),
  visibility: z.enum(["private", "team", "account"]).default("private"),
});

type ProjectDefaultsForm = z.infer<typeof projectDefaultsSchema>;

export function ProjectDefaultsStep() {
  const { projectDefaults, updateProjectDefaults } = useOnboardingData();
  const { updateDraft } = useOnboarding();

  const form = useForm<ProjectDefaultsForm>({
    resolver: zodResolver(projectDefaultsSchema),
    defaultValues: {
      name: projectDefaults?.name || "",
      description: projectDefaults?.description || "",
      industry: projectDefaults?.industry || undefined,
      workflow: projectDefaults?.workflow || "kanban",
      visibility: projectDefaults?.visibility || "private",
    },
  });

  const onSubmit = React.useCallback(async (data: ProjectDefaultsForm) => {
    console.log('🟦 ProjectDefaultsStep onSubmit called with data:', data);
    console.log('🟦 Form values before submit:', form.getValues());
    
    updateProjectDefaults(data);
    try {
      const payload = {
        data: {
          projectDefaults: data,
        },
      };
      console.log('🟦 Sending updateDraft payload:', payload);
      
      const result = await updateDraft(payload);
      console.log('🟦 ProjectDefaults updateDraft SUCCESS:', result);
    } catch (error) {
      console.error('🟦 ProjectDefaults updateDraft ERROR:', error);
    }
  }, [updateProjectDefaults, updateDraft, form]);

  // Disable auto-save completely to prevent infinite loops
  // Manual save only on form submission
  // const watchedValues = form.watch();
  // React.useEffect(() => {
  //   // Auto-save logic disabled due to infinite re-render issues
  // }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Set Your Project Defaults
        </h2>
        <p className="text-gray-600">
          These settings will be used as defaults when creating new projects.
          You can always change them later for individual projects.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Project Name Template</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Project-YYYY-MM or Client-[Name]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional template for project names. Use YYYY for year,
                        MM for month.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Standard project description template..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Template description that will be pre-filled for new
                        projects.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Industry</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="programming">
                            Software Development
                          </SelectItem>
                          <SelectItem value="legal">Legal Services</SelectItem>
                          <SelectItem value="logistics">Logistics</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="product">
                            Product Management
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us customize features for your industry.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workflow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Workflow Type</FormLabel>
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
                          <SelectItem value="kanban">Kanban Board</SelectItem>
                          <SelectItem value="scrum">Scrum Sprints</SelectItem>
                          <SelectItem value="timeline">
                            Timeline View
                          </SelectItem>
                          <SelectItem value="calendar">
                            Calendar View
                          </SelectItem>
                          <SelectItem value="checklist">
                            Simple Checklist
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your preferred project management methodology.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Project Visibility</FormLabel>
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
                          <SelectItem value="private">
                            Private (Only you)
                          </SelectItem>
                          <SelectItem value="team">
                            Team (Team members only)
                          </SelectItem>
                          <SelectItem value="account">
                            Account (All account members)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who can see your projects by default.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
