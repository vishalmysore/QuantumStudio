/**
 * SIMPLE QUANTUM STATE SIMULATOR
 * 
 * Simulates a single qubit state vector through a series of gates.
 * Bloch Sphere coordinates:
 * x = 2 * Re(alpha * conj(beta))
 * y = 2 * Im(conj(alpha) * beta)
 * z = |alpha|^2 - |beta|^2
 */

const math = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    mul: (a, b) => [
        a[0] * b[0] - a[1] * b[1],
        a[0] * b[1] + a[1] * b[0]
    ],
    conj: (a) => [a[0], -a[1]],
    magSq: (a) => a[0] * a[0] + a[1] * a[1]
};

const I = [1, 0];
const ZI = [0, 0];
const ONE_SQRT2 = [1 / Math.sqrt(2), 0];

const GATES = {
    H: (s) => {
        // H = 1/sqrt2 * [[1, 1], [1, -1]]
        const a = math.mul(ONE_SQRT2, math.add(s.alpha, s.beta));
        const b = math.mul(ONE_SQRT2, math.add(s.alpha, [-s.beta[0], -s.beta[1]]));
        return { alpha: a, beta: b };
    },
    X: (s) => ({ alpha: s.beta, beta: s.alpha }),
    Y: (s) => {
        // Y = [[0, -i], [i, 0]]
        // alpha' = -i * beta = (0,-1) * beta
        // beta' = i * alpha = (0,1) * alpha
        return {
            alpha: math.mul([0, -1], s.beta),
            beta: math.mul([0, 1], s.alpha)
        };
    },
    Z: (s) => ({ alpha: s.alpha, beta: [-s.beta[0], -s.beta[1]] }),
    RX: (s, theta) => {
        const c = [Math.cos(theta / 2), 0];
        const si = [0, -Math.sin(theta / 2)];
        // cos(t/2)I - i*sin(t/2)X
        return {
            alpha: math.add(math.mul(c, s.alpha), math.mul(si, s.beta)),
            beta: math.add(math.mul(si, s.alpha), math.mul(c, s.beta))
        };
    },
    RY: (s, theta) => {
        const c = Math.cos(theta / 2);
        const si = Math.sin(theta / 2);
        // cos(t/2)I - i*sin(t/2)Y -> [[cos, -sin], [sin, cos]]
        return {
            alpha: [c * s.alpha[0] - si * s.beta[0], c * s.alpha[1] - si * s.beta[1]],
            beta: [si * s.alpha[0] + c * s.beta[0], si * s.alpha[1] + c * s.beta[1]]
        };
    }
};

export function simulateQubit(steps, qubitIndex = 0) {
    let state = { alpha: [1, 0], beta: [0, 0] }; // Start at |0>

    // Only process gates that target our qubit
    const myGates = steps.filter(s => s.type === 'gate' && s.targets && s.targets.includes(qubitIndex));

    for (const step of myGates) {
        if (GATES[step.gate]) {
            state = GATES[step.gate](state, step.params || 0);
        }
    }

    // Convert to Bloch coordinates (x,y,z)
    // x = 2 * Re(α * conj(β))
    const a_conj_b = math.mul(state.alpha, math.conj(state.beta));
    const x = 2 * a_conj_b[0];
    const y = 2 * a_conj_b[1];
    const z = math.magSq(state.alpha) - math.magSq(state.beta);

    return { x, y, z, state };
}
