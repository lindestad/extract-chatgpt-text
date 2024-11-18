import { convertToMarkdown, convertToLatex, convertToRawText } from './utils/parser.js';

/************************************************************************************************
 Text, Markdown and LaTeX buttons
*************************************************************************************************/

const buttonIds = ["textButton", "markdownButton", "latexButton"];

buttonIds.forEach(buttonId => {
  document.getElementById(buttonId).addEventListener("click", async () => {
    const format = buttonId.replace("Button", "").toLowerCase(); // Get format from button ID
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    // Get settings from storage
    const settings = await getSettings();

    browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractConversationHtml, // Inject this function into the page
    }).then((injectionResults) => {
      const [{ result: rawHtml }] = injectionResults; // Get raw HTML from page
      if (rawHtml) {
        const preProcessedHtml = preProcessHtml(rawHtml, settings);
        let formattedText;
        switch (format) {
          case 'markdown':
            formattedText = convertToMarkdown(preProcessedHtml);
            break;
          case 'latex':
            formattedText = convertToLatex(preProcessedHtml);
            break;
          default:
            formattedText = convertToRawText(preProcessedHtml);
        }

        navigator.clipboard.writeText(formattedText)
          .then(() => alert('Text copied to clipboard!'))
          .catch(err => console.error('Clipboard error:', err));
      } else {
        alert('Failed to extract conversation text.');
      }
    }).catch(error => {
      console.error('Script injection failed:', error);
      alert('Could not connect to the page. Make sure you are on the ChatGPT page.');
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

/************************************************************************************************
 Include last message only and Include user prompt checkboxes
*************************************************************************************************/

// Load the checkbox states from storage
document.addEventListener('DOMContentLoaded', () => {
  const includeLastMessageCheckbox = document.getElementById('includeLastMessageCheckbox');
  const includeUserPromptCheckbox = document.getElementById('includeUserPromptCheckbox');

  browser.storage.local.get(['includeLastMessage', 'includeUserPrompt']).then((result) => {
    includeLastMessageCheckbox.checked = result.includeLastMessage || false;
    includeUserPromptCheckbox.checked = result.includeUserPrompt || false;
  });

  // Save the checkbox states to storage when changed
  includeLastMessageCheckbox.addEventListener('change', () => {
    browser.storage.local.set({ includeLastMessage: includeLastMessageCheckbox.checked });
  });

  includeUserPromptCheckbox.addEventListener('change', () => {
    browser.storage.local.set({ includeUserPrompt: includeUserPromptCheckbox.checked });
  });
});

/************************************************************************************************
 Settings and Pre-processing
*************************************************************************************************/

async function getSettings() {
  return new Promise((resolve) => {
    browser.storage.local.get(['includeLastMessage', 'includeUserPrompt']).then((result) => {
      resolve({
        includeLastMessage: result.includeLastMessage || false,
        includeUserPrompt: result.includeUserPrompt || false,
        // Add other settings here as needed
      });
    });
  });
}

function preProcessHtml(html, settings) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  if (settings.includeLastMessage) {
    const messages = tempDiv.querySelectorAll('[data-message-author-role]');
    if (messages.length > 0) {
      tempDiv.innerHTML = messages[messages.length - 1].outerHTML;
    }
  }

  if (!settings.includeUserPrompt) {
    const userMessages = tempDiv.querySelectorAll('[data-message-author-role="user"]');
    userMessages.forEach(userMessage => userMessage.remove());
  }

  return tempDiv.innerHTML;
}

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
