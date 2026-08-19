import { MailCheck, Shield, Smartphone } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function AccountPage() {
  const { session, showApiNotice, signOut } = useApp()

  if (!session) {
    return (
      <Card className="p-6">
        <EmptyState
          description="Profile, email verification, MFA, and order ownership surfaces unlock after auth integration."
          title="No active customer session"
        />
        <div className="mt-4 flex justify-center">
          <Button to="/login" variant="secondary">
            Login
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <PageHeader eyebrow="Account" title={`Hello, ${session.name}`} description="Preview account data. Replace with GET /auth/me or GET /users/me." />
        <Card className="mt-5 p-4">
          <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" name="name" placeholder={session.name} />
              <Field label="Email" name="email" placeholder={session.email} />
            </div>
            <Button onClick={() => showApiNotice('PATCH /users/me')} variant="secondary">
              Save profile
            </Button>
          </form>
        </Card>
      </div>
      <div className="grid h-fit gap-4">
        {[
          [MailCheck, 'Email verification', 'POST /auth/verify-email'],
          [Smartphone, 'MFA setup', 'POST /auth/mfa/setup and /auth/mfa/verify'],
          [Shield, 'Session security', 'POST /auth/refresh and /auth/logout'],
        ].map(([Icon, title, text]) => (
          <Card className="p-4" key={title}>
            <Icon className="text-emerald-700" size={22} />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-neutral-500">{text}</p>
          </Card>
        ))}
        <Button onClick={signOut} variant="secondary">
          Sign out preview
        </Button>
      </div>
    </section>
  )
}
