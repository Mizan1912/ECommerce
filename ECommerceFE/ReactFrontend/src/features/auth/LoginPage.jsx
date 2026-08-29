import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useApp } from '../../lib/appContext'

export function LoginPage() {
  const { previewLogin, session } = useApp()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const requestBody = {
      email: formData.email,
      password: formData.password
    }

    try {
      const response = await axios.post(
        "https://ecommerce-i02q.onrender.com/api/v1/auth/login",
        // "https://hfvf76kr-5000.inc1.devtunnels.ms/api/v1/auth/login",
        requestBody
      )

      console.log(response.data)

      const token = response.data?.data?.accessToken || response.data?.token || response.data?.accessToken
      const user = response.data?.data?.user || response.data?.user

      if (token) {
        localStorage.setItem('ec.accessToken', token)
      }
      if (user) {
        localStorage.setItem('ec.user', JSON.stringify(user))
      }

      toast.success("login successful!")
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)

    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Login failed"
      setError(errMsg)
      toast.error(errMsg)
      console.error(err.response?.data || err.message)
    }
  }

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
        <form className="mt-5 grid gap-4" onSubmit={handleLogin}>
          <Field
            label="Email"
            name="email"
            placeholder="customer@example.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Field
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={error}
          />

          <Button type="submit">
            <LockKeyhole size={18} />
            Login
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
          {session ? (
            <p className="text-sm text-neutral-500">
              Active preview session: {session.role}
            </p>
          ) : null}
          <Button to="/forgot-password" variant="ghost">
            Forgot password?
          </Button>
          <Button to="/register" variant="ghost">
            Don't have an Account?/Register
          </Button>
        </div>
      </Card>
    </section>
  )
}
