import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { authApi } from '../../lib/api/client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await authApi.forgotPassword({ email })
      setSent(true)
      toast.success(response?.message ?? 'If the account exists, a reset mail was sent.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-xl p-5">
      <PageHeader
        eyebrow="Recovery"
        title="Forgot password"
        description="The API always returns a neutral response, so this never reveals whether an account exists."
      />
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <Field
          label="Email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="customer@ecommerce.local"
          required
          type="email"
          value={email}
        />
        <Button disabled={submitting} type="submit">
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
        {sent ? (
          <p className="text-sm text-neutral-500">If that account exists, a reset link is on its way.</p>
        ) : null}
      </form>
    </Card>
  )
}
