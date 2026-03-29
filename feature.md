# ⚛️ Quantum Studio: Official Feature Guide

**Quantum Studio** is a next-generation, AI-driven workbench for exploring, designing, and visualizing quantum circuits. It bridges the gap between natural language intent and specialized quantum assembly code.

---

## 🚀 Core Features

### 1. 🤖 AI-Powered Intent Parsing
Quantum Studio leverages modern Large Language Models (like Nvidia's Llama-3-70B or Nemotron) to convert plain-English instructions into structured quantum logic.
-   **No syntax required:** Speak to the AI like a human (e.g., *"Entangle qubit 0 and 1 using a CNOT"*).
-   **Schema-Safe:** Automatically converts ambiguous requests into valid JSON steps.

### 2. ⚡️ Natural Language to OpenQASM 2.0
The app acts as a compiler that translates AI-generated logic into industry-standard **OpenQASM 2.0**.
-   **Professional Export:** Copy-paste code that is ready for use in industrial quantum simulators or real hardware.
-   **Auto-Compilation:** Instantly updates as the AI interprets your prompt.

### 3. 🖥️ Animated Canvas Visualization
A custom-built, high-performance canvas renderer provides a visual view of your circuit timeline.
-   **Gate-by-Gate Animation:** Watch your circuit evolve step-by-step with the **Animate** feature.
-   **Dynamic Sizing:** Perfectly centers and scales diagrams whether you have 2 qubits or 10.
-   **Legend & Colors:** Intuitively color-coded gates (H, X, Y, Z, CNOT, Measure).

### 4. 🏀 Integrated Bloch Sphere Simulator (NEW)
Experience the geometry of quantum computing with a live, 3D-perspective Bloch sphere.
-   **State Simulation:** Tracks real-time complex state vectors $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$.
-   **Qubit Selection:** Toggle through each qubit in your circuit to see their individual positions in 3D space.
-   **Vector View:** View exact mathematical coefficients for the state vector at all times.

### 5. 🛡️ Secure Serverless Proxy Architecture
Quantum Studio is built for professional, CORS-safe use on static hosting platforms like GitHub Pages.
-   **Cloudflare Worker Proxy:** Bypasses browser cross-origin restrictions when calling Nvidia or OpenAI endpoints.
-   **Target Whitelisting:** Deep security that prevents the proxy from being misused while protecting your API key.
-   **Client-Side Privacy:** Your API keys never touch a server—they stay in your browser's local storage.

---

## 🔬 How Quantum Studio Helps

-   **For Learners:** Provides immediate visual feedback for abstract concepts like Superposition and Entanglement.
-   **For Researchers:** Allows rapid prototyping of quantum logic without wrangling Python (Qiskit) or C++ boilerplates.
-   **For Teachers:** An interactive demonstration tool that animates gates in real-time on any device with a browser.

---
👉 **Live App:** [https://vishalmysore.github.io/QuantumStudio/](https://vishalmysore.github.io/QuantumStudio/)  
🚀 **GitHub:** [https://github.com/vishalmysore/QuantumStudio](https://github.com/vishalmysore/QuantumStudio)
