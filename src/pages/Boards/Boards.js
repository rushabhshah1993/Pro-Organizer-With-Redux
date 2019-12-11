import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import boardStyles from './../Board/Board.css';
import styles from './Boards.css';

import * as actions from './../../store/actions/index';

class Boards extends Component {
    componentDidMount = () => {
        this.props.initBoards();
    }

    render() {
        let boards = null;

        if(this.props.serverError === false) {
            Object.keys(this.props.boardData).length > 0 ?
            boards = this.props.boardData.allBoards.map(boards => {
                return (
                    <Link 
                        to={{
                            pathname: `/board/${boards.id}`
                        }} 
                        key={boards.id}>
                        <div className={styles.BoardCard}>
                            {boards.name}
                        </div>
                    </Link>
                )
            }) :
            boards = <div className={styles.Loading}>Loading...</div>
        } else {
            boards = <p>There seems to be a server error. Please try again later.</p>;
        }

        return (
            <div>
                <p className={boardStyles.BoardTitle}>Boards</p>
                <div className={styles.Boards}>
                    {boards}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        boardData: state.boards.boardData,
        serverError: state.boards.serverError
    }
}

const mapDispatchToProps = dispatch => {
    return {
        initBoards: () => dispatch(actions.initBoards())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Boards);
