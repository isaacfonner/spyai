/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const prompt = url.searchParams.get('prompt') || 'Tell me a joke!';

  try {
    const res = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await res.json();

    const content = data?.choices?.[0]?.message?.content ?? 'No response content found.';

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something went wrong', details: err.message }), {
      status: 500
    });
  }
}
