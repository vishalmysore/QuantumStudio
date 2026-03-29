import { useState } from 'react';
import InputPanel from './panels/InputPanel';
import ExplanationPanel from './panels/ExplanationPanel';
import VisualizerPanel from './panels/VisualizerPanel';
import { parseCircuitPrompt } from '../services/llm';
import { buildQASM, parseQASM } from '../services/converter';
import { detectHardcodedAlgorithm, generateAlgorithm } from '../services/hardcodedAlgorithms';

export default function Workspace({ apiKey, endpoint, model, useProxy }) {
    const [steps, setSteps] = useState([]);
    const [explanation, setExplanation] = useState('');
    const [qasm, setQasm] = useState('');
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (prompt) => {
        setIsGenerating(true);
        setError(null);
        try {
            // 1. Check for hardcoded algorithm intents (Hybrid Architecture)
            const algoConfig = detectHardcodedAlgorithm(prompt);
            let parsedSteps, parsedExplanation;

            if (algoConfig) {
                // Bypass LLM for famous algorithms to ensure 100% accuracy
                const result = generateAlgorithm(algoConfig);
                parsedSteps = result.steps;
                parsedExplanation = result.explanation;
            } else {
                // Fallback to LLM for creative/custom intents
                const result = await parseCircuitPrompt(prompt, apiKey, endpoint, model, useProxy);
                parsedSteps = result.steps;
                parsedExplanation = result.explanation;
            }

            setSteps(parsedSteps);
            setExplanation(parsedExplanation);

            // 2. Convert steps to OpenQASM
            const compiledQasm = buildQASM(parsedSteps);
            setQasm(compiledQasm);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setSteps([]);
            setExplanation('');
            setQasm('');
        } finally {
            setIsGenerating(false);
        }
    };
    const handleQasmChange = (newQasm) => {
        setQasm(newQasm);
        try {
            const newSteps = parseQASM(newQasm);
            if (newSteps && newSteps.length > 0) {
                setSteps(newSteps);
                setExplanation("Manually edited QASM detected. Diagram and Bloch Sphere updated to match your code.");
            }
        } catch (e) {
            console.warn("Invalid QASM edit ignored", e);
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
                explanation={explanation}
                error={error}
            />
            <VisualizerPanel
                qasm={qasm}
                steps={steps}
                isGenerating={isGenerating}
                onQasmChange={handleQasmChange}
            />
        </div>
    );
}
