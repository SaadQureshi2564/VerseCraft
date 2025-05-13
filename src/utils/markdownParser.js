export function parseMarkdown(markdownText) {
  const lines = markdownText.split('\n');
  const chapters = [];
  let currentChapter = null;

  lines.forEach(line => {
    if (line.startsWith('# ')) {
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      currentChapter = { title: line.substring(2).trim(), content: '' };
    } else if (currentChapter) {
      currentChapter.content += `<p>${line}</p>`;
    }
  });

  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

export function paginateContent(content) {
  const wordsPerPage = 200;
  const words = content.split(' ');
  const pages = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(' '));
  }

  return pages.map((page) => `<p>${page}</p>`);
}
