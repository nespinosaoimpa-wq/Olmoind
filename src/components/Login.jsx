import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === 'Olmoind' && password === 'EliasOlmos1234') {
            onLogin();
        } else {
            setError('CREDENCIALES INCORRECTAS');
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
                            type="text"
                            placeholder="USUARIO"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                        style={{
                            background: '#fff',
                            color: '#000',
                            padding: '15px',
                            border: 'none',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            letterSpacing: '2px',
                            fontSize: '11px',
                            marginTop: '10px'
                        }}
                    >
                        INGRESAR <ArrowRight size={16} />
                    </button>

                    <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '10px', marginTop: '20px', display: 'block', textDecoration: 'none', fontWeight: '600' }}>VOLVER A LA TIENDA</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
