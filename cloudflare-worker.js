export default {
    async fetch(request) {
        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-target-url",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        // Get the target URL from the custom header
        const targetUrl = request.headers.get("x-target-url");
        if (!targetUrl) {
            return new Response("Missing x-target-url header", { status: 400 });
        }

        // Create a new request to the target API
        const targetRequest = new Request(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        // Strip the target url header before sending
        targetRequest.headers.delete("x-target-url");
        // Ensure standard fetch headers
        targetRequest.headers.delete("Host");
        targetRequest.headers.delete("Origin");
        targetRequest.headers.delete("Referer");

        try {
            // Fetch from the actual API (e.g., Nvidia)
            const response = await fetch(targetRequest);

            // Create a new response to send back to the browser
            const newResponse = new Response(response.body, response);

            // Inject CORS headers so the browser accepts it
            newResponse.headers.set("Access-Control-Allow-Origin", "*");
            newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-target-url");

            return newResponse;

        } catch (error) {
            return new Response("Proxy Error: " + error.message, { status: 500 });
        }
    }
};
