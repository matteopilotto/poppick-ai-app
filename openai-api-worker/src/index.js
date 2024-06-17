import OpenAI from "openai"

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
  }

export default {
	async fetch(request, env, ctx) {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders })
		}

		if (request.method !== "POST") {
			return new Response(JSON.stringify({ error: `${request.method} method not allowed.` }), { status: 405, headers: corsHeaders })
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: "https://gateway.ai.cloudflare.com/v1/0510c464267e24faa232e96a5d49d476/pop-pick/openai"
		})

		try {

			const chatMessages = await request.json()
			const chatCompletion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: chatMessages,
				temperature: 0.,
                presence_penalty: 0.,
                frequency_penalty: 0.
			})

			const response = chatCompletion.choices[0].message
			return new Response(JSON.stringify(response), { headers: corsHeaders })
		} catch(error) {
			return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
		}
	}
}
