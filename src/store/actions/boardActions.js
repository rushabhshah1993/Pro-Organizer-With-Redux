import * as actionTypes from './actionTypes';
import Axios from 'axios';

export const getBoards = (boards) => {
    return {
        type: actionTypes.GET_BOARDS,
        payload: boards
    }
}

export const getBoardsFailed = () => {
    return {
        type: actionTypes.GET_BOARDS_FAILED
    }
}

export const initBoards = () => {
    return dispatch => {
        Axios.get('https://pro-organizer-f83b5.firebaseio.com/boardData.json')
            .then(response =>  {
                let boardData = {};
                for(let value in response.data) {
                    boardData = response.data[value];
                }
                dispatch(getBoards(boardData));
            })
            .catch(error => {
                dispatch(getBoardsFailed());
            })
    }
}