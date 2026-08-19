export function Field({ as = 'input', label, name, options = [], ...props }) {
  const controlClass =
    'min-h-10 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 placeholder:text-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950'

  return (
    <label className="grid gap-1 text-sm font-medium text-neutral-700">
      {label}
      {as === 'select' ? (
        <select className={controlClass} name={name} {...props}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea className={`${controlClass} min-h-24 resize-y`} name={name} {...props} />
      ) : (
        <input className={controlClass} name={name} {...props} />
      )}
    </label>
  )
}
