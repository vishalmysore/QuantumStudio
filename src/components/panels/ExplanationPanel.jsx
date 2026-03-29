import { GitCommit, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ExplanationPanel({ steps = null, explanation = '', error = null }) {
    const [copied, setCopied] = useState(false);

    if (error) {
        return (
            <div className="glass-panel" style={{ height: '100%', padding: '20px', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>AI Interpretation Failed</h3>
                <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
        );
    }

    if (!steps) {
        return (
            <div className="glass-panel" style={{ height: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Awaiting input.<br /><span style={{ fontSize: '0.8rem' }}>Enter a prompt to see the structured interpretation.</span>
                </p>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitCommit size={20} color="var(--accent-secondary)" />
                    <h3 style={{ fontSize: '1.125rem' }}>2. AI Logic Plan</h3>
                </div>

                <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={handleCopy}>
                    {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    The AI parsed your request into the following structured execution steps:
                </p>

                {explanation && (
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                            <Sparkles size={60} color="var(--accent-primary)" />
                        </div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Sparkles size={14} /> Scientific Insight
                        </h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                            "{explanation}"
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    color: step.type === 'init' ? 'var(--accent-primary)' : step.type === 'gate' ? 'var(--accent-secondary)' : 'var(--text-primary)'
                                }}>
                                    {step.type} {step.gate && `- ${step.gate}`}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Step {idx + 1}</span>
                            </div>

                            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {step.qubits && <div><span style={{ color: 'var(--text-secondary)' }}>Qubits:</span> {step.qubits}</div>}
                                {step.angle !== undefined && <div><span style={{ color: 'var(--text-secondary)' }}>Angle:</span> {step.angle}</div>}
                                {step.controls && <div><span style={{ color: 'var(--text-secondary)' }}>Controls:</span> q[{step.controls.join(', ')}]</div>}
                                {step.targets && <div><span style={{ color: 'var(--text-secondary)' }}>Targets:</span> q[{step.targets.join(', ')}]</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
