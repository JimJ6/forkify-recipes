class SearchView {
    _parentEl = document.querySelector('.search');

    getQuery() {
        const query = this._parentEl.querySelector('.search__field').value;  // selects the input box, and its value
        this._clearInput();
        return query
    }

    _clearInput() {
        this._parentEl.querySelector('.search__field').value = '';  // Clears when submitted
    }

    //publisher
    addHandlerSearch(handler) {
        this._parentEl.addEventListener('submit', function (e) {
            e.preventDefault();  //Again, prevents default when submitting a form..  
            handler();
        });
    }
}


// again, exporting an instance of the above class, not the class itself
export default new SearchView()  