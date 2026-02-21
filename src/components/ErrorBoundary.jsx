import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px', background: '#0f172a', color: '#fff',
                    height: '100vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>⚠️ Algo salió mal</h1>
                    <p style={{ maxWidth: '600px', marginBottom: '24px', opacity: 0.8 }}>
                        La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
                    </p>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                        padding: '16px', borderRadius: '8px', fontSize: '12px',
                        textAlign: 'left', width: '100%', maxWidth: '600px', overflowX: 'auto'
                    }}>
                        <code style={{ color: '#f87171' }}>{this.state.error?.toString()}</code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '32px', padding: '12px 24px', background: '#3b82f6',
                            color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '700'
                        }}
                    >
                        Recargar Aplicación
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
