import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './Board.css';
import createBoardStyles from './../CreateBoard/CreateBoard.css';

import BoardColumn from './../../components/BoardColumn/BoardColumn';
import Modal from './../../common/Modal/Modal';
import CardInfo from './../../components/CardInfo/CardInfo';
import AddCard from './../../components/AddCard/AddCard';
import { toSnakeCase } from './../../utility';
import Axios from 'axios';
import * as actions from './../../store/actions/index';

class Board extends Component {
    constructor(props) {
        super(props);
        this.addColumnRef = React.createRef()
    }

    state = {
        showModal: false,
        selectedCardData: {},
        showAddCardModal: false,
        addCardToColumnID: null,
        boardData: {},
        showAddColumnModal: false,
        showEditModal: false,
        archivedCards: []
    }

    componentDidMount() {
        let url = 'https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/boards/'+this.props.match.params.boardId+'.json';
        Axios.get(url)
            .then(response => {
                this.setState({
                    boardData: response.data
                })
            })
            .catch(error => {console.log(error)});

        Axios.get('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/archivedBoards.json')
            .then(response => {
                let archivedCards = [];
                if(response.data !== null) {
                    archivedCards = response.data;
                }
                this.setState({
                    archivedCards: archivedCards
                })
            })
            .catch(error => {console.log(error);})
    }

    cardClickHandler = (card_details) => {
        let columnBoardData = this.props.boardData.boards[this.props.match.params.boardId];
        let cardData = columnBoardData.cards.filter(card => {
            return card.id === card_details.card_id;
        });
        let selectedCardData = {};
        let columnData = columnBoardData.columns.filter(column => {
            return column.id === cardData[0].column;
        })
        selectedCardData.card = cardData;
        selectedCardData.column = columnData;
        this.setState({
            selectedCardData: selectedCardData,
            showModal: true
        })
    }
    
    closeModalHandler = () => {
        this.setState({
            showModal: false,
            selectedCardData: {}
        })
    }

    closeAddCardModalHandler = () => {
        this.setState({
            showAddCardModal: false,
            addCardToColumnID: null
        })
    }

    closeAddColumnModalHandler = () => {
        this.setState({
            showAddColumnModal: false
        })
    }

    addCardHandler = (column_id) => {
        this.setState({
            showAddCardModal: true,
            addCardToColumnID: column_id
        })
    }

    addEditedCardToDBHandler = (values) => {
        let id = this.state.selectedCardData.card[0].id;
        let boardData = {...this.state.boardData};
        let cardData = boardData.cards.filter(card => {return card.id === id});
        for(let key in values) {
            cardData[0][key] = values[key];
        }
        let url = 'https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/boards/'+boardData.id+'.json';
        Axios.put(url, boardData)
            .then(response => {
                this.setState({
                    boardData: boardData,
                    showEditModal: false
                })
            })
            .catch(error => {console.log(error)});
    }

    addCardToDBHandler = () => {
        this.setState({
            showAddCardModal: false,
            addCardToColumnID: null
        })
    }

    addColumnHandler = () => {
        this.setState({
            showAddColumnModal: true
        })
    }

    addColumnToDBHandler = () => {
        let columnBoardData = this.props.boardData.boards[this.props.match.params.boardId];
        let updatedBoardData = {...this.props.boardData};
        let column_name = this.addColumnRef.current.value;
        let column_id = toSnakeCase(column_name);
        let newColumn = {
            id: column_id,
            name: column_name
        }
        let columns = columnBoardData.columns || [];
        columns.push(newColumn);
        columnBoardData.columns = columns;
        updatedBoardData.boards[this.props.match.params.boardId] = columnBoardData;
        
        this.setState({
            addColumnLoading: true
        })

        Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn.json', updatedBoardData)
            .then(response => {
                this.props.updateBoardData(updatedBoardData)
                this.setState({
                    showAddColumnModal: false,
                    addColumnLoading: false
                })
            })
    }

    editCardHandler = (column_id) => {
        this.setState({
            showEditModal: true,
            showModal: false,
            addCardToColumnID: column_id
        })
    }

    archiveCardHandler = (archived_card) => {
        let archivedCards = [...this.state.archivedCards];
        archivedCards.push(archived_card);

        let boardData = {...this.state.boardData};
        let cards = boardData.cards;
        let updatedCards = cards.filter(card => {return card.id !== archived_card.id;})
        boardData.cards = updatedCards;
        
        Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/archivedCards.json', archivedCards)
            .then(response => {
                this.setState({
                    archivedCards: archivedCards,
                    showModal: false
                })

                Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/boards/'+this.state.boardData.id+'/cards.json', updatedCards)
                    .then(response => {
                        this.setState({
                            boardData: boardData
                        })
                    })
                    .catch(error => {console.log(error);})
            })
            .catch(error => {console.log(error);})
    }

    deleteColumnHandler = (column_id) => {
        let updatedBoardData = {...this.props.boardData};
        let columnBoardData = {...this.props.boardData.boards[this.props.match.params.boardId]};
        let cards = columnBoardData.cards;
        let columns = columnBoardData.columns;
        let updatedCards = cards.filter(card => {
            return card.column !== column_id;
        })
        let updatedColumns = columns.filter(column => {
            return column.id !== column_id;
        })
        columnBoardData.cards = updatedCards;
        columnBoardData.columns = updatedColumns;
        updatedBoardData.boards[this.props.match.params.boardId] = columnBoardData;
        Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn.json', updatedBoardData)
            .then(response => {this.props.updateBoardData(updatedBoardData);})
            .catch(error => {console.log(error);})
    }

    deleteBoardHandler = () => {
        console.log('Here');
        Axios.get('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn.json')
            .then(response => {
                let appData = {...response.data};
                let allBoards = appData.allBoards;
                let boards = appData.boards;
                let updatedAllBoards = allBoards.filter(board => {
                    return board.id !== this.state.boardData.id;
                })
                let updatedBoards = {};
                for(let board of Object.keys(boards)) {
                    if(board !== this.state.boardData.id) {
                        updatedBoards[board] = boards[board];
                    }
                }
                appData.allBoards = updatedAllBoards;
                appData.boards = updatedBoards;
                
                Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn.json', appData)
                    .then(response => {
                        this.props.history.push('/');
                    })
                    .catch(error => {console.log(error);})
            })
            .catch(error => {console.log(error);})
    }

    closeEditModalHandler = () => {
        this.setState({
            showEditModal: false,
        })
    }

    droppedCardHandler = (received_card, receiving_column) => {
        let boardData = {...this.state.boardData};
        let cards = [...this.state.boardData.cards];
        let updatedCards = cards.filter(card => {
            if(card.id === received_card.id) {
                card.column = receiving_column;
                return card;
            } else {
                return card;
            }
        });
        boardData.cards = updatedCards;
        Axios.put('https://pro-organizer-f83b5.firebaseio.com/boardData/-LuM4blPg67eyvzgAzwn/boards/'+this.state.boardData.id+'/cards.json', updatedCards)
            .then(response => {
                this.setState({
                    boardData: boardData
                })
            })
            .catch(error => {console.log(error)});
    }

    render() {
        // console.log(this.props, this.state);
        let content = null;
        if(Object.keys(this.props.boardData).length > 0) {
            let dataOfBoard = {...this.props.boardData.boards[this.props.match.params.boardId]};
            dataOfBoard.cards = dataOfBoard.cards || [];
            let columns = null;
            if(dataOfBoard.columns !== undefined) {
                columns = dataOfBoard.columns.map(column => {
                    let columnData = dataOfBoard.cards.filter(card => {
                        return card.column === column.id;
                    })
                    return ( 
                        <BoardColumn 
                            title={column.name} 
                            id={column.id} 
                            columnData={columnData} 
                            key={column.id} 
                            cardClicked={this.cardClickHandler} 
                            addCard={this.addCardHandler} 
                            droppedCard={(card, column) => this.droppedCardHandler(card, column)} 
                            deleteColumn={(column_id) =>  this.deleteColumnHandler(column_id)}
                        />
                    )
                })
            }  
            let cardInfo = Object.keys(this.state.selectedCardData).length > 0 ? <CardInfo data={this.state.selectedCardData} editCard={this.editCardHandler} archiveCard={this.archiveCardHandler} /> : null;

            content = (
                <>
                    {this.state.showModal ? <Modal content={cardInfo} close={this.closeModalHandler} /> : null}
                    {
                        this.state.showAddCardModal ?
                        <Modal 
                            content={
                                <AddCard members={this.state.boardData.members} addCard={this.addCardToDBHandler} boardID={this.props.match.params.boardId} columnID={this.state.addCardToColumnID} />
                            } 
                            close={this.closeAddCardModalHandler} 
                        /> : 
                        null
                    }
                    {
                        this.state.showEditModal ?
                        <Modal 
                            content={
                                <AddCard members={this.props.boardData.boards[this.props.match.params.boardId].members} addCard={this.addEditedCardToDBHandler} editCard={true} cardData={this.state.selectedCardData} />
                            } 
                            close={this.closeEditModalHandler} 
                        /> : 
                        null
                    }
                    {
                        this.state.showAddColumnModal ? 
                        <Modal 
                            content={
                                this.state.addColumnLoading ?
                                <span>Creating your column...</span> :
                                <>
                                    <p className={styles.BoardTitle}>Add column</p>
                                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <p>Enter a column name:</p>
                                        <input type='text' ref={this.addColumnRef} style={{width: '100%'}} />
                                    </div>
                                    <button className={createBoardStyles.CreateButton} style={{width: 'auto', float: 'right'}} onClick={this.addColumnToDBHandler}>Add Column</button>
                                </>
                            }
                            close={this.closeAddColumnModalHandler}
                        /> :
                        null}
                    <div className={styles.BoardHeader}>
                        <p className={styles.BoardTitle}>{this.state.boardData.name} Board</p>
                        <button className={createBoardStyles.CreateButton} style={{backgroundColor: 'red', width: 'auto'}} onClick={this.deleteBoardHandler}>Delete Board</button>
                    </div>
                    <div className={styles.ColumnsContainer}>
                        {columns}
                        <div className={styles.AddColumn} onClick={this.addColumnHandler}>Add a column</div>
                    </div>
                </>
            )
        } else {
            content = <p>Loading...</p>;
        }
        return (
            <>
                <div className={styles.Board}>
                    {content}
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        boardData: state.boards.boardData
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateBoardData: (data) => dispatch(actions.updateBoardData(data))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Board));
