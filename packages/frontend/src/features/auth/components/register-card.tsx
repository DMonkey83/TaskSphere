'use client'

import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, RegisterInput } from "@shared/dto/auth.dto";
import { useRegister } from "@/lib/queries/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DottedSeparator } from '@/components/dotted-separator';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const RegisterCard = () => {

  const router = useRouter()
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      accountName: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      industry: 'other'
    }

  })

  const { mutate: registerUser, isPending } = useRegister()

  const onSubmit = (data: RegisterInput) => {
    registerUser(data, {
      onSuccess: () => {
        router.push('/login')
      }
    })
  }
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">
          Sign Up
        </CardTitle>
        <CardDescription>
          By signing up, you agree to our {' '}
          <Link href='/terms'><span className='text-blue-700'>Terms of Service</span></Link>{' '}
          and {' '}
          <Link href='policy'><span className='text-blue-700'>Privacy Policy</span></Link>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="accountName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="text"
                    placeholder="whatever"
                  />
                </FormItem>
              )}>
            </FormField>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@email.com"
                  />
                </FormItem>
              )}>
            </FormField>
            <FormField
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="text"
                    placeholder="First Name"
                  />
                </FormItem>
              )}>
            </FormField>
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Last Name"
                  />
                </FormItem>
              )}>
            </FormField>
            <FormField
              name="industry"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Industry"
                  />
                </FormItem>
              )}>
            </FormField>
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="password"
                    placeholder='Password'
                  />
                </FormItem>
              )}>
            </FormField>
            <Button type='submit' disabled={isPending} size='lg' className="w-full">
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="p-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button variant="secondary" size="lg" className="w-full">
          <FcGoogle className='mr-2 size-5' />
          Log in with Google
        </Button>
        <Button variant="secondary" size="lg" className="w-full">
          <FaGithub className='mr-2 size-5' />
          Log in with GitHub
        </Button>
      </CardContent>
    </Card >
  )
}

