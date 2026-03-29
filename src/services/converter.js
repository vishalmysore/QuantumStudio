/**
 * QUANTUM ASSEMBLY CONVERTER (QASM 2.0)
 * 
 * Bidirectional conversion between Step JSON and OpenQASM 2.0.
 */

export function buildQASM(steps) {
    if (!steps || steps.length === 0) return "";
    let qasm = "OPENQASM 2.0;\ninclude \"qelib1.inc\";\n\n";

    const init = steps.find(s => s.type === "init");
    const qubitCount = init ? init.qubits : 2;

    qasm += `qreg q[${qubitCount}];\n`;
    qasm += `creg c[${qubitCount}];\n\n`;

    steps.forEach(step => {
        if (step.type === "gate") {
            const gate = step.gate?.toLowerCase() || "h";
            if (gate === "cx" || gate === "cnot") {
                const c = step.controls?.[0] ?? 0;
                const t = step.targets?.[0] ?? 1;
                qasm += `cx q[${c}], q[${t}];\n`;
            } else if (["rx", "ry", "rz"].includes(gate) && step.angle !== undefined) {
                const t = step.targets?.[0] ?? 0;
                qasm += `${gate}(${step.angle}) q[${t}];\n`;
            } else {
                (step.targets || [0]).forEach(t => {
                    qasm += `${gate} q[${t}];\n`;
                });
            }
        } else if (step.type === "measure") {
            const targets = step.targets || [0];
            targets.forEach(t => {
                qasm += `measure q[${t}] -> c[${t}];\n`;
            });
        }
    });

    return qasm;
}

export function parseQASM(qasm) {
    const steps = [];
    const lines = qasm.split('\n');
    let qubitCount = 0;

    // 1. Detect qubit count from qreg
    const qregMatch = qasm.match(/qreg\s+q\[(\d+)\]/i);
    if (qregMatch) {
        qubitCount = parseInt(qregMatch[1]);
        steps.push({ type: 'init', qubits: qubitCount });
    }

    // 2. Parse gates
    lines.forEach(line => {
        const clean = line.trim().toLowerCase();
        if (!clean || clean.startsWith('openqasm') || clean.startsWith('include') || clean.startsWith('qreg') || clean.startsWith('creg')) return;

        // Single qubit gates: h, x, y, z
        const singleMatch = clean.match(/^([hxyz])\s+q\[(\d+)\]/i);
        if (singleMatch) {
            steps.push({ type: 'gate', gate: singleMatch[1].toUpperCase(), targets: [parseInt(singleMatch[2])] });
            return;
        }

        // CX / CNOT
        const cxMatch = clean.match(/^cx\s+q\[(\d+)\],\s*q\[(\d+)\]/i);
        if (cxMatch) {
            steps.push({ type: 'gate', gate: 'CNOT', controls: [parseInt(cxMatch[1])], targets: [parseInt(cxMatch[2])] });
            return;
        }

        // RX / RY / RZ
        const rotMatch = clean.match(/^(r[xyz])\(([^)]+)\)\s+q\[(\d+)\]/i);
        if (rotMatch) {
            steps.push({ type: 'gate', gate: rotMatch[1].toUpperCase(), angle: parseFloat(rotMatch[2]), targets: [parseInt(rotMatch[3])] });
            return;
        }

        // Measure
        const measureMatch = clean.match(/^measure\s+q\[(\d+)\]/i);
        if (measureMatch) {
            steps.push({ type: 'measure', targets: [parseInt(measureMatch[1])] });
        }
    });

    return steps;
}
