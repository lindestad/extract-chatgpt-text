import { convertToMarkdown, convertToLatex } from './utils/parser.js';

function getConversationText(format) {
  const messages = document.querySelectorAll('[data-message-author-role]');
  
  return Array.from(messages)
    .map(msg => {
      const role = msg.getAttribute('data-message-author-role');
      const formattedText = format === 'markdown'
        ? convertToMarkdown(msg.innerHTML)
        : convertToLatex(msg.innerHTML);
      return `${capitalize(role)}: ${formattedText}`;
    })
    .join('\n\n');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    const format = request.format; // Get format (markdown/latex) from request
    const conversationText = getConversationText(format);
    sendResponse({ text: conversationText });
  }
});
