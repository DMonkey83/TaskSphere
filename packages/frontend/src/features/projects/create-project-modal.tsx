"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { toast } from "sonner";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
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
import { useCreateProject } from "@/lib/queries/useProjects";
import { projectStore } from "@/store/project-store";

import {
  CreateProject,
  CreateProjectSchema,
  ProjectResponse,
} from "@shared/dto/projects.dto";
import { Industries } from "@shared/enumsTypes/industries.enum";
import { Workflows } from "@shared/enumsTypes/workflow.enum";
import { projectKeys } from "@shared/keys/project-keys";

interface CreateProjectModalProps {
  trigger?: React.ReactNode;
}

export const CreateProjectModal = ({ trigger }: CreateProjectModalProps) => {
  const { addProject } = projectStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const { draft } = useOnboarding();
  const form = useForm<CreateProject>({
    resolver: zodResolver(CreateProjectSchema),
    mode: "onChange",
    defaultValues: {
      name: draft?.data?.projectDefaults?.name || "",
      industry: draft?.data?.projectDefaults?.industry || undefined,
      workflow: draft?.data?.projectDefaults?.workflow || undefined,
      description: draft?.data?.projectDefaults?.description || "",
      matterNumber: "",
      config: {},
      visibility: draft?.data?.projectDefaults?.visibility || "private",
      tags: [],
      startDate: undefined,
      endDate: undefined,
      slug: "",
    },
  });

  // Update form with project defaults when draft loads
  useEffect(() => {
    if (draft?.data?.projectDefaults) {
      const defaults = draft.data.projectDefaults;
      if (defaults.name) form.setValue("name", defaults.name);
      if (defaults.industry) form.setValue("industry", defaults.industry);
      if (defaults.workflow) form.setValue("workflow", defaults.workflow);
      if (defaults.description)
        form.setValue("description", defaults.description);
      if (defaults.visibility) form.setValue("visibility", defaults.visibility);
    }
  }, [draft, form]);

  const { mutate: createProject } = useCreateProject();
  const onSubmit = (data: CreateProject) => {
    createProject(data, {
      onSuccess: (response: ProjectResponse) => {
        addProject({ ...data, id: response.id || Date.now().toString() });
        toast.success("Project created successfully!");
        form.reset();
        queryClient.invalidateQueries({
          queryKey: projectKeys.byAccount(response.account.id),
        });
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          `Failed to create project: ${error.message || "Unknown error"}`
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <MdAdd className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project to organize your team`$apos`s work and track
            progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Project Name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="industry"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an Industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Industries.map((industry) => {
                          return (
                            <SelectItem
                              key={industry.value}
                              value={industry.value}
                            >
                              {industry.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of the project"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="workflow"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Workflow" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Workflows.map((type) => {
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("industry") === "legal" && (
                <FormField
                  name="matterNumber"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matter Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Matter Number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DottedSeparator />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
