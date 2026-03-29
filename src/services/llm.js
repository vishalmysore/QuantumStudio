// Normalise user-supplied endpoint so we always hit /chat/completions
function normalisedEndpoint(endpoint) {
    const base = endpoint.replace(/\/+$/, ''); // strip trailing slashes
    if (base.endsWith('/chat/completions')) return base;
    return base + '/chat/completions';
}

function getRoutingConfig(fullEndpoint, useProxy) {
    let fetchUrl = fullEndpoint;
    let headers = {};

    if (useProxy) {
        headers["x-target-url"] = fullEndpoint;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            fetchUrl = '/api/proxy'; // Vite dev server proxy
        } else {
            // Production serverless proxy stored in localStorage (or fallback if empty)
            fetchUrl = localStorage.getItem('quantum_ai_custom_proxy') || '';
            if (!fetchUrl) {
                throw new Error("Proxy is enabled in production but no Custom Proxy URL is provided.");
            }
        }
    }

    return { fetchUrl, routingHeaders: headers };
}

export async function parseCircuitPrompt(prompt, apiKey, endpoint, model = "gpt-4o", useProxy = false) {
    const systemPrompt = `You are a Ph.D. level Quantum Computing assistant. Your task is to accurately translate natural language into a structured JSON quantum circuit plan AND provide a scientific insight.
  
ONLY output a valid JSON object with matching the following schema. No markdown, no extra text.
{
  "steps": [ ...array of step objects... ],
  "explanation": "A high-level sentence or two about what just happened in the circuit."
}

Scientific Reference Library (REQUIRED PATTERNS):
1. DEUTSCH ALGORITHM: 
   - Init 2 qubits. 
   - Apply X to q[1]. 
   - Apply H to both q[0] and q[1].
   - Oracle: (e.g. CNOT for balanced, Identity/Nothing for constant).
   - Apply final H to q[0] (Interference).
   - Measure q[0].
2. GROVER'S ALGORITHM (2 qubits):
   - Init 2 qubits.
   - Prep: H on both q[0], q[1].
   - Oracle (for |11>): H q[1], CNOT q[0]->q[1], H q[1].
   - Diffusion: H on both, X on both, H q[1], CNOT q[0]->q[1], H q[1], X on both, H on both.
3. BELL STATE: H then CNOT.
4. GHZ STATE (3+): H on q[0], then CNOTs cascading down.

Rules:
- NEVER oversimplify. Include preparation (ancillas) and interference steps.
- Always include an "init" element FIRST in the steps array.
- 0-indexed qubits.
- "gate" values must be exact: H, X, Y, Z, CNOT, RX, RY.`;

    try {
        const fullEndpoint = normalisedEndpoint(endpoint);
        const { fetchUrl, routingHeaders } = getRoutingConfig(fullEndpoint, useProxy);

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            ...routingHeaders
        };

        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            let errText = response.statusText;
            try {
                const errData = await response.json();
                if (errData.error?.message) errText = errData.error.message;
            } catch (e) { }
            throw new Error(`API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        // cleanup markdown if present
        if (content.startsWith("```json") || content.startsWith("```")) {
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        return JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse prompt: ${err.message}`);
    }
}

export async function testConnection(apiKey, endpoint, model, useProxy = false) {
    try {
        const fullEndpoint = normalisedEndpoint(endpoint);
        const { fetchUrl, routingHeaders } = getRoutingConfig(fullEndpoint, useProxy);

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            ...routingHeaders
        };

        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "user", content: "Reply with exactly the word OK." }
                ],
                max_tokens: 5,
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            let errText = response.statusText;
            try {
                const errData = await response.json();
                if (errData.error?.message) errText = errData.error.message;
            } catch (e) { }
            throw new Error(`API error ${response.status}: ${errText}`);
        }

        return true;
    } catch (err) {
        throw new Error(`Connection failed: ${err.message}`);
    }
}
