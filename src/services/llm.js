// Normalise user-supplied endpoint so we always hit /chat/completions
function normalisedEndpoint(endpoint) {
    const base = endpoint.replace(/\/+$/, ''); // strip trailing slashes
    if (base.endsWith('/chat/completions')) return base;
    return base + '/chat/completions';
}

export async function parseCircuitPrompt(prompt, apiKey, endpoint, model = "gpt-4o", useProxy = false) {
    const systemPrompt = `You are a quantum computing assistant. Convert natural language into a structured JSON quantum circuit plan.
  
ONLY output a valid JSON array of step objects. No markdown, no explanations.
Supported gates: H, X, Y, Z, CNOT, RX, RY, MEASURE.

Example JSON output:
[
  {"type": "init", "qubits": 2},
  {"type": "gate", "gate": "H", "targets": [0]},
  {"type": "gate", "gate": "CNOT", "controls": [0], "targets": [1]},
  {"type": "measure", "targets": [0, 1]}
]

Rules:
- 0-indexed qubits.
- "gate" values must be exact: H, X, Y, Z, CNOT, RX, RY.
- Always include an "init" element FIRST with the number of qubits needed.
- If measuring, include targets.`;

    try {
        const fullEndpoint = normalisedEndpoint(endpoint);
        const fetchUrl = useProxy ? '/api/proxy' : fullEndpoint;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        };

        if (useProxy) {
            headers["x-target-url"] = fullEndpoint;
        }

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
        const fetchUrl = useProxy ? '/api/proxy' : fullEndpoint;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        };

        if (useProxy) {
            headers["x-target-url"] = fullEndpoint;
        }

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
