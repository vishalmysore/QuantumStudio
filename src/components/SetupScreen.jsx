import { useState } from 'react';
import { KeyRound, ShieldCheck, ArrowRight, Server, Cpu, Loader2, AlertCircle, Info } from 'lucide-react';
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

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const [useProxy, setUseProxy] = useState(isLocalhost || localStorage.getItem('quantum_ai_proxy') === 'true');
    const [customProxyUrl, setCustomProxyUrl] = useState(localStorage.getItem('quantum_ai_custom_proxy') || '');
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        setIsTesting(true);
        setError(null);
        try {
            if (useProxy && !isLocalhost && !customProxyUrl) {
                throw new Error("Please enter your Cloudflare Worker / Serverless Proxy URL");
            }

            // Save the proxy settings eagerly so testConnection can pick them up
            localStorage.setItem('quantum_ai_custom_proxy', customProxyUrl);
            localStorage.setItem('quantum_ai_proxy', useProxy.toString());

            await testConnection(apiKey, endpoint, model, useProxy);
            onSave(apiKey, endpoint, model, useProxy);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', overflowY: 'auto', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Configure Sandbox</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Connect to any OpenAI-compatible LLM endpoint.</p>
                </div>

                {!isLocalhost && (
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#38bdf8' }}>
                        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                            <strong>Browser CORS Limitation</strong><br />
                            Some APIs (like Nvidia) block frontend requests natively. To bypass this on GitHub Pages, deploy the included <code>cloudflare-worker.js</code> to Cloudflare Workers and enter its URL below to securely proxy your requests.
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Server size={16} /> Inference Endpoint
                    </label>
                    <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://integrate.api.nvidia.com/v1" style={inputStyle} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} /> Model Name
                    </label>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                        placeholder="nvidia/nemotron-nano-12b-v2-vl" style={inputStyle} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <KeyRound size={16} /> API Key
                    </label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                        placeholder="nvapi-... or sk-..." style={inputStyle} />
                </div>

                <div style={{
                    background: useProxy ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${useProxy ? 'rgba(16,185,129,0.3)' : 'var(--panel-border)'}`,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }} onClick={() => setUseProxy(p => !p)}>
                        <input type="checkbox" checked={useProxy} readOnly
                            style={{ cursor: 'pointer', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                Route via Serverless Proxy (bypass CORS)
                                {isLocalhost && (
                                    <span style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                                        AUTO-ON · localhost
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                {isLocalhost
                                    ? "Uses the built-in Vite dev proxy automatically."
                                    : "Highly recommended for OpenAI/Nvidia APIs deployed on GitHub Pages."}
                            </div>
                        </div>
                    </div>

                    {useProxy && !isLocalhost && (
                        <div style={{ paddingLeft: '26px' }} onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={customProxyUrl}
                                onChange={(e) => setCustomProxyUrl(e.target.value)}
                                placeholder="https://quantum-proxy.your-username.workers.dev"
                                style={{
                                    ...inputStyle,
                                    padding: '8px 12px',
                                    fontSize: '0.85rem',
                                    borderColor: 'rgba(16,185,129,0.4)',
                                }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '14px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <ShieldCheck color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <h4 style={{ color: 'var(--success)', marginBottom: '4px', fontSize: '0.875rem' }}>Privacy Note</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Keys remain 100% local inside your browser. No middleman backend. Stored safely in browser storage.
                        </p>
                    </div>
                </div>

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
