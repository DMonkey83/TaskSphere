"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Upload, Download } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useBulkCreateInvites } from "@/lib/queries/useInvites";

import { RoleEnum } from "@shared/enumsTypes";

const BulkInviteSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email("Invalid email"),
        role: z.enum(["owner", "admin", "project_manager", "member", "viewer"]),
      })
    )
    .min(1, "At least one invite is required")
    .max(50, "Maximum 50 invites allowed"),
});

type BulkInviteData = z.infer<typeof BulkInviteSchema>;

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "project_manager", label: "Project Manager" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export const BulkInviteForm = () => {
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [csvText, setCsvText] = useState("");
  const [mode, setMode] = useState<"manual" | "csv">("manual");

  const { mutate: bulkCreateInvites, isPending } = useBulkCreateInvites();

  const form = useForm<BulkInviteData>({
    resolver: zodResolver(BulkInviteSchema),
    defaultValues: {
      invites: [],
    },
  });

  const invites = form.watch("invites");

  const addInvite = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail || !selectedRole) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return;

    // Check for duplicates
    const exists = invites.some(
      (invite) => invite.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (exists) return;

    const currentInvites = form.getValues("invites");
    form.setValue("invites", [
      ...currentInvites,
      { email: trimmedEmail, role: selectedRole as RoleEnum },
    ]);

    setEmailInput("");
  };

  const removeInvite = (index: number) => {
    const currentInvites = form.getValues("invites");
    form.setValue(
      "invites",
      currentInvites.filter((_, i) => i !== index)
    );
  };

  const processCsvInput = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split("\n");
    const newInvites: Array<{
      email: string;
      role: "owner" | "admin" | "project_manager" | "member" | "viewer";
    }> = [];

    lines.forEach((line) => {
      const [email, role] = line.split(",").map((item) => item.trim());

      if (email && email.includes("@")) {
        const validRole = ROLE_OPTIONS.find(
          (r) =>
            r.value === role || r.label.toLowerCase() === role?.toLowerCase()
        );

        newInvites.push({
          email: email.toLowerCase(),
          role: (validRole?.value || "member") as
            | "owner"
            | "admin"
            | "project_manager"
            | "member"
            | "viewer",
        });
      }
    });

    // Remove duplicates and merge with existing
    const existingEmails = new Set(
      invites.map((inv) => inv.email.toLowerCase())
    );
    const filteredNewInvites = newInvites.filter(
      (inv) => !existingEmails.has(inv.email.toLowerCase())
    );

    form.setValue("invites", [...invites, ...filteredNewInvites]);
    setCsvText("");
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "email,role\nexample1@company.com,member\nexample2@company.com,admin\nexample3@company.com,project_manager";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invite-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = (data: BulkInviteData) => {
    bulkCreateInvites(
      data as { invites: Array<{ email: string; role: string }> },
      {
        onSuccess: () => {
          form.reset();
          setEmailInput("");
          setCsvText("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={mode === "manual" ? "primary" : "outline"}
          onClick={() => setMode("manual")}
          size="sm"
        >
          Manual Entry
        </Button>
        <Button
          type="button"
          variant={mode === "csv" ? "primary" : "outline"}
          onClick={() => setMode("csv")}
          size="sm"
        >
          CSV Import
        </Button>
      </div>

      {mode === "manual" && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Add Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addInvite())
                  }
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addInvite} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "csv" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">CSV Import</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadCsvTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-input">
                Paste CSV data (email,role format)
              </Label>
              <Textarea
                id="csv-input"
                placeholder="example1@company.com,member&#10;example2@company.com,admin&#10;example3@company.com,project_manager"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <Button type="button" onClick={processCsvInput}>
              <Upload className="h-4 w-4 mr-2" />
              Process CSV
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invites List */}
      {invites.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Pending Invitations ({invites.length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("invites", [])}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {invites.map((invite, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">{invite.email}</span>
                    <Badge variant="secondary">
                      {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvite(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Submit Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="invites"
            control={form.control}
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isPending || invites.length === 0}
              className="flex-1"
            >
              {isPending
                ? "Sending Invitations..."
                : `Send ${invites.length} Invitation${
                    invites.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
