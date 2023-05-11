const searchBtn = document.querySelector('.navbar_search button');
searchBtn.addEventListener('click', () => {
    search();
});
function search() {
    const searchInput = document.querySelector('input[name="searchInput"]');
    const searchValue = searchInput.value.trim();
    if (searchValue) {
        window.location.href = `/search?q=${searchValue}`;
    }
}