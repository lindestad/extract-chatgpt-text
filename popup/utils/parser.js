export function convertToRawText(html, prepend_role = false) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <li> to list items
  Array.from(tempDiv.querySelectorAll('ol, ul')).forEach(list => {
    Array.from(list.children).forEach((li, index) => {
      const prefix = list.tagName.toLowerCase() === 'ol' ? `${index + 1}. ` : '• ';
      li.replaceWith(`${prefix}${li.textContent.trim()}\n`);
    });
  });

  // Handle <hr> tags
  Array.from(tempDiv.querySelectorAll('hr')).forEach(hr => {
    hr.replaceWith('\n\n');
  });

  // Add newlines after <p> blocks
  Array.from(tempDiv.querySelectorAll('p')).forEach(p => {
    p.replaceWith(`${p.textContent.trim()}\n\n`);
  });

  // Strip trailing newlines from each message and join them
  const strippedMessages = Array.from(tempDiv.querySelectorAll('[data-message-author-role]'))
  .map(node => {
    let text = node.textContent.trim();
    if (prepend_role) { // Prefix the role to the text
      const role = node.getAttribute('data-message-author-role');
      const prefix = role === 'user' ? 'User wrote:' : 'ChatGPT wrote:'; // Decide prefix based on the role
      text = `${prefix}\n${text}`; // Prepend the text
    }
    return text;
  });
 
  // Join the selected messages with exactly three newlines between them
  return strippedMessages.join('\n\n\n');
}

export function convertToMarkdown(html, prepend_role = false) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <strong> or <b> to **bold**
  Array.from(tempDiv.querySelectorAll('strong, b')).forEach(el => {
    el.replaceWith(`**${el.textContent}**`);
  });

  // Convert <li> to list items
  Array.from(tempDiv.querySelectorAll('ol, ul')).forEach(list => {
    Array.from(list.children).forEach((li, index) => {
      const prefix = list.tagName.toLowerCase() === 'ol' ? `${index + 1}. ` : '- ';
      li.replaceWith(`${prefix}${li.textContent.trim()}\n`);
    });
  });

  // Convert <h1>, <h2>, <h3>, etc. to Markdown headers
  Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(h => {
    const level = h.tagName.slice(1); // Get the header level
    h.replaceWith(`${'#'.repeat(level)} ${h.textContent}`);
  });

  // Handle code blocks or inline code
  Array.from(tempDiv.querySelectorAll('pre, code')).forEach(code => {
    code.replaceWith(`\`${code.textContent}\``);
  });

  // Handle <hr> tags
  Array.from(tempDiv.querySelectorAll('hr')).forEach(hr => {
    hr.replaceWith('---\n\n');
  });

  // Add newlines after <p> blocks
  Array.from(tempDiv.querySelectorAll('p')).forEach(p => {
    p.replaceWith(`${p.textContent.trim()}\n\n`);
  });

  // Strip trailing newlines from each message and join them
  const strippedMessages = Array.from(tempDiv.querySelectorAll('[data-message-author-role]'))
  .map(node => {
    let text = node.textContent.trim();
    if (prepend_role) { // Prefix the role to the text
      const role = node.getAttribute('data-message-author-role');
      const prefix = role === 'user' ? '**User wrote:**' : '**ChatGPT wrote:**'; // Decide prefix based on the role
      text = `${prefix}\n${text}`; // Prepend the text
    }
    return text;
  });

  // Join the selected messages with exactly three newlines between them
  return strippedMessages.join('\n\n\n');
}

export function convertToLatex(html, prepend_role = false) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <strong> or <b> to \textbf{}
  Array.from(tempDiv.querySelectorAll('strong, b')).forEach(el => {
    el.replaceWith(`\\textbf{${el.textContent}}`);
  });

  // Convert <li> to LaTeX list items
  Array.from(tempDiv.querySelectorAll('ol, ul')).forEach(list => {
    const listType = list.tagName.toLowerCase() === 'ol' ? 'enumerate' : 'itemize';
    const items = Array.from(list.querySelectorAll('li')).map(li => `    \\item ${li.textContent.trim()}`).join('\n');
    
    // Replace the entire list with LaTeX formatted list
    const latexList = `\\begin{${listType}}\n${items}\n\\end{${listType}}`;
    list.replaceWith(latexList);
  });

  // Convert <h1>, <h2>, <h3>, etc. to LaTeX headers
  Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(h => {
    const level = h.tagName.slice(1); // Get the header level
    h.replaceWith(`\\${'sub'.repeat(level - 1)}section{${h.textContent}}`);
  });

  // Handle code blocks or inline code
  Array.from(tempDiv.querySelectorAll('pre, code')).forEach(code => {
    code.replaceWith(`\\texttt{${code.textContent}}`);
  });

  // Handle <hr> tags
  Array.from(tempDiv.querySelectorAll('hr')).forEach(hr => {
    hr.replaceWith('\\hrulefill\n\n');
  });

  // Add newlines after <p> blocks
  Array.from(tempDiv.querySelectorAll('p')).forEach(p => {
    p.replaceWith(`${p.textContent.trim()}\n\n`);
  });

  // Strip trailing newlines from each message and join them
  const strippedMessages = Array.from(tempDiv.querySelectorAll('[data-message-author-role]'))
  .map(node => {
    let text = node.textContent.trim();
    if (prepend_role) { // Prefix the role to the text
      const role = node.getAttribute('data-message-author-role');
      const prefix = role === 'user' ? '\\textbf{User wrote:}' : '\\textbf{ChatGPT wrote:}'; // Decide prefix based on the role
      text = `${prefix}\n${text}`; // Prepend the text
    }
    return text;
  });
 
  // Join the selected messages with exactly three newlines between them
  return strippedMessages.join('\n\n\n');
}

function splitConversation(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const messages = [];
  const messageElements = tempDiv.querySelectorAll('[data-message-author-role]');

  messageElements.forEach(messageElement => {
    const role = messageElement.getAttribute('data-message-author-role');
    const content = messageElement.innerHTML.trim();
    messages.push({ role, content });
  });

  return messages;
}
