console.log("content_script.js loaded");

import { convertToMarkdown, convertToLatex } from './popup/utils/parser.js';

function getConversationText(format) {
  console.log('TESTING: div[data-message-author-role="${specificRole}"]');
  //const messages = document.querySelectorAll('[data-message-author-role]');
  const divs = document.querySelectorAll(`div[data-message-author-role="${specificRole}"]`);

  console.log(divs); // Logs all matching div elements

  console.log('TESTING: [data-message-author-role]');
  const messages = document.querySelectorAll('[data-message-author-role]');
  console.log('Grabbed message:');
  console.log(messages);
  
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
    console.log('Received extractText request:', request);
    const format = request.format; // Get format (markdown/latex) from request
    const conversationText = getConversationText(format);
    sendResponse({ text: conversationText });
  }
});
