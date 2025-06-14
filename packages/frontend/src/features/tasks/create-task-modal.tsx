"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdTask } from "react-icons/md";
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
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectsQuery } from "@/lib/queries/useProjects";
import { useTeamsQuery } from "@/lib/queries/useTeams";
import { userStore } from "@/store/user-store";

import { CreateTaskSchema } from "@shared/dto/tasks.dto";
import { z } from "zod";

type CreateTask = z.infer<typeof CreateTaskSchema>;

interface CreateTaskModalProps {
  trigger?: React.ReactNode;
}

export const CreateTaskModal = ({ trigger }: CreateTaskModalProps) => {
  const { accountId, id } = userStore((state) => state.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);

  const { data: projects, isLoading: projectsLoading } = useProjectsQuery(
    accountId!,
    {
      enabled: !!accountId,
    }
  );

  const { data: teams, isLoading: teamsLoading } = useTeamsQuery(accountId!, {
    enabled: !!accountId,
  });

  const form = useForm<CreateTask>({
    resolver: zodResolver(CreateTaskSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "subtask",
      status: "todo",
      projectKey: "",
      projectId: "",
      creatorId: id || "",
      assigneeId: undefined,
      parentId: undefined,
      teamId: undefined,
      relatedTasks: undefined,
    },
  });

  useEffect(() => {
    form.setValue("creatorId", id || "", { shouldValidate: true });
  }, [id, form]);

  const selectedProjectId = form.watch("projectId");

  useEffect(() => {
    if (selectedProjectId && projects) {
      const selectedProject = projects.projects.find(
        (p) => p.id === selectedProjectId
      );
      if (selectedProject) {
        form.setValue("projectKey", selectedProject.projectKey);
      }
    }
  }, [selectedProjectId, projects, form]);

  const onSubmit = (data: CreateTask) => {
    console.log("Creating task with data:", data);
    toast.success("Task would be created!");
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MdTask className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a project and team member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    {...field}
                    type="text"
                    placeholder="Enter task title"
                  />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Task description (optional)"
                  />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="projectId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="projectId">Project</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={projectsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="teamId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="teamId">Team (Optional)</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={teamsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="subtask">Subtask</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DottedSeparator />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={!form.formState.isValid}
              className="w-full"
            >
              Create Task
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
