<script>
	let recording = false;
	let mediaRecorder;
	let audioChunks = [];
	let transcript = '';
	let loading = false;
	var answer = '';
	let responseAudio;

	async function startRecording() {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = (e) => {
			audioChunks.push(e.data);
		};

		mediaRecorder.onstop = async () => {
			const blob = new Blob(audioChunks, { type: 'audio/webm' });
			audioChunks = [];

			const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
				method: 'POST',
				headers: { authorization: 'c197c6ce7cf441f1a675f8cae34bc0d6' },
				body: blob
			});
			const uploadData = await uploadResponse.json();

			loading = true;
			const res = await fetch('/api/voicetotext', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ audio_url: uploadData.upload_url })
			});
			const data = await res.json();
			transcript = data.text || data.error;

			try {
				const response = await fetch(`/api/prompt?prompt=${transcript}`);
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const result = await response.json();
				answer = result;
			} catch (error) {
				console.error('There was a problem with the fetch operation:', error);
			} finally {
				loading = false;
			}
		};

		mediaRecorder.start();
		recording = true;
	}

	function stopRecording() {
		if (mediaRecorder && recording) {
			mediaRecorder.stop();
			recording = false;
		}
	}
	$: if (loading && responseAudio) {
		responseAudio.play().catch((e) => {
			console.warn('Playback prevented:', e);
		});
	}
</script>

<svelte:head>
	<title>Spy Ai</title>
	<script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="text-center space-y-6 p-8 bg-white rounded-xl w-full mx-3">
		<h1 class="text-3xl font-bold text-red-600">the ai to spy for</h1>
		
		<img src="ai.png" alt="" width="100" height="200" class="mx-auto" />
		

		<button
			on:click={recording ? stopRecording : startRecording}
			class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
		>
			{recording ? 'Stop Recording' : 'Start Recording'}
		</button>

		{#if loading}
			<audio loop
				bind:this={responseAudio}
				preload="auto"
			>
				<source src="balatro-talking.mp3" type="audio/mpeg" />
			</audio>
			<p class="text-gray-500">Combing through the database...</p>
		{:else if transcript}
			<p class="text-lg font-medium"><strong>Answer:</strong> {answer.content}</p>
		{/if}
	</div>
</div>
