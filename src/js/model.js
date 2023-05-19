import { async } from 'regenerator-runtime';
import { API_URL, KEY, RES_PER_PAGE } from './config.js'
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        page: 1,
        results: [],
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],

};

const createRecipeObject = function (data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    };
};



export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`)
        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

        console.log(state.recipe);
    } catch (err) {
        //Temporary error handling
        console.error(`${err}💥💥💥💥💥💥💥`);
        throw err;
    }
};

export const loadSearchResults = async function (query) {    //Takes in 'query' from controller
    try {
        state.search.query = query;                           //
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            };
        });
        state.search.page = 1;
    } catch (err) {
        console.error(`${err}💥💥💥💥💥💥💥`);
        throw err;
    }
};

// Pagination
export const getSearchResultsPage = function (page = state.search.page) {   //Not an async function because the search results are already loaded at this point.. 
    state.search.page = page;

    const start = (page - 1) * RES_PER_PAGE;
    const end = page * RES_PER_PAGE;

    return state.search.results.slice(start, end);
}


export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQty = oldQty * newServings / OldServings // 2 * 8 / 4 = 4 
    });

    state.recipe.servings = newServings;
};

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
};



export const addBookMark = function (recipe) {
    // Add Bookmark   
    state.bookmarks.push(recipe);

    //Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
};

// "A common pattern in programming is when we add something we get the entire data (above codeblock), and delete something, just the id (below codeBlock)" 203. notes

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1)   //at whatever postion the el.id is equal to the recipe id passed in, remove 1 item
    // Mark current recipe as NOT bookmarked!
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
};
init()



// // A clear bookmarks function to manually clear them when needed during development
// const clearBookmarks = function () {
//     localStorage.clear('bookmarks')
// }

// clearBookmarks()

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                // const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3)
                    throw new Error('Wrong ingredient format! Please use the correct format :)'
                    );

                const [quantity, unit, description] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, description }; //We want the quantity to be a number, and null if empty
            });

        //Create the object that is ready to be uploaded..
        // This object will be the opposite of the one in loadRecipe
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookMark(state.recipe)
    } catch (err) {
        throw err;
    }
};