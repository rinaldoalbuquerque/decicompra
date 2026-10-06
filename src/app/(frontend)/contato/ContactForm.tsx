'use client'

import { useActionState } from 'react'

import { CONTACT_SUBJECTS, HONEYPOT_FIELD, type ContactField } from '@/content/contact'

import { sendContact, type ContactState } from './actions'

const INITIAL: ContactState = { status: 'idle' }

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 aria-[invalid=true]:border-negativo'

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, INITIAL)

  if (state.status === 'sent') {
    return (
      <p role="status" className="mt-6 rounded-xl bg-green-50 p-5 font-semibold text-verde-texto">
        Mensagem enviada. Obrigado pelo contato! Respondemos pelo e-mail informado.
      </p>
    )
  }

  const error = (name: ContactField) =>
    state.errors?.[name] ? (
      <span id={`erro-${name}`} className="mt-1 block text-sm text-negativo">
        {state.errors[name]}
      </span>
    ) : null
  const invalid = (name: ContactField) => ({
    'aria-invalid': Boolean(state.errors?.[name]),
    'aria-describedby': state.errors?.[name] ? `erro-${name}` : undefined,
  })

  return (
    <form action={action} className="mt-6 max-w-xl space-y-4" noValidate>
      {state.status === 'error' && state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-negativo">
          {state.message}
        </p>
      ) : null}
      <label className="block">
        <span className="font-semibold">Nome</span>
        <input name="nome" autoComplete="name" required maxLength={100} defaultValue={state.values?.nome} className={inputClass} {...invalid('nome')} />
        {error('nome')}
      </label>
      <label className="block">
        <span className="font-semibold">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          defaultValue={state.values?.email}
          className={inputClass}
          {...invalid('email')}
        />
        {error('email')}
      </label>
      <label className="block">
        <span className="font-semibold">Assunto</span>
        <select name="assunto" required defaultValue={state.values?.assunto ?? ''} className={inputClass} {...invalid('assunto')}>
          <option value="" disabled>
            Escolha um assunto
          </option>
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        {error('assunto')}
      </label>
      <label className="block">
        <span className="font-semibold">Mensagem</span>
        <textarea name="mensagem" required rows={6} maxLength={5000} defaultValue={state.values?.mensagem} className={inputClass} {...invalid('mensagem')} />
        {error('mensagem')}
      </label>
      {/* Campo isca para robôs: escondido de pessoas e de leitores de tela */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Não preencha este campo
          <input name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-azul-profundo px-5 py-3 font-semibold text-branco disabled:opacity-60">
        {pending ? 'Enviando…' : 'Enviar mensagem'}
      </button>
    </form>
  )
}
