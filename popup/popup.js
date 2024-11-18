import { convertToMarkdown, convertToLatex, convertToRawText } from './utils/parser.js';
import { showBubble } from './utils/bubble.js';

/************************************************************************************************
 Text, Markdown and LaTeX buttons
*************************************************************************************************/

const buttonIds = ["textButton", "markdownButton", "latexButton"];

buttonIds.forEach(buttonId => {
  document.getElementById(buttonId).addEventListener("click", async (event) => {
    // Ui bubble
    showBubble('Text copied!', 1500, event.currentTarget);

    const format = buttonId.replace("Button", "").toLowerCase(); // Get format from button ID
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    // Get settings from storage
    const settings = await getSettings();
    const prepend = (settings.includeUserPrompt || !settings.includeLastMessage) ? true : false;
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
            formattedText = convertToMarkdown(preProcessedHtml, prepend);
            break;
          case 'latex':
            formattedText = convertToLatex(preProcessedHtml, prepend);
            break;
          default:
            formattedText = convertToRawText(preProcessedHtml, prepend);
        }

        navigator.clipboard.writeText(formattedText)
          .then(() => console.log('Text copied to clipboard. Format:', format))
          .catch(err => console.error('Clipboard error:', err));
      } else {
        console.log('Failed to extract conversation text.');
      }
    }).catch(error => {
      console.error('Script injection failed:', error);
      console.log('Could not connect to the page. Make sure you are on the ChatGPT page.');
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

  if (!settings.includeUserPrompt) {
    const userMessages = tempDiv.querySelectorAll('[data-message-author-role="user"]');
    userMessages.forEach(userMessage => userMessage.remove());
  }

  const messages = tempDiv.querySelectorAll('[data-message-author-role]');
  let selectedMessages = [];

  if (settings.includeLastMessage) {
    if (settings.includeUserPrompt && messages.length > 1) {
      // Include the last two messages
      selectedMessages = Array.from(messages).slice(-2);
    } else if (messages.length > 0) {
      // Include only the last message
      selectedMessages = [messages[messages.length - 1]];
    }
  } else if (messages.length > 1) {
    // Join all messages
    selectedMessages = Array.from(messages);
  }

  // Return the outerHTML of the selected messages
  return selectedMessages.map(msg => msg.outerHTML).join('');
}

function extractConversationHtml() {
  // Get the relevant HTML from the page
  const messages = document.querySelectorAll('[data-message-author-role]');
  if (!messages.length) {
    console.error('No messages found on the page.');
    return null;
  }

  // Combine the innerHTML of all message elements
  const rawHtml = Array.from(messages)
    .map(msg => `<div data-message-author-role="${msg.getAttribute('data-message-author-role')}">${msg.innerHTML}</div>`)
    .join('');
  
  return rawHtml;
}
