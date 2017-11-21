import articles from '../data/articles';

const initialState = { articles }

const articleItems = (state = initialState, action) => {
	console.log("WILL CHANGE")
	return state;
}

export default articleItems;