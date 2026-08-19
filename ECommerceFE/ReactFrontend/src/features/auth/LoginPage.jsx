import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function LoginPage() {
  const { previewLogin, session, showApiNotice } = useApp()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col justify-center rounded-lg bg-neutral-950 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Role-aware access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">One login form, backend role decides the destination.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-300">
          The real API will return the user role. For now, preview buttons let you inspect customer and admin experiences without sending credentials.
        </p>
        {next ? <p className="mt-4 text-sm text-amber-200">Admin access needs an admin preview session.</p> : null}
      </div>
      <Card className="p-5">
        <PageHeader eyebrow="Login" title="Welcome back" />
        <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Email" name="email" placeholder="customer@example.com" type="email" />
          <Field label="Password" name="password" placeholder="Password" type="password" />
          <Button onClick={() => showApiNotice('authApi.login')}>
            <LockKeyhole size={18} />
            Connect login API
          </Button>
        </form>
        <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5">
          <Button onClick={() => previewLogin('customer')} variant="secondary">
            <UserRound size={18} />
            Preview customer login
          </Button>
          <Button onClick={() => previewLogin('admin')} variant="secondary">
            <ShieldCheck size={18} />
            Preview admin login
          </Button>
          {session ? <p className="text-sm text-neutral-500">Active preview session: {session.role}</p> : null}
          <Button to="/forgot-password" variant="ghost">
            Forgot password?
          </Button>
        </div>
      </Card>
    </section>
  )
}
