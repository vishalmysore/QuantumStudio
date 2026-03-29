import { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, Play, Square, Code, Globe } from 'lucide-react';
import { simulateQubit } from '../../services/simulator';
import BlochSphere from './BlochSphere';

const GATE_COLORS = {
    H: '#8b5cf6', X: '#ef4444', Y: '#f59e0b', Z: '#3b82f6',
    CNOT: '#10b981', CX: '#10b981', RX: '#ec4899', RY: '#f97316',
    RZ: '#06b6d4', MEASURE: '#6b7280',
};

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawCircuit(ctx, W, H, steps, visibleGateCount) {
    ctx.clearRect(0, 0, W, H);
    if (!steps || steps.length === 0 || W === 0 || H === 0) return;

    const init = steps.find(s => s.type === 'init');
    const numQubits = init
        ? init.qubits
        : Math.max(2, ...steps.flatMap(s => [...(s.targets || []), ...(s.controls || [])]).map(t => t + 1));
    const gateSteps = steps.filter(s => s.type === 'gate' || s.type === 'measure');

    const PL = 72, PR = 32, PT = 50, PB = 30;
    const qubitSpacing = numQubits <= 1 ? H * 0.4 : Math.min(90, (H - PT - PB) / (numQubits - 1));
    const usableW = W - PL - PR;

    // Wires + labels
    for (let q = 0; q < numQubits; q++) {
        const y = PT + q * qubitSpacing;
        ctx.font = 'bold 13px "Fira Code", monospace';
        ctx.fillStyle = '#a78bfa';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`|0⟩`, PL - 8, y);

        ctx.strokeStyle = 'rgba(148,163,184,0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(PL - 2, y);
        ctx.lineTo(W - PR, y);
        ctx.stroke();
    }

    // 1. Group gates into horizontal Layers (Circuit Depth logic)
    const layers = [];
    const qubitOccupiedUntil = new Array(numQubits).fill(0);

    gateSteps.forEach((step) => {
        const involvedQubits = [...(step.targets || []), ...(step.controls || [])];
        // Find first layer where all involved qubits are free
        let layerIdx = 0;
        involvedQubits.forEach(q => {
            layerIdx = Math.max(layerIdx, qubitOccupiedUntil[q]);
        });

        if (!layers[layerIdx]) layers[layerIdx] = [];
        layers[layerIdx].push(step);

        // Mark these qubits as occupied for this layer and all future
        involvedQubits.forEach(q => {
            qubitOccupiedUntil[q] = layerIdx + 1;
        });
    });

    const totalLayers = layers.length;
    const gateSpacing = Math.min(90, usableW / Math.max(totalLayers + 0.5, 2));
    const startX = PL + (usableW - totalLayers * gateSpacing) / 2;

    // 2. Draw Gates by Layer
    let currentDrawCount = visibleGateCount == null ? gateSteps.length : visibleGateCount;

    layers.forEach((layerGates, lIdx) => {
        const x = startX + lIdx * gateSpacing + gateSpacing / 2;

        layerGates.forEach(step => {
            if (currentDrawCount <= 0) return;
            currentDrawCount--;

            if (step.type === 'measure') {
                const y = PT + step.targets[0] * qubitSpacing;
                ctx.strokeStyle = '#94a3b8';
                ctx.fillStyle = '#1e293b';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 12, y - 12, 24, 24);
                ctx.fillRect(x - 12, y - 12, 24, 24);
                // Meter icon
                ctx.beginPath();
                ctx.arc(x, y + 6, 10, Math.PI, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y + 6);
                ctx.lineTo(x + 6, y - 4);
                ctx.stroke();
            } else {
                const targets = step.targets || [];
                const controls = step.controls || [];
                const color = GATE_COLORS[step.gate] || '#94a3b8';

                // Draw Control Lines
                if (controls.length > 0) {
                    const minY = Math.min(...controls, ...targets) * qubitSpacing + PT;
                    const maxY = Math.max(...controls, ...targets) * qubitSpacing + PT;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(x, minY);
                    ctx.lineTo(x, maxY);
                    ctx.stroke();

                    controls.forEach(c => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(x, PT + c * qubitSpacing, 4, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }

                // Draw Gate Box
                targets.forEach(t => {
                    const y = PT + t * qubitSpacing;
                    ctx.fillStyle = color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = color;
                    ctx.beginPath();
                    ctx.roundRect(x - 16, y - 16, 32, 32, 6);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 13px Inter';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(step.gate, x, y);
                });
            }
        });
    });
}

export default function VisualizerPanel({ qasm, steps = [], isGenerating, onQasmChange }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const [viewMode, setViewMode] = useState('diagram');
    const [localQasm, setLocalQasm] = useState(qasm);

    // Sync local QASM when the prop changes (e.g. from AI)
    useEffect(() => {
        setLocalQasm(qasm);
    }, [qasm]);

    const handleLocalQasmChange = (e) => {
        const val = e.target.value;
        setLocalQasm(val);
        if (onQasmChange) onQasmChange(val);
    };
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedQubit, setSelectedQubit] = useState(0);

    const gateSteps = (steps || []).filter(s => s.type === 'gate' || s.type === 'measure');
    const blochCoords = simulateQubit(steps || [], selectedQubit);
    const numQubits = (steps || []).find(s => s.type === 'init')?.qubits || 1;

    // Get canvas context with correct dimensions
    const getCtx = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return null;
        const { width, height } = container.getBoundingClientRect();
        if (width <= 0 || height <= 0) return null;
        if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
        }
        return { ctx: canvas.getContext('2d'), W: canvas.width, H: canvas.height };
    }, []);

    const renderFull = useCallback(() => {
        const r = getCtx();
        if (!r) return;
        drawCircuit(r.ctx, r.W, r.H, steps, null);
    }, [steps, getCtx]);

    // Redraw when steps or viewMode changes
    useEffect(() => {
        if (!qasm || !steps.length) return;
        // Cancel any animation
        isAnimatingRef.current = false;
        if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
        setIsAnimating(false);
        // Wait two frames: one for canvas to be in DOM, one for layout
        let f1 = requestAnimationFrame(() => {
            let f2 = requestAnimationFrame(() => renderFull());
            return () => cancelAnimationFrame(f2);
        });
        return () => cancelAnimationFrame(f1);
    }, [steps, qasm, renderFull]);

    // Resize → redraw
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const ro = new ResizeObserver(() => {
            if (!isAnimatingRef.current) renderFull();
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, [renderFull]);

    const startAnimation = useCallback(() => {
        const r = getCtx();
        if (!r) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        let current = 0;
        let last = null;
        const MS = 600;
        // Draw blank wires
        drawCircuit(r.ctx, r.W, r.H, steps, 0);

        const tick = (ts) => {
            if (!isAnimatingRef.current) return;
            if (!last) last = ts;
            if (ts - last >= MS) {
                current++;
                last = ts;
                const r2 = getCtx();
                if (r2) drawCircuit(r2.ctx, r2.W, r2.H, steps, current);
                if (current >= gateSteps.length) {
                    isAnimatingRef.current = false;
                    setIsAnimating(false);
                    return;
                }
            }
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
    }, [steps, gateSteps.length, getCtx]);

    const stopAnimation = useCallback(() => {
        isAnimatingRef.current = false;
        if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
        setIsAnimating(false);
        renderFull();
    }, [renderFull]);

    useEffect(() => () => {
        isAnimatingRef.current = false;
        if (animRef.current) cancelAnimationFrame(animRef.current);
    }, []);

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={20} color="var(--accent-primary)" />
                    <h3 style={{ fontSize: '1.125rem' }}>3. Visualization</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary"
                        style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', background: viewMode === 'diagram' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        onClick={() => setViewMode('diagram')}>
                        <Eye size={13} /> Diagram
                    </button>
                    <button className="btn-secondary"
                        style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', background: viewMode === 'bloch' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        onClick={() => setViewMode('bloch')}>
                        <Globe size={13} /> Sphere
                    </button>
                    <button className="btn-secondary"
                        style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', background: viewMode === 'qasm' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        onClick={() => setViewMode('qasm')}>
                        <Code size={13} /> QASM
                    </button>
                    <button className="btn-secondary"
                        style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: isAnimating ? 'var(--accent-primary)' : 'inherit' }}
                        disabled={!qasm || !gateSteps.length || viewMode === 'bloch'}
                        onClick={isAnimating ? stopAnimation : startAnimation}>
                        {isAnimating ? <><Square size={13} /> Stop</> : <><Play size={13} /> Animate</>}
                    </button>
                </div>
            </div>

            {/* Body — container is always mounted so ResizeObserver works */}
            <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>

                {/* Empty state */}
                {!qasm && !isGenerating && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', zIndex: 2 }}>
                        <Eye size={40} color="rgba(255,255,255,0.1)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate a circuit to see visualization</p>
                    </div>
                )}

                {/* Generating */}
                {isGenerating && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <p style={{ color: 'var(--accent-primary)' }}>Building circuit...</p>
                    </div>
                )}

                {/* QASM text — overlaid on top when active */}
                {qasm && !isGenerating && viewMode === 'qasm' && (
                    <div style={{ position: 'absolute', inset: 0, padding: '20px', zIndex: 2, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Edit OpenQASM 2.0 directly—diagram updates automatically
                        </div>
                        <textarea
                            value={localQasm}
                            onChange={handleLocalQasmChange}
                            spellCheck="false"
                            style={{
                                flex: 1,
                                background: 'rgba(0,0,0,0.5)',
                                color: '#a78bfa',
                                border: '1px solid var(--panel-border)',
                                borderRadius: '8px',
                                padding: '16px',
                                fontFamily: '"Fira Code", monospace',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}

                {/* Bloch Sphere Tab */}
                {qasm && !isGenerating && viewMode === 'bloch' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: 'rgba(0,0,0,0.4)', padding: '20px' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Qubit:</span>
                            {Array.from({ length: numQubits }).map((_, i) => (
                                <button key={i} className={`btn-secondary ${selectedQubit === i ? 'active' : ''}`}
                                    onClick={() => setSelectedQubit(i)}
                                    style={{ padding: '2px 8px', fontSize: '0.75rem', borderColor: selectedQubit === i ? 'var(--accent-primary)' : 'var(--panel-border)' }}>
                                    {i}
                                </button>
                            ))}
                        </div>
                        <BlochSphere x={blochCoords.x} y={blochCoords.y} z={blochCoords.z} size={Math.min(300, 300)} />
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>State Vector |ψ⟩</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {blochCoords.state.alpha[0].toFixed(3)}{blochCoords.state.alpha[1].toFixed(3)}j |0⟩ +<br />
                                {blochCoords.state.beta[0].toFixed(3)}{blochCoords.state.beta[1].toFixed(3)}j |1⟩
                            </div>
                        </div>
                    </div>
                )}

                {/* Canvas — ALWAYS in DOM so ref+ResizeObserver always work */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        display: 'block',
                        // hide canvas behind QASM overlay or empty state
                        visibility: (qasm && !isGenerating && viewMode === 'diagram') ? 'visible' : 'hidden'
                    }}
                />
            </div>

            {/* Legend */}
            {qasm && viewMode === 'diagram' && !isGenerating && gateSteps.length > 0 && (
                <div style={{ padding: '6px 20px', borderTop: '1px solid var(--panel-border)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '14px', flexWrap: 'wrap', flexShrink: 0 }}>
                    {[...new Set(gateSteps.map(s => s.gate || 'M'))].map(g => (
                        <span key={g} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: GATE_COLORS[g] || '#6b7280', display: 'inline-block' }} />
                            {g}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
