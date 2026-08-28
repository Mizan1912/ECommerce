export function Field({ as = 'input', error, hint, label, name, options = [], ...props }) {
  const controlClass = `min-h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-950 placeholder:text-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
    error ? 'border-red-400' : 'border-neutral-200'
  }`

  const normalisedOptions = options.map((option) =>
    typeof option === 'object' && option !== null ? option : { label: option, value: option },
  )

  return (
    <label className="grid gap-1 text-sm font-medium text-neutral-700">
      {label}
      {as === 'select' ? (
        <select className={controlClass} name={name} {...props}>
          {normalisedOptions.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea className={`${controlClass} min-h-24 resize-y`} name={name} {...props} />
      ) : (
        <input className={controlClass} name={name} {...props} />
      )}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs font-normal text-neutral-500">{hint}</span> : null}
    </label>
  )
}
