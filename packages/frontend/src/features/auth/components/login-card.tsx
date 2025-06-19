"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/queries/auth";

import { LoginInput, LoginSchema } from "@shared/dto/auth.dto";

export const LoginCard = () => {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: loginUser, isPending } = useLogin();

  const onSubmit = (data: LoginInput) => {
    loginUser(data, {
      onSuccess: (response) => {
        // Check if this is a first-time login and redirect accordingly
        if (response.isFirstLogin) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      },
      onError: (error) => {
        const message = error.message || "Login failed";
        form.setError("root", {
          type: "server",
          message: message,
        });
      },
    });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
      </CardHeader>
      <div className="px-7">
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
                  <Input {...field} type="email" placeholder="Email" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input {...field} type="password" />
                </FormItem>
              )}
            />
            <Button disabled={isPending} size="lg" className="w-full">
              Login
            </Button>
            {form.formState.errors.root && (
              <div className="text-sm font-medium text-destructive">
                {JSON.parse(form.formState.errors.root.message).message}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <div className="p-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button variant="secondary" size="lg" className="w-full">
          <FcGoogle className="mr-2 size-5" />
          Log in with Google
        </Button>
        <Button variant="secondary" size="lg" className="w-full">
          <FaGithub className="mr-2 size-5" />
          Log in with GitHub
        </Button>
      </CardContent>
    </Card>
  );
};
