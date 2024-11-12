export function convertToMarkdown(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert <strong> or <b> to **bold**
  Array.from(tempDiv.querySelectorAll('strong, b')).forEach(el => {
    el.replaceWith(`**${el.textContent}**`);
  });

  // Convert <li> to list items
  Array.from(tempDiv.querySelectorAll('li')).forEach(li => {
    li.replaceWith(`- ${li.textContent}`);
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

  // Convert headers to LaTeX sections
  Array.from(tempDiv.querySelectorAll('h1, h2, h3')).forEach(h => {
    const level = parseInt(h.tagName.slice(1));
    const latexHeader = level === 1 ? 'section' : level === 2 ? 'subsection' : 'subsubsection';
    h.replaceWith(`\\${latexHeader}{${h.textContent}}`);
  });

  return tempDiv.textContent.trim();
}
