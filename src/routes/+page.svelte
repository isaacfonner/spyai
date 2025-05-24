<script>
	let recording = false;
	let mediaRecorder;
	let audioChunks = [];
	let transcript = '';
	let loading = false;
    var answer = '';

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
            console.log(transcript)
            fetch(`/api/prompt?prompt=${transcript}`)
            .then(response => {
             if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
             }
             return response.json(); 
             })
            .then(data => {
            console.log('Data received:', data);
            answer = data
            loading = false;
            })
            .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            });

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
</script>
<style>
.container {
  height: 200px;
  position: relative;
  border: 3px solid green;
}

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>

<button on:click={recording ? stopRecording : startRecording}>
	{recording ? 'Stop Recording' : 'Start Recording'}
</button>

{#if loading}
	<p>Processing...</p>
{:else if transcript}
	<p><strong>Answer:</strong> {answer.content}</p>
{/if}

    <head>
        <title>Spai</title>
    </head>

        <h1 style="red">The AI to spy for.</h1>
        <img src="ai.png" alt="ama" width="100" height="200" >
       