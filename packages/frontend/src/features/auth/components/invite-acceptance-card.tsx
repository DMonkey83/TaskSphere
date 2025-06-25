"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdError, MdCheckCircle } from "react-icons/md";
import { z } from "zod";

import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AcceptInviteData } from "@/lib/api/invites";
import {
  useValidateInvite,
  useRegisterWithInvite,
} from "@/lib/queries/useInvites";

import { RegisterSchema } from "@shared/dto/auth.dto";

const InviteRegisterSchema = RegisterSchema.extend({
  inviteToken: z.string().min(1, "Invite token is required"),
});

type InviteRegisterFormData = z.infer<typeof InviteRegisterSchema>;

export const InviteAcceptanceCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    data: inviteDetails,
    isLoading,
    error: inviteError,
  } = useValidateInvite(token);
  const { mutate: registerWithInvite, isPending: submitting } =
    useRegisterWithInvite();

  const form = useForm<InviteRegisterFormData>({
    resolver: zodResolver(InviteRegisterSchema),
    defaultValues: {
      accountName: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      inviteToken: token || "",
    },
  });

  useEffect(() => {
    if (inviteDetails) {
      form.setValue("email", inviteDetails.email);
      form.setValue("accountName", inviteDetails.accounts.name);
      form.setValue("inviteToken", token || "");
    }
  }, [inviteDetails, token, form]);

  const onSubmit = (data: InviteRegisterFormData) => {
    registerWithInvite(data as AcceptInviteData, {
      onSuccess: () => {
        router.push(
          "/login?message=Account created successfully. Please log in."
        );
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full md:w-[487px] border-none shadow-lg">
        <CardHeader className="flex items-center justify-center text-center p-7">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="p-7 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (inviteError || !inviteDetails) {
    return (
      <Card className="w-full md:w-[487px] border-none shadow-lg">
        <CardHeader className="flex items-center justify-center text-center p-7">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <MdError className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Invalid Invitation
          </CardTitle>
          <CardDescription className="text-center">
            {inviteError?.message ||
              "This invitation link is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7 text-center">
          <Button asChild className="w-full">
            <Link href="/register">Create New Account</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-[487px] border-none shadow-lg">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <MdCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Accept Invitation</CardTitle>
        <CardDescription className="text-center">
          You&apos;ve been invited to join{" "}
          <span className="font-semibold">{inviteDetails.accounts.name}</span>
        </CardDescription>
      </CardHeader>

      <div className="px-7">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="font-medium">{inviteDetails.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Role:</span>
            <Badge variant="secondary" className="text-xs">
              {inviteDetails.role}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Expires:</span>
            <span className="text-sm text-gray-600">
              {new Date(inviteDetails.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="px-7 mt-4">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...field}
                    type="email"
                    disabled
                    className="bg-gray-50"
                  />
                </FormItem>
              )}
            />
            <FormField
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input {...field} type="text" placeholder="First Name" />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input {...field} type="text" placeholder="Last Name" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Create a password"
                  />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting
                ? "Creating Account..."
                : "Accept Invitation & Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <div className="p-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          <FcGoogle className="mr-2 size-5" />
          Sign up with Google
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          <FaGithub className="mr-2 size-5" />
          Sign up with GitHub
        </Button>
      </CardContent>

      <div className="px-7 pb-7">
        <p className="text-xs text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </Card>
  );
};
