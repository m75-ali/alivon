'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Password field with a show/hide toggle. Used on login and signup (password
// + confirm). Pass value/onChange to control it (signup needs this to compare
// the two fields); omit them for a plain uncontrolled field (login).
export default function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  minLength,
  value,
  onChange,
  error = false,
}: {
  id: string
  name: string
  label: string
  autoComplete: string
  minLength?: number
  value?: string
  onChange?: (value: string) => void
  error?: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-alivon-muted">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder="••••••••"
          value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          className={`block w-full rounded-xl border bg-white px-3 py-2.5 pr-10 text-sm text-alivon-dark placeholder:text-alivon-border focus:outline-none focus:ring-1 focus:ring-alivon-primary ${
            error ? 'border-red-400 focus:border-red-400' : 'border-alivon-border focus:border-alivon-primary'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-alivon-muted transition-colors hover:text-alivon-dark"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
