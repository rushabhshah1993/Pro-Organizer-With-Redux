import * as actionTypes from './../actions/actionTypes';

const initialState = {
    boardData: {},
    serverError: false
};

const boardReducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.GET_BOARDS: {
            let updatedState = {...state};
            updatedState.boardData = action.payload;
            return updatedState;
        }
        case actionTypes.GET_BOARDS_FAILED: {
            console.log('Here');
            let updatedState = {...state};
            updatedState.serverError = true;
            return updatedState;
        }
        default: return state;
    }
}

export default boardReducer;