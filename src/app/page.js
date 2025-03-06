import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side redirect to default language
  redirect('/tw');
  
  // This will never be rendered
  return null;
}