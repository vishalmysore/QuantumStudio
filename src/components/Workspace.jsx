import { useState } from 'react';
import InputPanel from './panels/InputPanel';
import ExplanationPanel from './panels/ExplanationPanel';
import VisualizerPanel from './panels/VisualizerPanel';
import { parseCircuitPrompt } from '../services/llm';
import { buildQASM } from '../services/converter';

export default function Workspace({ apiKey, endpoint, model, useProxy }) {
    const [steps, setSteps] = useState([]);
    const [qasm, setQasm] = useState('');
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (prompt) => {
        setIsGenerating(true);
        setError(null);
        try {
            // 1. Send natural language to LLM
            const parsedSteps = await parseCircuitPrompt(prompt, apiKey, endpoint, model, useProxy);
            setSteps(parsedSteps);

            // 2. Convert steps to OpenQASM
            const compiledQasm = buildQASM(parsedSteps);
            setQasm(compiledQasm);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setSteps([]);
            setQasm('');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(400px, 1.5fr)',
            gap: '16px',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            paddingBottom: '16px'
        }}>
            <InputPanel
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
            />
            <ExplanationPanel
                steps={steps}
                error={error}
            />
            <VisualizerPanel
                qasm={qasm}
                steps={steps}
                isGenerating={isGenerating}
            />
        </div>
    );
}
