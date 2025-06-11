'use client'

import { useForm } from "react-hook-form"
import { CreateProject, CreateProjectSchema, ProjectResponse } from "@shared/dto/projects.dto"
import { projectKeys } from "@shared/keys/project-keys"
import { Industries } from "@shared/enumsTypes/industries.enum"
import { Workflows, WorkflowEnum } from "@shared/enumsTypes/workflow.enum"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MdAdd } from "react-icons/md"
import { Form, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userStore } from "@/store/user-store"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DottedSeparator } from "@/components/dotted-separator"
import { useCreateProject } from "@/lib/queries/useProjects"
import { projectStore } from "@/store/project-store"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface CreateProjectModalProps {
  trigger?: React.ReactNode
}

export const CreateProjectModal = ({ trigger }: CreateProjectModalProps) => {
  const { accountId, id } = userStore((state) => state.user);
  const { addProject } = projectStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<CreateProject>({
    resolver: zodResolver(CreateProjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      industry: undefined,
      workflow: WorkflowEnum.Scrum,
      accountId: accountId || '',
      ownerId: id || '',
      description: "",
      matterNumber: "",
      config: {},
      visibility: 'private',
      tags: [],
      startDate: undefined,
      endDate: undefined,
      slug: "",
    },
  })

  useEffect(() => {
    form.setValue('accountId', accountId || '', { shouldValidate: true })
    form.setValue('ownerId', id || '', { shouldValidate: true })
  }, [accountId, id, form.getValues()])

  const { mutate: createProject } = useCreateProject();

  const onSubmit = (data: CreateProject) => {
    createProject(data, {
      onSuccess: (response: ProjectResponse) => {
        addProject({ ...data, id: response.id || Date.now().toString() });
        toast.success("Project created successfully!")
        form.reset();
        queryClient.invalidateQueries({ queryKey: projectKeys.byAccount(data.accountId) })
        setOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
      }
    })
    console.log("Creating project with data:", data)
  }

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
      <DialogContent className='sm:max-w-[500px] lg:max-w-[1000px]'>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Set up a new project to organize your team`$apos`s work and track progress.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Project Name</Label>
                    <Input id='name' {...field} type="text" placeholder="Project Name" />
                  </FormItem>
                )}
              />
              <FormField
                name="industry"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="industry">Industry</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value} >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Industry" />
                        <SelectContent>
                          {Industries.map((industry) => {
                            return <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
                          })}
                        </SelectContent>
                      </SelectTrigger>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    {...field}
                    placeholder="Brief description of the project"
                  />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                name="workflow"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="planningType">Plannig Type</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value} >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Planning Type" />
                        <SelectContent>
                          {Workflows.map((type) => {
                            return <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          })}
                        </SelectContent>
                      </SelectTrigger>
                    </Select>
                  </FormItem>
                )}
              />
              {form.watch("industry") === 'legal' && (
                <FormField
                  name="matterNumber"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="matterNumber">Matter Number</Label>
                      <Input id='matterNumber' {...field} type="text" placeholder="Matter Number" />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DottedSeparator />
            <Button onClick={() => console.log('button clicked', form.getValues())} type='submit' size='lg' variant="primary" disabled={false} className="w-full">Create Project</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
