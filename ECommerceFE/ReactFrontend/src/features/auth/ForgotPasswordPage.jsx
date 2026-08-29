import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function ForgotPasswordPage() {
  const { showApiNotice } = useApp()

  return (
    <Card className="mx-auto max-w-xl p-5">
      <PageHeader eyebrow="Recovery" title="Forgot password" description="Sends a neutral reset response after API integration." />
      <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
        <Field label="Email" name="email" placeholder="customer@example.com" type="email" />
        <Button onClick={() => showApiNotice('authApi.forgotPassword')}>Send reset link</Button>
      </form>
    </Card>
  )
}
