import { createClient } from "@supabase/supabase-js"

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

		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY)

		try {
			const query_embedding = await request.json()
			const { data } = await supabase.rpc("match_moviews_tmdb", {
				query_embedding: query_embedding,
				match_threshold: 0.10,
				match_count: 3
			})

			return new Response(JSON.stringify(data), { headers: corsHeaders })
		} catch(error) {
			return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
		}
	}
}
