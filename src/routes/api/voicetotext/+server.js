import { json } from '@sveltejs/kit';

const ASSEMBLY_API_KEY = 'c197c6ce7cf441f1a675f8cae34bc0d6';

export async function POST({ request }) {
	const { audio_url } = await request.json();

	if (!audio_url) {
		return json({ error: 'Missing audio_url' }, { status: 400 });
	}

	const response = await fetch('https://api.assemblyai.com/v2/transcript', {
		method: 'POST',
		headers: {
			authorization: ASSEMBLY_API_KEY,
			'content-type': 'application/json'
		},
		body: JSON.stringify({ audio_url })
	});

	const transcriptRequest = await response.json();

	let transcript;
	while (true) {
		const polling = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptRequest.id}`, {
			headers: { authorization: ASSEMBLY_API_KEY }
		});
		transcript = await polling.json();
		if (transcript.status === 'completed') break;
		if (transcript.status === 'error') return json({ error: transcript.error }, { status: 500 });
		await new Promise((res) => setTimeout(res, 2000));
	}

	return json({ text: transcript.text });
}
