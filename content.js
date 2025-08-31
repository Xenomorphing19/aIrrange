const url = new URL(window.location.href);

const searchQuery = url.searchParams.get('q');

if (searchQuery) {
  console.log("Captured search query:", searchQuery);
}
