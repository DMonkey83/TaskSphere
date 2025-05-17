import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to TaskSphere</h1>
        <p className="mb-4">Manage projects for programming, legal, and logistics teams.</p>
        <div className="space-x-4">
        </div>
      </div>
    </div>
  );
}
