import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get('refresh_token')?.value;

  if (refreshToken) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to TaskSphere</h1>
        <p className="mb-4">Manage projects for programming, legal, and logistics teams.</p>
        <div className="space-x-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
