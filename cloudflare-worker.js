/**
 * SECURE CORS PROXY FOR QUANTUM STUDIO
 * 
 * To make this truly safe:
 * 1. Update ALLOWED_ORIGIN to your GitHub Pages URL
 * 2. Update ALLOWED_TARGETS to only the APIs you use
 */

const ALLOWED_ORIGIN = "https://vishalmysore.github.io";
const ALLOWED_TARGETS = [
    "https://integrate.api.nvidia.com/v1/chat/completions",
    "https://api.openai.com/v1/chat/completions"
];

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");

        // 1. ORIGIN LOCK: Only allow requests from your specific frontend
        // (Uncomment this in production for maximum safety)
        /*
        if (origin !== ALLOWED_ORIGIN) {
            return new Response("Unauthorized Origin", { status: 403 });
        }
        */

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": origin || "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-url",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        const targetUrl = request.headers.get("x-target-url");
        if (!targetUrl) {
            return new Response("Missing x-target-url", { status: 400 });
        }

        // 2. TARGET LOCK: prevent your worker from being used to hit random sites
        const isAllowedTarget = ALLOWED_TARGETS.some(t => targetUrl.startsWith(t));
        if (!isAllowedTarget) {
            return new Response("Target URL not whitelisted for this proxy", { status: 403 });
        }

        // 3. SECURE HEADER PASSING
        // We only pass through the essential headers to the final API
        const cleanHeaders = new Headers();
        cleanHeaders.set("Content-Type", "application/json");

        const auth = request.headers.get("Authorization");
        if (auth) cleanHeaders.set("Authorization", auth);

        try {
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: cleanHeaders,
                body: request.body
            });

            const newResponse = new Response(response.body, response);

            // Re-inject CORS to satisfy the browser
            newResponse.headers.set("Access-Control-Allow-Origin", origin || "*");
            newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-target-url");

            return newResponse;

        } catch (error) {
            return new Response("Proxy Error: " + error.message, { status: 500 });
        }
    }
};
