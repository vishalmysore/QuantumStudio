import { useState, useEffect } from 'react';
import { Settings, Zap, KeyRound, Cpu, TerminalSquare, Eye, Play, Sparkles } from 'lucide-react';
import Workspace from './components/Workspace';
import SetupScreen from './components/SetupScreen';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('quantum_ai_key') || '');
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem('quantum_ai_endpoint') || 'https://integrate.api.nvidia.com/v1/chat/completions');
  const [model, setModel] = useState(() => localStorage.getItem('quantum_ai_model') || 'nvidia/nemotron-nano-12b-v2-vl');
  const [useProxy, setUseProxy] = useState(() => localStorage.getItem('quantum_ai_proxy') === 'true');

  const handleSaveConfig = (key, ep, mod, proxy) => {
    localStorage.setItem('quantum_ai_key', key);
    localStorage.setItem('quantum_ai_endpoint', ep);
    localStorage.setItem('quantum_ai_model', mod);
    localStorage.setItem('quantum_ai_proxy', proxy);
    setApiKey(key);
    setEndpoint(ep);
    setModel(mod);
    setUseProxy(proxy);
  };

  const handleLogout = () => {
    localStorage.removeItem('quantum_ai_key');
    setApiKey('');
  };

  return (
    <div className="app-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        margin: '16px',
        borderBottom: '1px solid var(--panel-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Quantum <span className="text-gradient">AI</span> Builder</h1>
        </div>
        {apiKey && (
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem' }}
          >
            <Settings size={16} /> Disconnect API
          </button>
        )}
      </header>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 16px 16px' }}>
        {!apiKey ? (
          <SetupScreen onSave={handleSaveConfig} />
        ) : (
          <Workspace apiKey={apiKey} endpoint={endpoint} model={model} useProxy={useProxy} />
        )}
      </main>
    </div>
  );
}
