export function buildQASM(steps) {
    let qasm = "OPENQASM 2.0;\ninclude \"qelib1.inc\";\n\n";
    let qubitCount = 2; // Default

    // First pass: extract initialization
    for (const step of steps) {
        if (step.type === "init") {
            qubitCount = Math.max(step.qubits || 2, qubitCount);
            break;
        }
        // Infer from targets if no init or missing info
        if (step.targets) {
            qubitCount = Math.max(qubitCount, ...step.targets.map(t => t + 1));
        }
    }

    qasm += `qreg q[${qubitCount}];\n`;
    qasm += `creg c[${qubitCount}];\n\n`;

    // Second pass: gates
    for (const step of steps) {
        if (step.type === "gate") {
            if (step.gate === "CNOT" || step.gate === "CX") {
                const c = step.controls?.[0] ?? 0;
                const t = step.targets?.[0] ?? 1;
                qasm += `cx q[${c}], q[${t}];\n`;
            }
            else if (["RX", "RY", "RZ"].includes(step.gate) && step.angle !== undefined) {
                const t = step.targets?.[0] ?? 0;
                qasm += `${step.gate.toLowerCase()}(${step.angle}) q[${t}];\n`;
            }
            else {
                // H, X, Y, Z
                const t = step.targets?.[0] ?? 0;
                qasm += `${step.gate.toLowerCase()} q[${t}];\n`;
            }
        } else if (step.type === "measure") {
            const targets = step.targets || Array.from({ length: qubitCount }, (_, i) => i);
            for (const t of targets) {
                qasm += `measure q[${t}] -> c[${t}];\n`;
            }
        }
    }

    return qasm;
}
