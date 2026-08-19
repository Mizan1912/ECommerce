import { Link } from 'react-router-dom'

const variants = {
  primary:
    'border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-neutral-950',
  secondary:
    'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400 focus-visible:outline-neutral-950',
  ghost:
    'border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-950',
}

export function Button({ children, className = '', to, variant = 'primary', ...props }) {
  const classes = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  )
}
