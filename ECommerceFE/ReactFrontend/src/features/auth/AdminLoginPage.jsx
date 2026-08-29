import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function AdminLoginPage() {
  const { signIn } = useApp()
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
      if (nextSession.role !== 'admin') {
        throw new Error('Access denied. This portal is only for administrators.')
      }
      toast.success('Admin authentication successful')
      navigate(next || '/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      toast.error(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md p-5">
      <Card className="p-5">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-700">
            <ShieldCheck size={32} />
          </div>
        </div>
        <PageHeader 
          eyebrow="Portal" 
          title="Admin Authentication" 
          description="Enter credentials to access the operations dashboard."
        />
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
      </Card>
    </section>
  )
}
