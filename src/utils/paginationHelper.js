export function paginateContent(content) {
    const wordsPerPage = 200;
    const words = content.split(' ');
    const pages = [];
  
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push(words.slice(i, i + wordsPerPage).join(' '));
    }
  
    return pages.map((page) => `<p>${page}</p>`);
  }
  