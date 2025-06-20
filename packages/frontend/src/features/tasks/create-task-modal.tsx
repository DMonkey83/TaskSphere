"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdTask } from "react-icons/md";
import { toast } from "sonner";
import { z } from "zod";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectMembersQuery } from "@/lib/queries/useProjectMembers";
import { useProjectsQuery } from "@/lib/queries/useProjects";
import { useCreateTask, useProjectTasksQuery } from "@/lib/queries/useTasks";
import { useTeamsQuery } from "@/lib/queries/useTeams";
import { userStore } from "@/store/user-store";

import { CreateTaskSchema } from "@shared/dto/tasks.dto";

type CreateTask = z.infer<typeof CreateTaskSchema>;

interface CreateTaskModalProps {
  trigger?: React.ReactNode;
}

export const CreateTaskModal = ({ trigger }: CreateTaskModalProps) => {
  const { accountId, id } = userStore((state) => state.user);
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
      projectKey: "",
      projectId: "",
      creatorId: id || "",
      assigneeId: undefined,
      parentId: undefined,
      teamId: undefined,
      relatedTasks: undefined,
      dueDate: undefined,
      priority: "medium",
      type: "subtask",
      status: "todo",
    },
  });

  const selectedProjectId = form.watch("projectId");

  const {
    data: projectMembers,
    isLoading: projectMembersLoading,
    isError: projectMembersError,
  } = useProjectMembersQuery(selectedProjectId, {
    enabled: !!selectedProjectId,
  });

  // Fetch tasks for the selected project to populate parent task options
  // Filter for tasks that can be parents (exclude subtasks) and set a reasonable limit
  const {
    data: projectTasks,
    isLoading: projectTasksLoading,
    isError: projectTasksError,
  } = useProjectTasksQuery(
    selectedProjectId,
    {
      type: undefined, // We'll filter on frontend to allow epics, stories, features, bugs
      limit: 50, // Reasonable limit for dropdown
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
    {
      enabled: !!selectedProjectId,
    }
  );

  // Filter tasks that can be parents (exclude subtasks and current task if editing)
  const availableParentTasks = projectTasks?.tasks?.filter(
    (task) => task.type !== "subtask"
  ) || [];

  useEffect(() => {
    if (selectedProjectId && projects) {
      const selectedProject = projects.projects.find(
        (p) => p.id === selectedProjectId
      );
      if (selectedProject) {
        form.setValue("projectKey", selectedProject.projectKey);
      }
    }
    form.setValue("creatorId", id || "", { shouldValidate: true });
    console.log(form.getValues());
  }, [id, selectedProjectId, projects, form]);

  const { mutate: createTask, error: createTaskError } = useCreateTask();

  const onSubmit = (data: CreateTask) => {
    // Convert special values to undefined for optional fields
    const cleanedData = {
      ...data,
      assigneeId:
        data.assigneeId === "unassigned" ? undefined : data.assigneeId,
      teamId: data.teamId === "none" ? undefined : data.teamId,
      parentId: data.parentId === "none" ? undefined : data.parentId,
    };

    console.log("Creating task with data:", cleanedData);
    createTask(cleanedData, {
      onSuccess: (task) => {
        console.log("Task created successfully:", task);
        toast.success("Task created successfully!");
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        console.error("Error creating task:", error);
        toast.error(
          "Failed to create task. Please try again.",
          createTaskError
        );
      },
    });
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
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter task title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Task description (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="projectId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={projectsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="assigneeId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "unassigned"}
                      disabled={projectMembersLoading || !selectedProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {projectMembersError ? (
                          <SelectItem value="error" disabled>
                            Error loading members
                          </SelectItem>
                        ) : (
                          projectMembers?.map((member) => (
                            <SelectItem
                              key={member.user.id}
                              value={member.user.id}
                            >
                              {member.user.firstName && member.user.lastName
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : member.user.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="teamId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                      disabled={teamsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No team</SelectItem>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a due date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
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
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="subtask">Subtask</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="parentId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Task (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                    disabled={projectTasksLoading || !selectedProjectId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !selectedProjectId 
                              ? "Select a project first" 
                              : "Select parent task"
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent</SelectItem>
                      {projectTasksError ? (
                        <SelectItem value="error" disabled>
                          Error loading tasks
                        </SelectItem>
                      ) : (
                        availableParentTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id!}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground uppercase">
                                {task.type}
                              </span>
                              <span>{task.taskKey || task.id}</span>
                              <span className="truncate">{task.title}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                      {!projectTasksLoading && availableParentTasks.length === 0 && selectedProjectId && (
                        <SelectItem value="no-tasks" disabled>
                          No tasks available as parents
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DottedSeparator />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={
                form.formState.isSubmitting ||
                !form.watch("title") ||
                !form.watch("projectId")
              }
              className="w-full"
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
