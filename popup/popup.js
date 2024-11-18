import { convertToMarkdown, convertToLatex, convertToRawText } from './utils/parser.js';

/************************************************************************************************
 Text, Markdown and LaTeX buttons
*************************************************************************************************/

const buttonIds = ["textButton", "markdownButton", "latexButton"];

buttonIds.forEach(buttonId => {
  document.getElementById(buttonId).addEventListener("click", async () => {
    const format = buttonId.replace("Button", "").toLowerCase(); // Get format from button ID
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
        let formattedText;
        switch (format) {
          case 'markdown':
            formattedText = convertToMarkdown(rawHtml);
            break;
          case 'latex':
            formattedText = convertToLatex(rawHtml);
            break;
          case 'text':
            formattedText = convertToRawText(rawHtml)
            break;
          default:
            console.error('Invalid format:', format);
        }

        navigator.clipboard.writeText(formattedText)
          .then(() => alert('Text copied to clipboard!'))
          .catch(err => console.error('Clipboard error:', err));
      } else {
        alert('Failed to extract conversation text.');
      }
    });
  });
});

/************************************************************************************************
 More button
*************************************************************************************************/

document.getElementById('moreButton').addEventListener('click', function() {
  const moreOptions = document.getElementById('moreOptions');
  const moreButton = document.getElementById('moreButton');
  
  if (moreOptions.style.display === 'none' || moreOptions.style.display === '') {
    moreOptions.style.display = 'block';
    moreButton.textContent = 'Less ->';
  } else {
    moreOptions.style.display = 'none';
    moreButton.textContent = 'More ->';
  }
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
