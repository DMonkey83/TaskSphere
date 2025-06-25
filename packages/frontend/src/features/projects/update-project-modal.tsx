"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdEdit } from "react-icons/md";
import { toast } from "sonner";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
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
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProject } from "@/lib/queries/useProjects";
import { projectStore } from "@/store/project-store";

import {
  ProjectResponse,
  UpdateProject,
  UpdateProjectSchema,
} from "@shared/dto/projects.dto";
import { Industries } from "@shared/enumsTypes/industries.enum";
import { RiskLevelEnum, RiskLevels } from "@shared/enumsTypes/risk-level-enum";
import { Visibilities } from "@shared/enumsTypes/visibility.enum";
import { Workflows } from "@shared/enumsTypes/workflow.enum";
import { projectKeys } from "@shared/keys/project-keys";

interface UpdateProjectModalProps {
  trigger?: React.ReactNode;
  projectDetails: ProjectResponse;
  isCreating?: boolean;
}
export const UpdateProjectModal = ({
  trigger,
  projectDetails,
  isCreating = false,
}: UpdateProjectModalProps) => {
  const { updateProject } = projectStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<UpdateProject>({
    resolver: zodResolver(UpdateProjectSchema),
    mode: "onChange",
    defaultValues: {
      id: projectDetails?.id || "",
      name: projectDetails?.name || "",
      industry: projectDetails?.industry || undefined,
      workflow: projectDetails?.workflow || "kanban",
      description: projectDetails?.description || "",
      matterNumber: projectDetails?.matterNumber || "",
      config: projectDetails?.config || {},
      visibility: projectDetails?.visibility || "private",
      tags: projectDetails?.tags || [],
      startDate: projectDetails?.startDate
        ? new Date(projectDetails.startDate)
        : undefined,
      endDate: projectDetails?.endDate
        ? new Date(projectDetails.endDate)
        : undefined,
      budget: projectDetails?.budget
        ? parseInt(projectDetails?.budget?.toString())
        : undefined,
      clientApprovalRequired: projectDetails?.clientApprovalRequired || false,
      template: projectDetails?.template || false,
      sprintDuration: projectDetails?.sprintDuration || undefined,
      riskLevel: projectDetails?.riskLevel || RiskLevelEnum.Medium,
    },
  });

  // Update form with project details when loaded
  useEffect(() => {
    if (projectDetails) {
      if (projectDetails.id) form.setValue("id", projectDetails.id);
      form.setValue("name", projectDetails.name || "");
      form.setValue("industry", projectDetails.industry || undefined);
      form.setValue("workflow", projectDetails.workflow || "kanban");
      form.setValue("description", projectDetails.description || "");
      form.setValue("matterNumber", projectDetails.matterNumber || "");
      form.setValue("visibility", projectDetails.visibility || "private");
      form.setValue("tags", projectDetails.tags || []);
      form.setValue("startDate", projectDetails.startDate || undefined);
      form.setValue("endDate", projectDetails.endDate || undefined);
      form.setValue(
        "budget",
        parseInt(projectDetails?.budget?.toString()) || undefined
      );
      form.setValue(
        "clientApprovalRequired",
        projectDetails.clientApprovalRequired || false
      );
      form.setValue("template", projectDetails.template || false);
      form.setValue(
        "sprintDuration",
        projectDetails.sprintDuration || undefined
      );
      form.setValue("riskLevel", projectDetails.riskLevel || "medium");
      form.setValue("config", projectDetails.config || {});
    }
  }, [projectDetails, form]);

  const { mutate: updateProjectMutation } = useUpdateProject();

  const onSubmit = (data: UpdateProject) => {
    updateProjectMutation(data, {
      onSuccess: (response: ProjectResponse) => {
        updateProject({ ...data });
        toast.success("Project updated successfully!");
        form.reset();
        queryClient.invalidateQueries({
          queryKey: projectKeys.bySlug(response.slug),
        });
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          `Failed to update project: ${error.message || "Unknown error"}`
        );
      },
    });
  };

  console.log("Setting form values with project details:", projectDetails);
  console.log("UpdateProjectModal - form values:", form.getValues());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MdEdit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create New Project" : "Update Project"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Set up a new project to organize your team's work and track progress."
              : "Update project details and settings."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
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
                          placeholder="Enter project name"
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Industries.map((industry) => (
                            <SelectItem
                              key={industry.value}
                              value={industry.value}
                            >
                              {industry.label}
                            </SelectItem>
                          ))}
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
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DottedSeparator />

            {/* Project Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="workflow"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a workflow" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Workflows.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="visibility"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Visibilities.map((visibility) => (
                            <SelectItem
                              key={visibility.value}
                              value={visibility.value}
                            >
                              {visibility.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="riskLevel"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RiskLevels.map((risk) => (
                            <SelectItem key={risk.value} value={risk.value}>
                              {risk.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("workflow") === "scrum" && (
                  <FormField
                    name="sprintDuration"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sprint Duration (days)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="14"
                            onChange={(e) =>
                              field.onChange(
                                parseInt(e.target.value, 10) || undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Duration of each sprint in days
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DottedSeparator />

            {/* Schedule & Budget */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Schedule & Budget</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                                <span>Pick a start date</span>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
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
                                <span>Pick an end date</span>
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
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate ? date < startDate : false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="budget"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter budget amount"
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Project budget in your default currency
                      </FormDescription>
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
                            placeholder="Enter matter number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DottedSeparator />

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Additional Options</h3>

              <FormField
                name="tags"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add project tags..."
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help organize and find your project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  name="clientApprovalRequired"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Client Approval Required</FormLabel>
                        <FormDescription>
                          Require client approval for major project decisions
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  name="template"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save as Template</FormLabel>
                        <FormDescription>
                          Save this project configuration as a template for
                          future use
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DottedSeparator />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting
                ? isCreating
                  ? "Creating..."
                  : "Updating..."
                : isCreating
                ? "Create Project"
                : "Update Project"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
