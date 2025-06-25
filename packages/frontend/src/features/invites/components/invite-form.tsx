"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInvite } from "@/lib/queries/useInvites";

const InviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "project_manager", "member", "viewer"], {
    required_error: "Please select a role",
  }),
});

type InviteFormData = z.infer<typeof InviteFormSchema>;

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner", description: "Full access to everything" },
  { value: "admin", label: "Admin", description: "Manage team and projects" },
  {
    value: "project_manager",
    label: "Project Manager",
    description: "Manage assigned projects",
  },
  { value: "member", label: "Member", description: "Collaborate on projects" },
  { value: "viewer", label: "Viewer", description: "View-only access" },
];

export const InviteForm = () => {
  const { mutate: createInvite, isPending } = useCreateInvite();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      email: "",
      role: undefined,
    },
  });

  const onSubmit = (data: InviteFormData) => {
    createInvite(data as { email: string; role: string }, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...field}
                type="email"
                placeholder="colleague@company.com"
                className="mt-1"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Label>Role</Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-gray-500">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Description */}
        {form.watch("role") && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      ℹ️
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    {
                      ROLE_OPTIONS.find((r) => r.value === form.watch("role"))
                        ?.label
                    }{" "}
                    Role
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {
                      ROLE_OPTIONS.find((r) => r.value === form.watch("role"))
                        ?.description
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Sending..." : "Send Invitation"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  );
};
