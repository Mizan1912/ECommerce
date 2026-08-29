import { LockKeyhole, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function LoginPage() {
  const { previewLogin, session, signIn } = useApp()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const nextSession = await signIn({ email: formData.email.trim(), password: formData.password })
      toast.success('Login successful')
      navigate(next || (nextSession.role === 'admin' ? '/admin' : '/'), { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      toast.error(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col justify-center rounded-lg bg-neutral-950 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Role-aware access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">One login form, the backend role decides the destination.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-300">
          Customers land on the storefront, administrators land in the admin console. Sessions are backed by a JWT
          access token issued by the API.
        </p>
        {next ? <p className="mt-4 text-sm text-amber-200">Sign in with an admin account to reach {next}.</p> : null}
      </div>

      <Card className="p-5">
        <PageHeader eyebrow="Login" title="Welcome back" />
        <form className="mt-5 grid gap-4" onSubmit={handleLogin}>
          <Field
            autoComplete="email"
            label="Email"
            name="email"
            onChange={handleChange}
            placeholder="admin@ecommerce.local"
            required
            type="email"
            value={formData.email}
          />
          <Field
            autoComplete="current-password"
            error={error}
            label="Password"
            name="password"
            onChange={handleChange}
            placeholder="Password"
            required
            type="password"
            value={formData.password}
          />
          <Button disabled={submitting} type="submit">
            <LockKeyhole size={18} />
            {submitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5">
          <Button onClick={() => previewLogin('customer')} variant="secondary">
            <UserRound size={18} />
            Preview customer storefront
          </Button>
          {session ? <p className="text-sm text-neutral-500">Signed in as {session.email} ({session.role})</p> : null}
          <Button to="/forgot-password" variant="ghost">
            Forgot password?
          </Button>
          <Button to="/register" variant="ghost">
            Don&apos;t have an account? Register
          </Button>
        </div>
      </Card>
    </section>
  )
}
