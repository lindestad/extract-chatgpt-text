document.getElementById("copyButton").addEventListener("click", async () => {
    const format = document.getElementById("format").value;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: convertAndCopy,
      args: [format]
    });
  });
  
  function convertAndCopy(format) {
    // Get parsed conversation
    const conversation = document.querySelector('.chat-container').innerText; // Adjust selector as necessary
    const formattedText = format === 'markdown' ? convertToMarkdown(conversation) : convertToLatex(conversation);
  
    navigator.clipboard.writeText(formattedText)
      .then(() => alert('Text copied to clipboard!'))
      .catch(err => console.error('Failed to copy text: ', err));
  }
  
  function convertToMarkdown(text) {
    // Implement Markdown conversion logic
    return text.replace(/\n/g, "\n\n");
  }
  
  function convertToLatex(text) {
    // Implement LaTeX conversion logic
    return text.replace(/\n/g, "\\\\");
  }
  