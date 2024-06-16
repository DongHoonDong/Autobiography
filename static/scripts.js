document.addEventListener('DOMContentLoaded', function() {
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const transcriptDiv = document.getElementById('transcript');
    const guidelineDiv = document.getElementById('guideline');

    let mediaRecorder;
    let audioChunks = [];

    recordBtn.addEventListener('click', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.start();
        recordBtn.disabled = true;
        stopBtn.disabled = false;

        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks);
            audioChunks = [];

            const formData = new FormData();
            formData.append('audio', audioBlob);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                transcriptDiv.style.display = 'block';
                guidelineDiv.style.display = 'block';
                transcriptDiv.innerText = `Transcript: ${data.transcript}`;
                guidelineDiv.innerText = `Guideline: ${data.guideline}`;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    stopBtn.addEventListener('click', () => {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    });
});
