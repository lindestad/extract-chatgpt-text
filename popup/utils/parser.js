export function convertToRawText(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Handle <hr> tags
  Array.from(tempDiv.querySelectorAll('hr')).forEach(hr => {
    hr.replaceWith('\n\n');
  });

  // Add newlines after <p> blocks
  Array.from(tempDiv.querySelectorAll('p')).forEach(p => {
    p.replaceWith(`${p.textContent.trim()}\n\n`);
  });

  // Extract and return the raw text content
  return tempDiv.textContent.trim();
}

export function convertToMarkdown(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <strong> or <b> to **bold**
  Array.from(tempDiv.querySelectorAll('strong, b')).forEach(el => {
    el.replaceWith(`**${el.textContent}**`);
  });

  // Convert <li> to list items
  Array.from(tempDiv.querySelectorAll('li')).forEach(li => {
    const parentTag = li.parentElement.tagName.toLowerCase();
    const prefix = parentTag === 'ol' ? `${Array.from(li.parentElement.children).indexOf(li) + 1}. ` : '- ';
    li.replaceWith(`${prefix}${li.textContent.trim()}\n`);
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

  return tempDiv.textContent.trim();
}

export function convertToLatex(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <strong> or <b> to \textbf{}
  Array.from(tempDiv.querySelectorAll('strong, b')).forEach(el => {
    el.replaceWith(`\\textbf{${el.textContent}}`);
  });

  // Convert <li> to LaTeX list items
  Array.from(tempDiv.querySelectorAll('li')).forEach(li => {
    li.replaceWith(`\\item ${li.textContent}`);
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

  return tempDiv.textContent.trim();
}
