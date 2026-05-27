import { redirect } from 'next/navigation';

export default function LoginRedirect() {
 // Redirect `/login` to root where the auth page now lives.
 redirect('/');
}
