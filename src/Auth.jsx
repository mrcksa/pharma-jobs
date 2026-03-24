import { useState } from 'react'
import { supabase } from './supabase'

const css = `
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
  .auth-card{background:#fff;border:0.5px solid #e0e0d8;border-radius:16px;padding:2rem;width:100%;max-width:400px}
  .auth-hero{background:linear-gradient(135deg,#0c447c,#185FA5 60%,#1D9E75);border-radius:12px;padding:1.5rem;color:#fff;margin-bottom:1.5rem;text-align:center}
  .auth-hero h1{margin:0 0 4px;font-size:20px;font-weight:500}
  .auth-hero p{margin:0;font-size:13px;opacity:.75}
  .auth-tabs{display:flex;gap:4px;background:#f1efe8;border-radius:8px;padding:4px;margin-bottom:1.5rem}
  .auth-tab{flex:1;border:none;background:none;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;color:#5f5e5a;transition:all .15s}
  .auth-tab.active{background:#fff;color:#1a1a1a;font-weight:500;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .auth-field{margin-bottom:12px}
  .auth-field label{display:block;font-size:13px;color:#5f5e5a;margin-bottom:5px}
  .auth-field input{width:100%;padding:9px 12px;border:0.5px solid #ccc;border-radius:8px;font-size:14px;outline:none;font-family:inherit}
  .auth-field input:focus{border-color:#378ADD;box-shadow:0 0 0 2px #378ADD22}
  .auth-btn{width:100%;padding:10px;background:linear-gradient(135deg,#185FA5,#1D9E75);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;margin-top:4px;transition:opacity .15s}
  .auth-btn:hover{opacity:.88}
  .auth-btn:disabled{opacity:.45;cursor:not-allowed}
  .auth-error{background:#FCEBEB;color:#A32D2D;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px}
  .auth-success{background:#E1F5EE;color:#0F6E56;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:12px}
  .auth-divider{text-align:center;font-size:12px;color:#888;margin:12px 0}
`

export default function Auth() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  async function handleSubmit() {
    setError(''); setMsg(''); setLoading(true)
    if (!email || !password) { setError('Rellena todos los campos.'); setLoading(false); return }
    if (password.length < 6)  { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return }

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : err.message)
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else setMsg('¡Cuenta creada! Revisa tu email para confirmar el registro.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })
  }

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-hero">
            <h1>Empleo Remoto en Salud</h1>
            <p>Sector farmacéutico y hospitalario</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab${mode==='login'?' active':''}`} onClick={()=>{setMode('login');setError('');setMsg('')}}>Iniciar sesión</button>
            <button className={`auth-tab${mode==='register'?' active':''}`} onClick={()=>{setMode('register');setError('');setMsg('')}}>Crear cuenta</button>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {msg   && <div className="auth-success">{msg}</div>}

          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
          </div>
          <div className="auth-field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
          </div>

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cargando...' : mode==='login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <div className="auth-divider">o continúa con</div>

          <button onClick={handleGoogle} style={{ width:'100%',padding:'9px',border:'0.5px solid #ccc',borderRadius:'10px',background:'#fff',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',fontFamily:'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google
          </button>
        </div>
      </div>
    </>
  )
}
