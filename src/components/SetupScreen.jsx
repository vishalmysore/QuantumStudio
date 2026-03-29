import { useState } from 'react';
import { KeyRound, ShieldCheck, ArrowRight, Server, Cpu, Loader2, AlertCircle } from 'lucide-react';
import { testConnection } from '../services/llm';

const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--panel-border)',
    padding: '12px',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
};

export default function SetupScreen({ onSave }) {
    const [apiKey, setApiKey] = useState('');
    const [endpoint, setEndpoint] = useState('https://integrate.api.nvidia.com/v1');
    const [model, setModel] = useState('nvidia/nemotron-nano-12b-v2-vl');
    // Auto-enable proxy on localhost — all external APIs block direct browser requests via CORS
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const [useProxy, setUseProxy] = useState(isLocalhost);
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        setIsTesting(true);
        setError(null);
        try {
            await testConnection(apiKey, endpoint, model, useProxy);
            onSave(apiKey, endpoint, model, useProxy);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Configure Sandbox</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Connect to any OpenAI-compatible LLM endpoint.</p>
                </div>

                {/* Endpoint */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Server size={16} /> Inference Endpoint
                    </label>
                    <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://integrate.api.nvidia.com/v1" style={inputStyle} />
                </div>

                {/* Model */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} /> Model Name
                    </label>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                        placeholder="nvidia/nemotron-nano-12b-v2-vl" style={inputStyle} />
                </div>

                {/* API Key */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <KeyRound size={16} /> API Key
                    </label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                        placeholder="nvapi-... or sk-..." style={inputStyle} />
                </div>

                {/* Proxy toggle */}
                <div style={{
                    background: useProxy ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${useProxy ? 'rgba(16,185,129,0.3)' : 'var(--panel-border)'}`,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                }} onClick={() => setUseProxy(p => !p)}>
                    <input type="checkbox" id="useProxy" checked={useProxy} readOnly
                        style={{ cursor: 'pointer', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            Route via local proxy
                            {isLocalhost && (
                                <span style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    AUTO-ON · localhost
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            Bypasses CORS restrictions. Required when calling external APIs from a local dev browser.
                        </div>
                    </div>
                </div>

                {/* Privacy note */}
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '14px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <ShieldCheck color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <h4 style={{ color: 'var(--success)', marginBottom: '4px', fontSize: '0.875rem' }}>Privacy Note</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Keys remain 100% local inside your browser. No middleman backend. Stored safely in browser storage.
                        </p>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--danger)', fontSize: '0.875rem' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <button className="btn-primary" onClick={handleConnect} disabled={!apiKey || isTesting}
                    style={{ width: '100%', padding: '14px' }}>
                    {isTesting
                        ? <><Loader2 className="animate-spin" size={18} /> Verifying Connection...</>
                        : <>Enter Workspace <ArrowRight size={18} /></>
                    }
                </button>
            </div>
        </div>
    );
}
