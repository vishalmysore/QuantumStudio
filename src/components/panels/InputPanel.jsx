import { useState } from 'react';
import { Send, Zap, Loader2, AlertCircle } from 'lucide-react';

export default function InputPanel({ onGenerate, isGenerating }) {
    const [prompt, setPrompt] = useState("Create a Bell state between two qubits");

    const presets = [
        "Create a Bell state between two qubits",
        "Apply Hadamard to qubit 0 and entangle with qubit 1",
        "Build a 3-qubit GHZ state",
        "Apply X to qubit 0, then measure all"
    ];

    return (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Zap size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.125rem' }}>1. Natural Language</h3>
            </div>

            <div style={{
                background: 'rgba(239, 149, 0, 0.1)',
                border: '1px solid rgba(239, 149, 0, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                color: '#f59e0b',
                fontSize: '0.8rem'
            }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span><strong>Note:</strong> We are currently refining complex algorithm parsing (Deutsch/Grover). Use standard gate instructions for best results.</span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Describe the quantum circuit you want to create in plain English.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {presets.map((p, i) => (
                    <button
                        key={i}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '16px' }}
                        onClick={() => setPrompt(p)}
                    >
                        {p.substring(0, 30)}...
                    </button>
                ))}
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '16px',
                    resize: 'none',
                    marginBottom: '16px',
                    fontSize: '0.95rem'
                }}
                placeholder="Type your quantum circuit prompt here..."
            />

            <button
                className="btn-primary"
                onClick={() => onGenerate(prompt)}
                disabled={isGenerating || !prompt.trim()}
                style={{ padding: '14px', width: '100%' }}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> Generating Circuit...
                    </>
                ) : (
                    <>
                        <Send size={18} /> Generate Circuit
                    </>
                )}
            </button>
        </div>
    );
}
