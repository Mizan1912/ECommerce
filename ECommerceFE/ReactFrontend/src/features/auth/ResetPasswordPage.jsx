import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function ResetPasswordPage() {
  const { showApiNotice } = useApp()

  return (
    <Card className="mx-auto max-w-xl p-5">
      <PageHeader eyebrow="Recovery" title="Reset password" description="Consumes a backend reset token once the auth API is connected." />
      <form className="mt-5 grid gap-4" onSubmit={(event) => event.preventDefault()}>
        <Field label="Reset token" name="token" placeholder="Token from email link" />
        <Field label="New password" name="password" placeholder="Minimum 10 characters" type="password" />
        <Button onClick={() => showApiNotice('authApi.resetPassword')}>Reset password</Button>
      </form>
    </Card>
  )
}
