document.getElementById("copyButton").addEventListener("click", async () => {
  const format = document.getElementById("format").value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "extractText", format }, response => {
    if (response && response.text) {
      navigator.clipboard.writeText(response.text)
        .then(() => alert('Text copied to clipboard!'))
        .catch(err => console.error('Failed to copy text:', err));
    } else {
      alert('Failed to extract conversation text.');
    }
  });
});
