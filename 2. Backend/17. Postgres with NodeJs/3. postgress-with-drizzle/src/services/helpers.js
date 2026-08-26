// Shared across services/*.js: Prisma returns `book.genres` as a flat
// Genre[] via its implicit many-to-many field. Drizzle has no implicit M2M,
// so a book is fetched as `with: { bookGenres: { with: { genre: true } } }`
// and flattened back into that same `genres: [...]` shape here - keeping
// every JSON response identical to the Prisma version regardless of which
// query got you the book.
function flattenBookGenres(book) {
  if (!book || !book.bookGenres) return book;
  const { bookGenres: joinRows, ...rest } = book;
  return { ...rest, genres: joinRows.map((row) => row.genre) };
}

function flattenBookGenresList(books) {
  return books.map(flattenBookGenres);
}

module.exports = { flattenBookGenres, flattenBookGenresList };
