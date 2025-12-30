import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { UserRole } from '@/lib/db/models/user.model'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = session.user.role as UserRole

  switch (role) {
    case UserRole.MERCHANT:
      redirect('/dashboard/merchant')
    case UserRole.COMPANY_ADMIN:
      redirect('/dashboard/company')
    case UserRole.EMPLOYEE:
      redirect('/dashboard/employee')
    default:
      redirect('/')
  }
}
