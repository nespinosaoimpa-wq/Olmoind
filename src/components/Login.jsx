import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (authError) throw authError;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message === 'Invalid login credentials' ? 'CREDENCIALES INCORRECTAS' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            color: '#fff',
            fontFamily: 'var(--font-main)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '10px', fontWeight: '900', letterSpacing: '4px' }}>OLMO ADMIN</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '40px', letterSpacing: '2px' }}>ACCESO RESTRINGIDO</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} color="var(--accent)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="EMAIL"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                outline: 'none',
                                fontWeight: '700',
                                fontSize: '12px',
                                letterSpacing: '1px'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="var(--accent)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="CONTRASEÑA"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                outline: 'none',
                                fontWeight: '700',
                                fontSize: '12px',
                                letterSpacing: '1px'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ff4444', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? '#64748b' : '#fff',
                            color: '#000',
                            padding: '15px',
                            border: 'none',
                            fontWeight: '900',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            letterSpacing: '2px',
                            fontSize: '11px',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'INGRESANDO...' : <span>INGRESAR <ArrowRight size={16} style={{ display: 'inline', marginLeft: '6px' }} /></span>}
                    </button>

                    <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '10px', marginTop: '20px', display: 'block', textDecoration: 'none', fontWeight: '600' }}>VOLVER A LA TIENDA</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
