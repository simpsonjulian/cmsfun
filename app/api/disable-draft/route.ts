import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// Turns Draft Mode back off and returns to the home page.
export async function GET() {
  (await draftMode()).disable();
  redirect('/');
}
