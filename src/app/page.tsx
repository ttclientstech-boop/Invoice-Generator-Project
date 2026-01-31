import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

export default async function Home() {
  // Authentication Check
  const cookieStore = await cookies();
  const cookieName = process.env.COOKIE_NAME || 'admin_session';
  const hasCookie = cookieStore.has(cookieName);

  if (!hasCookie) {
    redirect('/login');
  }

  // If authenticated, render the dashboard
  return <Dashboard />;
}
