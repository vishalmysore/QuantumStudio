import { useState } from 'react';
import { KeyRound, ShieldCheck, ArrowRight, Server, Cpu, Loader2, AlertCircle, Info, Zap } from 'lucide-react';
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

    const [useProxy, setUseProxy] = useState(() => {
        const saved = localStorage.getItem('quantum_ai_proxy');
        return saved !== null ? saved === 'true' : true;
    });
    const [customProxyUrl, setCustomProxyUrl] = useState(() => {
        return localStorage.getItem('quantum_ai_custom_proxy') || 'https://quantumstudio.visrow.workers.dev/';
    });
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

    const tutorials = [
        { name: "Superposition Explorers", file: "superposition_visualizer.html", desc: "Visualize the |+⟩ and |-⟩ states." },
        { name: "Bell State Correlation", file: "bell_state_visualizer.html", desc: "Interactive EPR pair entanglement." },
        { name: "Grover's Search Sim", file: "grovers_algorithm_visualizer.html", desc: "Watch amplitude amplification live." },
        { name: "Teleportation Lab", file: "teleportation_visualizer.html", desc: "Step-by-step state transfer." },
        { name: "Deutsch Algorithm", file: "deutsch_algorithm_visualizer.html", desc: "Oracle-based function classification." },
        { name: "Bloch Sphere 3D", file: "bloch_sphere_interactive.html", desc: "Full 3D rotation playground." },
        { name: "GHZ State (Cat States)", file: "ghz_state_visualizer.html", desc: "Maximum multi-qubit entanglement." },
        { name: "Measurement Collapse", file: "measurement_collapse_visualizer.html", desc: "See probabilities become reality." },
        { name: "Gate Transformer", file: "gate_transformer_visualizer.html", desc: "How gates change the Bloch vector." },
        { name: "Multi-Qubit Explorer", file: "multi_qubit_explorer.html", desc: "Visualizing higher-order Hilbert space." },
        { name: "Full Algorithm Lifecycle", file: "quantum_full_lifecycle.html", desc: "Step-by-step 3-qubit algorithm walkthrough." },
        { name: "Amplitude & Waves Sandbox", file: "quantum_superposition_visualizer.html", desc: "Interactive wave interference playground." },
        { name: "Drag & Drop Composer", file: "quantum_circuit_composer.html", desc: "Build circuits dynamically by dragging qubits and gates." }
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: '40px 20px', gap: '40px', flexWrap: 'wrap' }}>
            {/* CONFIGURATION COLUMN */}
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Quantum Studio</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>AI-Powered Circuit IDE & Learning Lab</p>
                </div>

                {!isLocalhost && (
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#38bdf8' }}>
                        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                            <strong>GitHub Pages Notice</strong><br />
                            GitHub Pages blocks some AI endpoints. Use our official proxy below for a zero-setup experience.
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Cpu size={16} /> Inference Model
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                                placeholder="Model name..." style={{ ...inputStyle, flex: 3 }} />
                            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                                placeholder="LLM API Key" style={{ ...inputStyle, flex: 2 }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '4px' }}>
                            To get a free NVIDIA Key, click here: <a href="https://build.nvidia.com/settings/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>https://build.nvidia.com/settings/api-keys</a>
                        </div>
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
                                    Serverless Proxy Enabled
                                    {isLocalhost && <span className="badge-success">AUTO</span>}
                                </div>
                                <input
                                    type="text"
                                    value={customProxyUrl}
                                    onChange={(e) => { e.stopPropagation(); setCustomProxyUrl(e.target.value); }}
                                    placeholder="Proxy URL..."
                                    style={{
                                        ...inputStyle,
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        fontSize: '0.8rem',
                                        borderColor: 'rgba(16,185,129,0.4)',
                                        display: useProxy ? 'block' : 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '14px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <ShieldCheck color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Keys are local.</strong> Quantun Studio runs entirely in your browser. Your keys never leave your machine.
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--danger)', fontSize: '0.875rem' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <button className="btn-primary" onClick={handleConnect} disabled={!apiKey || isTesting}
                    style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
                    {isTesting
                        ? <><Loader2 className="animate-spin" size={18} /> Syncing Quantum Engine...</>
                        : <>Open Studio <ArrowRight size={18} /></>
                    }
                </button>
            </div>

            {/* LEARN INTERACTIVE COLUMN */}
            <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ paddingLeft: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={20} color="var(--accent-primary)" /> Learn Interactive
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hands-on visualizers to master the fundamentals.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {tutorials.map((t, idx) => (
                        <a
                            key={idx}
                            href={t.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-panel"
                            style={{
                                padding: '16px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s, border-color 0.2s',
                                border: '1px solid var(--panel-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--panel-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{t.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{t.desc}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
