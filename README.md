# ⚛️ Quantum Studio

**Quantum Studio** is an AI-powered, browser-based quantum circuit designer. It converts natural language prompts (e.g., *"Create a Bell state and measure it"*) into structured quantum logic and **OpenQASM 2.0** code, visualized with a custom animated canvas renderer.

![Quantum Studio Desktop](https://raw.githubusercontent.com/vishalmysore/QuantumStudio/main/public/preview.png)

## 🚀 Features

- **Natural Language Parsing:** Uses OpenAI-compatible LLMs (like Nvidia NIM Nemotron) to interpret circuit intent.
- **OpenQASM 2.0 Compiler:** Automatically generates standard quantum assembly code.
- **Animated Visualization:** A custom canvas-based circuit diagram with gate-by-gate animation.
- **CORS-Safe Architecture:** Includes a Cloudflare Worker proxy to securely bypass browser CORS restrictions when calling external LLM APIs from the frontend.
- **Privacy First:** API keys are stored only in your local browser's `localStorage`.

## 🛠️ Getting Started

### 1. Online Access
The app is deployed and ready to use at:
👉 **[https://vishalmysore.github.io/QuantumStudio/](https://vishalmysore.github.io/QuantumStudio/)**

### 2. Local Development
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 🔐 Security & Proxying
For production use on GitHub Pages, many APIs (like Nvidia) block direct browser requests via CORS. 

1. Deploy the included `cloudflare-worker.js` to a **Cloudflare Worker**.
2. Enter your Worker's URL in the "Serverless Proxy URL" field on the configuration screen.
3. This ensures secure, authenticated communication without compromising your API keys.

## 📜 License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---
Built with ❤️ for the Quantum AI community.
