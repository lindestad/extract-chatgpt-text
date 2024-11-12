import { convertToMarkdown, convertToLatex } from './utils/parser.js';
import { capitalize } from './utils/helpers.js';

document.getElementById("copyButton").addEventListener("click", async () => {
  const format = document.getElementById("format").value; // Get selected format (markdown/latex)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractConversationHtml, // Inject this function into the page
  }, (injectionResults) => {
    if (chrome.runtime.lastError) {
      console.error('Script injection failed:', chrome.runtime.lastError.message);
      alert('Could not connect to the page. Make sure you are on the ChatGPT page.');
      return;
    }

    const [{ result: rawHtml }] = injectionResults; // Get raw HTML from page
    if (rawHtml) {
      const formattedText = format === 'markdown' 
        ? convertToMarkdown(rawHtml) 
        : convertToLatex(rawHtml);

      navigator.clipboard.writeText(formattedText)
        .then(() => alert('Text copied to clipboard!'))
        .catch(err => console.error('Clipboard error:', err));
    } else {
      alert('Failed to extract conversation text.');
    }
  });
});

function extractConversationHtml() {
  // Get the relevant HTML from the page
  const messages = document.querySelectorAll('[data-message-author-role]');
  if (!messages.length) {
    console.error('No messages found on the page.');
    return null;
  }

  // Combine the innerHTML of all message elements
  const debugHTML = Array.from(messages);
  const rawHtml = Array.from(messages)
    .map(msg => `<div data-message-author-role="${msg.getAttribute('data-message-author-role')}">${msg.innerHTML}</div>`)
    .join('');
  
  return rawHtml;
}
