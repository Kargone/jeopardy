import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getDatabase,
    child,
    ref,
    set,
    get,
    push, 
    update
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAbFg-ax7FMV5FiNqsAE2ZNXhKB3FMQBWE",
    authDomain: "jeopardy-a365e.firebaseapp.com",
    databaseURL: "https://jeopardy-a365e-default-rtdb.firebaseio.com",
    projectId: "jeopardy-a365e",
    storageBucket: "jeopardy-a365e.appspot.com",
    messagingSenderId: "834996600275",
    appId: "1:834996600275:web:d8588aafc0d2b0fecac326"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let user_data = {
    'game_boards': 'empty',
    'default_board': {
        'name': 'Name here...',
        'normal-jeopardy-topic-amount': 5,
        'normal-jeopardy-question-amount': 5,
        'double-jeopardy-topic-amount': 5,
        'double-jeopardy-question-amount': 5,
        'timer-delay': 5,
        'timer-length-normal': 30,
        'timer-length-daily-double': 60,
        'normal-jeopardy': true,
        'double-jeopardy': true,
        'final-jeopardy': true,
        'title-color': '#f8ff00',
        'topic-color': '#ffffff',
        'question-board-color': '#f8ff00',
        'background-color': '#073763',
        'answer-color': '#ffffff',
        'question-color': '#ffffff',
        'images-allowed': true,
        'key-reveal-answer': 'NA',
        'key-go-home': 'NA',
        'normal-jeopardy-m': 100,
        'normal-jeopardy-b': 0,
        'double-jeopardy-m': 200,
        'double-jeopardy-b': 0
    },
    'active_games': 'empty',
    'folders': ['main/']
};
let userId;
const boardName_boardNumber = {
    'normal-jeopardy': '1',
    'double-jeopardy': '2',
    'final-jeopardy': '3'
}
let new_board_settings = {};
let created_folders = {};
let user_path = 'main/';
let select_board_path = 'main/';
let select_board_folders_created = [];
let active_game_board_index = 0;
let new_game;

class Board {
    constructor(object, loadFromSettings, board_index, board_type = 'normal-jeopardy') {
        if (loadFromSettings) {
            this.loadFromSettings(object, board_type, board_index);
        } else {
            this.loadFromExport(object);
        }
    }
    loadFromSettings(settings, board_type, board_index) {
        this.type = board_type;
        switch(this.type) {
            case 'normal-jeopardy': 
                this.title = 'Normal Jeopardy';
                break;
            case 'double-jeopardy': 
                this.title = 'Double Jeopardy';
                break;
            case 'final-jeopardy': 
                this.title = 'Final Jeopardy';
                break;
            default:
                this.title = 'Normal Jeopardy';
        }
        this.titleColor = settings['title-color'];
        this.topicColor = settings['topic-color'];
        this.questionBoardColor = settings['question-board-color'];
        this.backgroundColor = settings['background-color'];
        this.answerColor = settings['answer-color'];
        this.questionColor = settings['question-color'];
        this.imagesAllowed = settings['images-allowed'];
        this.keyRevealAnswer = settings['key-reveal-answer'];
        this.keyGoHome = settings['key-go-home'];
        this.timerDelay = settings['timer-delay'];
        this.timerLengthNormal = settings['timer-length-normal'];
        this.timerLengthDailyDouble = settings['timer-length-daily-double'];
        switch(this.type) {
            case 'normal-jeopardy':
            case 'double-jeopardy': {
                this.m = settings[`${this.type}-m`];
                this.b = settings[`${this.type}-b`];
                break;
            }
            case 'final-jeopardy': {
                this.m = 0;
                this.b = 0;
                break;
            }
            default: {
                this.m = settings[`normal-jeopardy-m`];
                this.b = settings[`normal-jeopardy-b`];
            }
        }
        switch(this.type) {
            case 'normal-jeopardy':
            case 'double-jeopardy': {
                this.topicAmount = settings[`${this.type}-topic-amount`];
                this.questionAmount = settings[`${this.type}-question-amount`];
                break;
            }
            case 'final-jeopardy': {
                this.topicAmount = 1;
                this.questionAmount = 1;
                break;
            }
            default: {
                this.topicAmount = settings[`normal-topic-amount`];
                this.questionAmount = settings[`normal-question-amount`];
            }
        }
        this.topicNames = [];
        for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++)
            this.topicNames.push(`Topic ${topic_number}`);
        this.boardIndex = board_index;
        this.questionInfos = {};
        this.loadQuestionInfosFromSettings();
    }
    loadQuestionInfosFromSettings() {
        for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
            for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                const question_value = this.m * question_in_topic_number + this.b;
                this.questionInfos[`question-${question_number}`] = new Question({
                    'board_type': this.type,
                    'question_value': question_value,
                    'question_number': question_number,
                    'background_color': this.backgroundColor,
                    'answer_color': this.answerColor,
                    'question_color': this.questionColor,
                    'images_allowed': this.imagesAllowed,
                    'key_reveal_answer': this.keyRevealAnswer,
                    'key_go_home': this.keyGoHome,
                    'topic_number': topic_number,
                    'question_in_topic_number': question_in_topic_number,
                    'timer_delay': this.timerDelay,
                    'timer_length_normal': this.timerLengthNormal,
                    'timer_length_daily_double': this.timerLengthDailyDouble,
                    'board_index': this.boardIndex
                }, true);
            }
        }
    }
    loadFromExport(board_export) {
        this.type = board_export['type'];
        this.title = board_export['title'];
        this.questionBoardColor = board_export['question-board-color'];
        this.titleColor = board_export['title-color'];
        this.topicColor = board_export['topic-color'];
        this.backgroundColor = board_export['background-color'];
        this.answerColor = board_export['answer-color'];
        this.questionColor = board_export['question-color'];
        this.imagesAllowed = board_export['images-allowed'];
        this.keyRevealAnswer = board_export['key-reveal-answer'];
        this.keyGoHome = board_export['key-go-home'];
        this.m = board_export['board-m'];
        this.b = board_export['board-b'];
        this.topicAmount = board_export['topic-amount'];
        this.questionAmount = board_export['question-amount'];
        this.topicNames = board_export['topic-names'];
        this.questionInfos = board_export['question-infos'];
        this.timerDelay = board_export['timer-delay'];
        this.timerLengthNormal = board_export['timer-length-normal'];
        this.timerLengthDailyDouble = board_export['timer-length-daily-double'];
        this.boardIndex = board_export['board-index'];
        this.loadQuestionInfosFromExport();
    }
    loadQuestionInfosFromExport() {
        let new_question_info = {};
        for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
            for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                new_question_info[`question-${question_number}`] = new Question(this.questionInfos[`question-${question_number}`], false);
            }
        }
        this.questionInfos = new_question_info;
    }
    loadForEditing() {
        document.querySelector(':root').style.setProperty('--title-color', this.titleColor);
        document.querySelector(':root').style.setProperty('--topic-color', this.topicColor);
        document.querySelector(':root').style.setProperty('--question-board-color', this.questionBoardColor);
        document.querySelector(':root').style.setProperty('--background-color', this.backgroundColor);
        document.querySelector(':root').style.setProperty('--question-color', this.questionColor);
        document.querySelector(':root').style.setProperty('--answer-color', this.answerColor);
        let board_container = document.createElement("div");
        board_container.id = `${this.type}-board-container`;
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            board_container.innerHTML = `
                <div id="${this.type}-title-container">
                    <h1 class="board-title">${this.title}</h1>
                </div>
                <div class="board-toggles">
                    <div>
                        <label for="${this.type}-edit-text">Edit Text:</label>
                        <label class="switch">
                            <input type="checkbox" id="${this.type}-edit-text">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div>
                        <label for="${this.type}-show-daily-doubles">Show DDs:</label>
                        <label class="switch">
                            <input type="checkbox" id="${this.type}-show-daily-doubles">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                <div class="home-button-container-board">
                    <button id="${this.type}-home-button">Home</button>
                </div>
                <div class="next-board">
                    <button id="${this.type}-next-board">Next Board</button>
                </div>
            `;
            let table = '<table>';
            let table_headings = '<tr>';
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                table_headings += `<th id="${this.type}-topic-${topic_number}">${this.topicNames[topic_number - 1]}</th>`;
            }
            table_headings += '</tr>';
            table += table_headings;
            for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                let table_row = '<tr>';
                for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    table_row += `<td id="${this.type}-board-question-${question_number}">$${question_info.questionValue}</td>`;
                }
                table_row += '</tr>';
                table += table_row;
            }
            table += '</table>'
            board_container.innerHTML += table;
            document.querySelector(':root').style.setProperty('--table-heading-font-size', `${(window.innerHeight * .99 - 180) / 81}vh`);
            document.querySelector(':root').style.setProperty('--table-element-font-size', `${(window.innerHeight * .99 - 180) / 101}vh`);
            board_container.style.display = 'none';
            document.getElementById('boards-container').appendChild(board_container);
            let question_container = document.createElement("div");
            question_container.id = `${this.type}-questions-container`;
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    question_container.innerHTML += question_info.loadForEditing();
                }
            }
            document.getElementById('boards-container').appendChild(question_container);
        } else {
            const question_info = this.questionInfos['question-1'];
            board_container.innerHTML = `
                <div id="final-jeopardy-edit-container" class="final-jeopardy-edit-container">
                    <div id="${this.type}-edit-title-container">
                        <input id="${this.type}-title-input" class="title-input" value="${this.title}" type="text"/>
                    </div>
                    <div class="home-button-container-final-board">
                        <button id="${this.type}-home-button">Home</button>
                    </div>
                    <div class="next-board">
                        <button id="${this.type}-next-board">Next Board</button>
                    </div>
                    <div class="question-input-container">
                        <label>Q:</label>
                        <input id="final-jeopardy-question-input" type="text" value="${question_info.question}"/>
                    </div>
                    <div class="answer-input-container">
                        <label>A:</label>
                        <input id="final-jeopardy-answer-input" type="text" value="${question_info.answer}"/>
                    </div>
                    <div class="image-input-container">
                        <div>
                            <label>Image URL:</label>
                            <input id="final-jeopardy-image-input" type="text" value="${question_info.imageURL}"/>
                        </div>
                        <div>
                            <img id="final-jeopardy-image-preview" src="${question_info.imageURL}" alt="Image Preview"/>
                        </div>
                    </div>
                    <div class="preview-button-container">
                        <button id="final-jeopardy-preview-button">Preview</button>
                    </div>
                </div>
                <div id="final-jeopardy-preview-container" class="final-jeopardy-preview-container">
                    <div id="${this.type}-preview-title-container">
                        <h1 id="final-jeopardy-preview-title" class="board-title">${this.title}</h1>
                    </div>
                    <div class="wager-container">
                        <h2>Wagers:</h2>
                        <label>Team-1:</label>
                        <input id="final-jeopardy-team-1-wager-input" type="number" placeholder="0 - 1000..."/>
                        <label>Team-2:</label>
                        <input id="final-jeopardy-team-2-wager-input" type="number" placeholder="0 - 1000..."/>
                        <label>Team-3:</label>
                        <input id="final-jeopardy-team-3-wager-input" type="number" placeholder="0 - 1000..."/>
                    </div>
                    <div class="preview-question-container">
                        <h2 id="final-jeopardy-questions-text">Q: ${question_info.question}</h2>
                    </div>
                    <div class="preview-answer-container">
                        <h2 id="final-jeopardy-answer-text">A: ${question_info.answer}</h2>
                    </div>
                    <div class="preview-image-container">
                        <img id="final-jeopardy-preview-image" src="${question_info.imageURL}" alt="Image"/>
                    </div>
                    <div id="final-jeopardy-team-viewer" class="preview-team-viewer">
                        <div class="team-view-container team-1">
                            <div class="team-view-team-name">
                                <h2>Team 1</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="final-jeopardy-team-1-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="final-jeopardy-team-1-add-button">+</button>
                                <button class="substract-button" id="final-jeopardy-team-1-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-2">
                            <div class="team-view-team-name">
                                <h2>Team 2</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="final-jeopardy-team-2-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="final-jeopardy-team-2-add-button">+</button>
                                <button class="substract-button" id="final-jeopardy-team-2-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-3">
                            <div class="team-view-team-name">
                                <h2>Team 3</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="final-jeopardy-team-3-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="final-jeopardy-team-3-add-button">+</button>
                                <button class="substract-button" id="final-jeopardy-team-3-subtract-button">-</button>
                            </div>
                        </div>
                    </div>
                    <div class="next-button-container">
                        <button id="final-jeopardy-next-button">Reveal Question</button>
                    </div>
                </div>
            `;
            if (!this.imagesAllowed) {
                document.getElementById(`final-jeopardy-image-input`).style.display = 'none';
                document.getElementById(`final-jeopardy-image-preview`).style.display = 'none';
            }
            board_container.style.display = 'none';
            board_container.className = 'final-jeopardy-container';
            document.getElementById('boards-container').appendChild(board_container);
        }
        this.attachListnersForEditing();
    }
    attachListnersForEditing() {
        this.editingText = false;
        this.showingDailyDoubles = false;
        const this_board = this;
        let board_data_ref = user_data.game_boards[this.boardIndex].boards[`${boardName_boardNumber[this.type]}-${this.type}-board`];
        document.getElementById(`${this.type}-home-button`).addEventListener('click', function() {
            document.getElementById('boards-container').innerHTML = '';
            hideScreens('home-container');
        });
        document.getElementById(`${this.type}-next-board`).addEventListener('click', function() {
            document.getElementById(`${this_board.type}-board-container`).style.display = 'none';
            let index = 0;
            if (this_board.type === 'double-jeopardy') index = 1; 
            if (this_board.type === 'final-jeopardy') index = 2;
            for (let i = 0; i < 3; i++) {
                index = (index + 1) % 3;
                const boards = user_data.game_boards[this_board.boardIndex].boards;
                if (boards[Object.keys(boards)[index]] != false) {
                    document.getElementById(`${boards[Object.keys(boards)[index]].type}-board-container`).style.display = 'block';
                    break;
                }
            }
        });
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            document.getElementById(`${this.type}-edit-text`).addEventListener('click', function() {
                if (this_board.editingText) {
                    document.getElementById(`${this_board.type}-title-container`).innerHTML = `
                        <h1>${this_board.title}</h1>
                    `;
                    for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                        document.getElementById(`${this_board.type}-topic-${topic_number}`).innerHTML = `
                            ${this_board.topicNames[topic_number - 1]}
                        `;
                    }
                    for (let question_in_topic_number = 1; question_in_topic_number <= this_board.questionAmount; question_in_topic_number++) {
                        for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                            const question_number = (topic_number - 1) * this_board.questionAmount + question_in_topic_number;
                            const question_info = this_board.questionInfos[`question-${question_number}`];
                            question_info.editingText = false;
                            document.getElementById(`${this_board.type}-board-question-${question_number}`).innerHTML = `
                                $${question_info.questionValue}
                            `;
                        }
                    }
                    return this_board.editingText = false;
                }
                this_board.editingText = true;
                document.getElementById(`${this_board.type}-title-container`).innerHTML = `
                    <input id="${this_board.type}-title-input" class="title-input" value="${this_board.title}" type="text"/>
                `;
                document.getElementById(`${this_board.type}-title-input`).addEventListener('change', function(){
                    this_board.title = this.value;
                    board_data_ref.title = this.value;
                    update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board`), {
                        "title": this.value
                    });
                });
                for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                    document.getElementById(`${this_board.type}-topic-${topic_number}`).innerHTML = `
                        <input id="${this_board.type}-topic-${topic_number}-input" class="topic-heading-input" value="${this_board.topicNames[topic_number - 1]}" type="text"/>
                    `;
                    document.getElementById(`${this_board.type}-topic-${topic_number}-input`).addEventListener('change', function() {
                        this_board.topicNames[topic_number - 1] = this.value;
                        board_data_ref['topic-names'][topic_number - 1] = this.value;
                        update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board`), {
                            "topic-names": board_data_ref['topic-names']
                        });
                        for (let question_in_topic_number = 1; question_in_topic_number <= this_board.questionAmount; question_in_topic_number++) {
                            const question_number = (topic_number - 1) * this_board.questionAmount + question_in_topic_number;
                            const question_info = this_board.questionInfos[`question-${question_number}`];
                            question_info.title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
                            board_data_ref['question-infos'][`question-${question_number}`].title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
                            update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-${question_number}`), {
                                "title": `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`
                            });
                        }
                    });
                }
                for (let question_in_topic_number = 1; question_in_topic_number <= this_board.questionAmount; question_in_topic_number++) {
                    for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                        const question_number = (topic_number - 1) * this_board.questionAmount + question_in_topic_number;
                        const question_info = this_board.questionInfos[`question-${question_number}`];
                        question_info.editingText = true;
                        document.getElementById(`${this_board.type}-board-question-${question_number}`).innerHTML = `
                            <input id="${this_board.type}-board-question-${question_number}-input" class="table-element-input" value="${question_info.questionValue}" type="number"/>
                        `;
                        document.getElementById(`${this_board.type}-board-question-${question_number}-input`).addEventListener('change', function() {
                            question_info.questionValue = parseInt(this.value);
                            board_data_ref['question-infos'][`question-${question_number}`]['question-value'] = parseInt(this.value);
                            update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-${question_number}`), {
                                "question-value": this.value
                            });
                            question_info.title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
                            board_data_ref['question-infos'][`question-${question_number}`].title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
                            update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-${question_number}`), {
                                "title": `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`
                            });
                        });
                    }
                }
            });
            document.getElementById(`${this.type}-show-daily-doubles`).addEventListener('click', function() {
                this_board.showingDailyDoubles = this.checked;
                for (let question_in_topic_number = 1; question_in_topic_number <= this_board.questionAmount; question_in_topic_number++) {
                    for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                        const question_number = (topic_number - 1) * this_board.questionAmount + question_in_topic_number;
                        const question_info = this_board.questionInfos[`question-${question_number}`];
                        question_info.showingDailyDoubles = this.checked;
                        if (this_board.showingDailyDoubles) {
                            if (question_info.dailyDouble) document.getElementById(`${this_board.type}-board-question-${question_number}`).style.backgroundColor = 'red';
                        } else {
                            document.getElementById(`${this_board.type}-board-question-${question_number}`).style.backgroundColor = this_board.backgroundColor;
                        }
                    }
                }
            });
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    question_info.attachListnersForEditing();
                }
            }
        } else {
            const this_question = this.questionInfos['question-1'];
            this_question['team-1-wager'] = 0;
            this_question['team-2-wager'] = 0;
            this_question['team-3-wager'] = 0;
            this_question.revealedQuestion = false;
            this_question.revealedAnswer = false;
            document.getElementById(`${this_board.type}-title-input`).addEventListener('change', function(){
                this_board.title = this.value;
                board_data_ref.title = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board`), {
                    "title": this.value
                });
            });
            document.getElementById(`final-jeopardy-question-input`).addEventListener('change', function() {
                this_question.question = this.value;
                board_data_ref['question-infos']['question-1'].question = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-1`), {
                    "question": this.value
                });
            });
            document.getElementById(`final-jeopardy-answer-input`).addEventListener('change', function() {
                this_question.answer = this.value;
                board_data_ref['question-infos']['question-1'].answer = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-1`), {
                    "answer": this.value
                });
            });
            document.getElementById(`final-jeopardy-image-input`).addEventListener('change', function() {
                this_question.imageURL = this.value;
                board_data_ref['question-infos']['question-1']['image-URL'] = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_board.boardIndex}/boards/${boardName_boardNumber[this_board.type]}-${this_board.type}-board/question-infos/question-1`), {
                    "image-URL": this.value
                });
                document.getElementById(`final-jeopardy-image-preview`).src = this_question.imageURL;
            });
            document.getElementById(`final-jeopardy-preview-button`).addEventListener('click', function() {
                updatePreview();
                document.getElementById(`final-jeopardy-edit-container`).style.display = 'none';
                document.getElementById(`final-jeopardy-preview-container`).style.display = 'block';
            });
            document.getElementById(`final-jeopardy-next-button`).addEventListener('click', function() {
                if (!this_question.revealedQuestion) {
                    document.getElementById(`final-jeopardy-questions-text`).className = 'unfade';
                    document.getElementById(`final-jeopardy-preview-image`).className = 'unfade';
                    this.textContent = 'Reveal Answer';
                    this_question.revealedQuestion = true;
                } else if (!this_question.revealedAnswer) {
                    document.getElementById(`final-jeopardy-answer-text`).className = 'unfade';
                    this.textContent = 'Go Home';
                    this_question.revealedAnswer = true;
                } else {
                    document.getElementById(`final-jeopardy-edit-container`).style.display = 'block';
                    document.getElementById(`final-jeopardy-preview-container`).style.display = 'none';
                }
            });
            for (const team_name of ['team-1', 'team-2', 'team-3']) {
                document.getElementById(`final-jeopardy-${team_name}-add-button`).addEventListener('click', function() {
                    document.getElementById(`final-jeopardy-${team_name}-points`).textContent = parseInt(document.getElementById(`final-jeopardy-${team_name}-points`).textContent) + this_question[`${team_name}-wager`];
                });
                document.getElementById(`final-jeopardy-${team_name}-subtract-button`).addEventListener('click', function() {
                    document.getElementById(`final-jeopardy-${team_name}-points`).textContent = parseInt(document.getElementById(`final-jeopardy-${team_name}-points`).textContent) - this_question[`${team_name}-wager`];
                });
                document.getElementById(`final-jeopardy-${team_name}-wager-input`).addEventListener('change', function() {
                    this_question[`${team_name}-wager`] = parseInt(this.value);
                    updateWagerButtons();
                });
            }
            function updatePreview() {
                this_question['team-1-wager'] = 0;
                this_question['team-2-wager'] = 0;
                this_question['team-3-wager'] = 0;
                this_question.revealedQuestion = false;
                this_question.revealedAnswer = false;
                for (const team_name of ['team-1', 'team-2', 'team-3']) {
                    document.getElementById(`final-jeopardy-${team_name}-points`).textContent = '0';
                    document.getElementById(`final-jeopardy-${team_name}-add-button`).textContent = `+${this_question[`${team_name}-wager`]}`;
                    document.getElementById(`final-jeopardy-${team_name}-subtract-button`).textContent = `-${this_question[`${team_name}-wager`]}`;
                }
                document.getElementById(`final-jeopardy-questions-text`).textContent = `Q: ${this_question.question}`;
                document.getElementById(`final-jeopardy-answer-text`).textContent = `A: ${this_question.answer}`;
                document.getElementById(`final-jeopardy-preview-image`).src = this_question.imageURL;
                document.getElementById(`final-jeopardy-questions-text`).className = '';
                document.getElementById(`final-jeopardy-answer-text`).className = '';
                document.getElementById(`final-jeopardy-next-button`).textContent = 'Reveal Question';
                document.getElementById(`final-jeopardy-preview-title`).textContent = this_board.title;
                if (this_question.imageURL === '') document.getElementById(`final-jeopardy-preview-image`).style.display = 'none';
                    else document.getElementById(`final-jeopardy-preview-image`).style.display = 'block';
                document.querySelector(':root').style.setProperty('--background-color', this_question.backgroundColor);
                document.querySelector(':root').style.setProperty('--question-color', this_question.questionColor);
                document.querySelector(':root').style.setProperty('--answer-color', this_question.answerColor);
            }
            function updateWagerButtons() {
                for (const team_name of ['team-1', 'team-2', 'team-3']) {
                    document.getElementById(`final-jeopardy-${team_name}-add-button`).textContent = `+${this_question[`${team_name}-wager`]}`;
                    document.getElementById(`final-jeopardy-${team_name}-subtract-button`).textContent = `-${this_question[`${team_name}-wager`]}`;
                }
            }
        }
    }
    loadForGame(gameSettings) {
        this.boardIndex = gameSettings.gameIndex;
        this.teamNames = [];
        for (const team of gameSettings['teams']) this.teamNames.push(team.name);
        document.querySelector(':root').style.setProperty('--title-color', this.titleColor);
        document.querySelector(':root').style.setProperty('--topic-color', this.topicColor);
        document.querySelector(':root').style.setProperty('--question-board-color', this.questionBoardColor);
        document.querySelector(':root').style.setProperty('--background-color', this.backgroundColor);
        document.querySelector(':root').style.setProperty('--question-color', this.questionColor);
        document.querySelector(':root').style.setProperty('--answer-color', this.answerColor);
        let board_container = document.createElement("div");
        board_container.id = `${this.type}-board-container`;
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            board_container.innerHTML = `
                <div id="${this.type}-title-container">
                    <h1 class="board-title">${this.title}</h1>
                </div>
                <div class="team-order-viewer">
                    ${this.createTeamOrderHTML()}
                </div>
                <div class="game-home-button-container">
                    <button id="${this.type}-home-button">Home</button>
                </div>
                <div class="next-board">
                    <button id="${this.type}-next-board">Next Board</button>
                </div>
            `;
            let table = '<table>';
            let table_headings = '<tr>';
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                table_headings += `<th id="${this.type}-topic-${topic_number}">${this.topicNames[topic_number - 1]}</th>`;
            }
            table_headings += '</tr>';
            table += table_headings;
            for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                let table_row = '<tr>';
                for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    table_row += `<td id="${this.type}-board-question-${question_number}">$${question_info.questionValue}</td>`;
                }
                table_row += '</tr>';
                table += table_row;
            }
            table += '</table>'
            board_container.innerHTML += table;
            document.querySelector(':root').style.setProperty('--table-heading-font-size', `${(window.innerHeight * .99 - 180) / 81}vh`);
            document.querySelector(':root').style.setProperty('--table-element-font-size', `${(window.innerHeight * .99 - 180) / 101}vh`);
            board_container.style.display = 'none';
            document.getElementById('game-container').appendChild(board_container);
            document.getElementById(`${this.type}-team-${user_data.active_games[this.boardIndex]['game-settings']['selected-team']}-selector`).style.color = 'red';
            let question_container = document.createElement("div");
            question_container.id = `${this.type}-questions-container`;
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    question_container.innerHTML += question_info.loadForGame(this.teamNames, this.boardIndex);
                }
            }
            document.getElementById('game-container').appendChild(question_container);
        } else {
            const question_info = this.questionInfos['question-1'];
            board_container.innerHTML = `
                <div id="final-jeopardy-preview-container" class="final-jeopardy-preview-container">
                    <div id="${this.type}-preview-title-container">
                        <h1 id="final-jeopardy-preview-title" class="board-title">${this.title}</h1>
                    </div>
                    <div class="wager-container">
                        <h2>Wagers:</h2>
                        ${this.createWagersInputHTML()}
                    </div>
                    <div class="preview-question-container">
                        <h2 id="final-jeopardy-questions-text">Q: ${question_info.question}</h2>
                    </div>
                    <div class="preview-answer-container">
                        <h2 id="final-jeopardy-answer-text">A: ${question_info.answer}</h2>
                    </div>
                    <div class="preview-image-container">
                        <img id="final-jeopardy-preview-image" src="${question_info.imageURL}" alt="Image"/>
                    </div>
                    <div id="final-jeopardy-team-viewer" class="preview-team-viewer"> 
                        ${this.createHTMLforTeams()}
                    </div>
                    <div class="next-button-container">
                        <button id="final-jeopardy-next-button">Reveal Question</button>
                    </div>
                    <div class="final-jeopardy-game-home-button-container-board">
                        <button id="final-jeopardy-home-button">Home</button>
                    </div>
                    <div class="next-board">
                        <button id="final-jeopardy-next-board">Next Board</button>
                    </div>
                </div>
            `;
            board_container.style.display = 'none';
            board_container.className = 'final-jeopardy-container';
            document.getElementById('game-container').appendChild(board_container);
            if (question_info.imageURL === '') document.getElementById('final-jeopardy-preview-image').style.display = 'none';
            document.getElementById("final-jeopardy-preview-container").style.display = 'block';
        }
        this.attachListnersForGame();
    }
    createTeamOrderHTML() {
        let returned = '<div class="order-1">';
        for (const team_name of this.teamNames) {
            if (this.teamNames.indexOf(team_name) === 3) returned += '</div><div class="order-2">';
            returned += `<h2 id="${this.type}-team-${this.teamNames.indexOf(team_name)}-selector">${this.teamNames.indexOf(team_name) + 1}. ${team_name}</h2>`;
        }
        returned += "</div>";
        return returned;
    }
    createHTMLforTeams() {
        let returned = '';
        for (const team_name of this.teamNames) {
            returned += `
            <div class="team-view-container team-${this.teamNames.indexOf(team_name) + 1}">
                <div class="team-view-team-name">
                    <h2>${team_name}</h2>
                </div>
                <div class="team-view-number-container">
                    <h2 id="final-jeopardy-team-${team_name}-points">0</h2>
                </div>
                <div class="team-view-buttons-container">
                    <button class="add-button" id="final-jeopardy-team-${team_name}-add-button">+</button>
                    <button class="substract-button" id="final-jeopardy-team-${team_name}-subtract-button">-</button>
                </div>
            </div>
            `;
        }
        return returned;
    }
    createWagersInputHTML() {
        let returned = '';
        for (const team_name of this.teamNames) {
            returned += `
                <label for="final-jeopardy-team-${team_name}-wager-input">${team_name}:</label> 
                <input id="final-jeopardy-team-${team_name}-wager-input" class="large-input" min="0" type="number" placeholder="0"/>
            `;
        }
        return returned;
    }
    attachListnersForGame() {
        const this_board = this;
        document.getElementById(`${this.type}-home-button`).addEventListener('click', function() {
            document.getElementById('game-container').innerHTML = '';
            hideScreens('home-container');
        });
        document.getElementById(`${this.type}-next-board`).addEventListener('click', function() {
            document.getElementById(`${this_board.type}-board-container`).style.display = 'none';
            let index = 0;
            if (this_board.type === 'double-jeopardy') index = 1; 
            if (this_board.type === 'final-jeopardy') index = 2;
            for (let i = 0; i < 3; i++) {
                index = (index + 1) % 3;
                const boards = user_data.active_games[this_board.boardIndex].boards;
                if ((boards[Object.keys(boards)[index]] != false) && (user_data.active_games[this_board.boardIndex]['game-settings'][boards[Object.keys(boards)[index]].type] != false)) {
                    const board_type = boards[Object.keys(boards)[index]].type;
                    document.getElementById(`${board_type}-board-container`).style.display = 'block';
                    for (const board_type of ['normal-jeopardy', 'double-jeopardy']) {
                        for (const team_name_index in this_board.teamNames) {
                            if (document.getElementById(`${board_type}-team-${team_name_index}-selector`) === null) continue;
                            document.getElementById(`${board_type}-team-${team_name_index}-selector`).style.color = 'yellow';
                        }
                        const selected_team = user_data.active_games[this_board.boardIndex]['game-settings']['selected-team'];
                        if (document.getElementById(`${board_type}-team-${selected_team}-selector`) === null) continue;
                        document.getElementById(`${board_type}-team-${selected_team}-selector`).style.color = 'red';
                    }
                    break;
                }
            }
            updatePointsFinalJeopardy();
        });
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            for (const team_name of this.teamNames) {
                document.getElementById(`${this.type}-team-${this.teamNames.indexOf(team_name)}-selector`).addEventListener('click', function() {
                    user_data.active_games[this_board.boardIndex]['game-settings']['selected-team'] = this_board.teamNames.indexOf(team_name);
                    for (const team_name_index in this_board.teamNames) {
                        if (document.getElementById(`${this_board.type}-team-${team_name_index}-selector`) === null) continue;
                        document.getElementById(`${this_board.type}-team-${team_name_index}-selector`).style.color = 'yellow';
                    }
                    this.style.color = 'red';
                    update(ref(db, `users/${userId}/active_games/${this_board.boardIndex}/game-settings`), {
                        "selected-team": user_data.active_games[this_board.boardIndex]['game-settings']['selected-team']
                    });
                });
            }
            for (let topic_number = 1; topic_number <= this.topicAmount; topic_number++) {
                for (let question_in_topic_number = 1; question_in_topic_number <= this.questionAmount; question_in_topic_number++) {
                    const question_number = (topic_number - 1) * this.questionAmount + question_in_topic_number;
                    const question_info = this.questionInfos[`question-${question_number}`];
                    question_info.attachListnersForGame();
                }
            }
        } else {
            const this_question = this.questionInfos['question-1'];
            for (const team_name of this_board.teamNames) this_question[`${team_name}-wager`] = 0;
            this_question.revealedQuestion = false;
            this_question.revealedAnswer = false;
            document.getElementById(`final-jeopardy-next-button`).addEventListener('click', function() {
                if (!this_question.revealedQuestion) {
                    document.getElementById(`final-jeopardy-questions-text`).className = 'unfade';
                    document.getElementById(`final-jeopardy-preview-image`).className = 'unfade';
                    this.textContent = 'Reveal Answer';
                    this_question.revealedQuestion = true;
                } else if (!this_question.revealedAnswer) {
                    document.getElementById(`final-jeopardy-answer-text`).className = 'unfade';
                    this.style.display = 'none';
                    this_question.revealedAnswer = true;
                } 
            });
            for (const team_name of this.teamNames) {
                document.getElementById(`final-jeopardy-team-${team_name}-add-button`).addEventListener('click', function() {
                    document.getElementById(`final-jeopardy-team-${team_name}-points`).textContent = parseInt(document.getElementById(`final-jeopardy-team-${team_name}-points`).textContent) + this_question[`${team_name}-wager`];
                    user_data.active_games[this_board.boardIndex]['game-settings']['teams'][this_board.teamNames.indexOf(team_name)].score += this_question[`${team_name}-wager`];
                    update(ref(db, `users/${userId}/active_games/${this_board.boardIndex}/game-settings/teams/${this_board.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_board.boardIndex]['game-settings']['teams'][this_board.teamNames.indexOf(team_name)].score
                    });
                });
                document.getElementById(`final-jeopardy-team-${team_name}-subtract-button`).addEventListener('click', function() {
                    document.getElementById(`final-jeopardy-team-${team_name}-points`).textContent = parseInt(document.getElementById(`final-jeopardy-team-${team_name}-points`).textContent) - this_question[`${team_name}-wager`];
                    user_data.active_games[this_board.boardIndex]['game-settings']['teams'][this_board.teamNames.indexOf(team_name)].score -= this_question[`${team_name}-wager`];
                    update(ref(db, `users/${userId}/active_games/${this_board.boardIndex}/game-settings/teams/${this_board.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_board.boardIndex]['game-settings']['teams'][this_board.teamNames.indexOf(team_name)].score
                    });
                });
                document.getElementById(`final-jeopardy-team-${team_name}-wager-input`).addEventListener('change', function() {
                    this_question[`${team_name}-wager`] = parseInt(this.value);
                    updateWagerButtons();
                });
            }
            function updateWagerButtons() {
                for (const team_name of this_board.teamNames) {
                    document.getElementById(`final-jeopardy-team-${team_name}-add-button`).textContent = `+${this_question[`${team_name}-wager`]}`;
                    document.getElementById(`final-jeopardy-team-${team_name}-subtract-button`).textContent = `-${this_question[`${team_name}-wager`]}`;
                }
            }
        }
        function updatePointsFinalJeopardy() {
            for (const team_name of this_board.teamNames) {
                document.getElementById(`final-jeopardy-team-${team_name}-points`).textContent = user_data.active_games[this_board.boardIndex]['game-settings']['teams'][this_board.teamNames.indexOf(team_name)]['score'];
            }
        }
    }
    exportQuestionInfos() {
        let exported_question_infos = {};
        for (const question_key of Object.keys(this.questionInfos)) {
            const question = this.questionInfos[question_key];
            exported_question_infos[question_key] = question.export();
        }
        return exported_question_infos;
    }
    export() {
        return {
            'title': this.title,
            'type': this.type,
            'title-color': this.titleColor,
            'topic-color': this.topicColor,
            'question-board-color': this.questionBoardColor,
            'background-color': this.backgroundColor,
            'answer-color': this.answerColor,
            'question-color': this.questionColor,
            'images-allowed': this.imagesAllowed,
            'key-reveal-answer': this.keyRevealAnswer,
            'key-go-home': this.keyGoHome,
            'board-m': this.m,
            'board-b': this.b,
            'topic-amount': this.topicAmount,
            'question-amount': this.questionAmount,
            'topic-names': this.topicNames,
            'timer-delay': this.timerDelay,
            'timer-length-normal': this.timerLengthNormal,
            'timer-length-daily-double': this.timerLengthDailyDouble,
            'board-index': this.boardIndex,
            'question-infos': this.exportQuestionInfos()
        };
    }
}

class Question {
    constructor(object, loadFromSettings = true) {
        if (loadFromSettings) {
            this.loadFromSettings(object);
        } else {
            this.loadFromExport(object);
        }
    }
    loadFromSettings(object) {
        this.boardType = object.board_type;
        this.questionValue = object.question_value;
        this.questionNumber = object.question_number;
        this.backgroundColor = object.background_color;
        this.answerColor = object.answer_color;
        this.questionColor = object.question_color;
        this.imagesAllowed = object.images_allowed;
        this.keyRevealAnswer = object.key_reveal_answer;
        this.keyGoHome = object.key_go_home;
        this.topicNumber = object.topic_number;
        this.questionInTopicNumber = object.question_in_topic_number;
        this.timerDelay = object.timer_delay;
        this.timerLengthNormal = object.timer_length_normal;
        this.timerLengthDailyDouble = object.timer_length_daily_double;
        this.dailyDouble = false;
        this.boardIndex = object.board_index;
        this.faded = false;
        this.imageURL = '';
        this.question = 'Enter question here';
        this.answer = 'Enter answer here';
        this.title = `Topic ${this.topicNumber} $${this.questionValue} Question`;
    }
    loadFromExport(question_export) {
        this.boardType = question_export['board-type'];
        this.questionValue = question_export['question-value'];
        this.questionNumber = question_export['question-number'];
        this.backgroundColor = question_export['background-color'];
        this.answerColor = question_export['answer-color'];
        this.questionColor = question_export['question-color'];
        this.imagesAllowed = question_export['images-allowed'];
        this.keyRevealAnswer = question_export['key-reveal-answer'];
        this.keyGoHome = question_export['key-go-home'];
        this.topicNumber = question_export['topic-number'];
        this.questionInTopicNumber = question_export['question-in-topic-number'];
        this.faded = question_export['faded'];
        this.imageURL = question_export['image-URL'];
        this.question = question_export['question'];
        this.answer = question_export['answer'];
        this.title = question_export['title'];
        this.timerDelay = question_export['timer-delay'];
        this.timerLengthNormal = question_export['timer-length-normal'];
        this.timerLengthDailyDouble = question_export['timer-length-daily-double'];
        this.dailyDouble = question_export['daily-double'];
        this.boardIndex = question_export['board-index'];
    }
    loadForEditing() {
        return `
            <div id="${this.boardType}-question-${this.questionNumber}-container" class="question-container">
                <div id="${this.boardType}-normal-question-${this.questionNumber}-edit-container" class="normal-question-edit-container">
                    <h1 id="${this.boardType}-normal-question-${this.questionNumber}-title">${this.title}</h1>
                    <div class="preview-button-container">
                        <button id="${this.boardType}-preview-normal-question-${this.questionNumber}-button">Preview</button>
                    </div>
                    <div class="timers-container">
                        <div class="timer-delay-container">
                            <label>Timer delay:</label>
                            <input id="${this.boardType}-normal-timer-delay-${this.questionNumber}-input" class="large-input" type="number" value="${this.timerDelay}"/>
                        </div>
                        <div class="timer-length-container">
                            <label>Timer:</label>
                            <input id="${this.boardType}-normal-timer-${this.questionNumber}-input" type="number" value="${this.timerLengthNormal}"/>
                        </div>
                    </div>
                    <div class="question-input-container">
                        <label>Q:</label>
                        <input id="${this.boardType}-normal-question-${this.questionNumber}-input" type="text" placeholder="Enter question here" value="${this.question != 'Enter question here' ? this.question : ''}"/>
                    </div>
                    <div class="answer-input-container">
                        <label>A:</label>
                        <input id="${this.boardType}-normal-answer-${this.questionNumber}-input" type="text" placeholder="Enter answer here" value="${this.answer != 'Enter answer here' ? this.answer : ''}"/>
                    </div>
                    <div class="image-input-container">
                        <div>
                            <label>Image URL:</label>
                            <input id="${this.boardType}-normal-image-${this.questionNumber}-input" type="text" value="${this.imageURL}"/>
                        </div>
                        <div>
                            <img id="${this.boardType}-normal-image-${this.questionNumber}-preview" src="${this.imageURL}" alt="Image Preview"/>
                        </div>
                    </div>
                    <div class="make-daily-double-button-container">
                        <button id="${this.boardType}-make-daily-double-${this.questionNumber}-button">Make Daily Double</button>
                    </div>
                    <div class="home-button-container">
                        <button id="${this.boardType}-home-normal-${this.questionNumber}-button">Home</button>
                    </div>
                </div>
                <div id="${this.boardType}-daily-double-question-${this.questionNumber}-edit-container" class="daily-double-question-edit-container">
                    <h1 id="${this.boardType}-daily-double-question-${this.questionNumber}-title">${this.title}</h1>
                    <div class="preview-button-container">
                        <button id="${this.boardType}-preview-daily-double-question-${this.questionNumber}-button">Preview</button>
                    </div>
                    <div class="timers-container">
                        <div class="timer-delay-container">
                            <label>Timer delay:</label>
                            <input id="${this.boardType}-daily-double-timer-delay-${this.questionNumber}-input" class="large-input" type="number" value="${this.timerDelay}"/>
                        </div>
                        <div class="timer-length-container">
                            <label>Timer:</label>
                            <input id="${this.boardType}-daily-double-timer-${this.questionNumber}-input" type="number" value="${this.timerLengthDailyDouble}"/>
                        </div>
                    </div>
                    <div>
                        <h2>Daily Double!</h2>
                    </div>
                    <div class="question-input-container">
                        <label>Q:</label>
                        <input id="${this.boardType}-daily-double-question-${this.questionNumber}-input" type="text" placeholder="Enter question here" value="${this.question != 'Enter question here' ? this.question : ''}"/>
                    </div>
                    <div class="answer-input-container">
                        <label>A:</label>
                        <input id="${this.boardType}-daily-double-answer-${this.questionNumber}-input" type="text" placeholder="Enter answer here" value="${this.answer != 'Enter answer here' ? this.answer : ''}"/>
                    </div>
                    <div class="image-input-container">
                        <div>
                            <label>Image URL:</label>
                            <input id="${this.boardType}-daily-double-image-${this.questionNumber}-input" type="text" value="${this.imageURL}"/>
                        </div>
                        <div>
                            <img id="${this.boardType}-daily-double-image-${this.questionNumber}-preview" src="${this.imageURL}" alt="Image Preview"/>
                        </div>
                    </div>
                    <div class="unmake-daily-double-button-container">
                        <button id="${this.boardType}-unmake-daily-double-${this.questionNumber}-button">Unmake Daily Double</button>
                    </div>
                    <div class="home-button-container">
                        <button id="${this.boardType}-home-daily-double-${this.questionNumber}-button">Home</button>
                    </div>
                </div>
                <div id="${this.boardType}-normal-question-${this.questionNumber}-preview-container" class="normal-question-preview-container">
                    <h1 id="${this.boardType}-normal-question-${this.questionNumber}-preview-title">${this.title}</h1>
                    <div class="timer-container">
                        <div class="timer-number-container">
                            <h2 id="${this.boardType}-normal-question-${this.questionNumber}-timer-text">00:30</h2>
                        </div>
                        <div class="timer-buttons-container">
                            <button class="start-stop-button" id="${this.boardType}-normal-question-${this.questionNumber}-start-stop-button">Start</button>
                            <button class="reset-button" id="${this.boardType}-normal-question-${this.questionNumber}-reset-button">Reset</button>
                        </div>
                    </div>
                    <div class="preview-question-container">
                        <h2 id="${this.boardType}-normal-question-${this.questionNumber}-preview-questions-text">Q: ${this.question}</h2>
                    </div>
                    <div class="preview-answer-container">
                        <h2 id="${this.boardType}-normal-question-${this.questionNumber}-preview-answer-text">A: ${this.answer}</h2>
                    </div>
                    <div class="preview-image-container">
                        <img id="${this.boardType}-normal-image-${this.questionNumber}-image-preview" src="${this.imageURL}" alt="Image"/>
                    </div>
                    <div class="next-button-container">
                        <button id="${this.boardType}-next-normal-${this.questionNumber}-button">Reveal Answer</button>
                    </div>
                    <div id="${this.boardType}-normal-question-${this.questionNumber}-team-viewer" class="preview-team-viewer">
                        <div class="team-view-container team-1">
                            <div class="team-view-team-name">
                                <h2>Team 1</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-normal-question-${this.questionNumber}-team-1-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-1-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-1-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-2 selected-team">
                            <div class="team-view-team-name">
                                <h2>Team 2</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-normal-question-${this.questionNumber}-team-2-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-2-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-2-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-3">
                            <div class="team-view-team-name">
                                <h2>Team 3</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-normal-question-${this.questionNumber}-team-3-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-3-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-normal-question-${this.questionNumber}-team-3-subtract-button">-</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-container" class="daily-double-question-preview-container">
                    <h1 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-title">Daily double!</h1>
                    <div class="timer-container">
                        <div class="timer-number-container">
                            <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-timer-text">01:00</h2>
                        </div>
                        <div class="timer-buttons-container">
                            <button class="start-stop-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-start-stop-button">Start</button>
                            <button class="reset-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-reset-button">Reset</button>
                        </div>
                    </div>
                    <div class="wager-container">
                        <label>Wager:</label>
                        <input id="${this.boardType}-daily-double-wager-question-${this.questionNumber}-input" type="number" placeholder="0 - 1000..."/>
                    </div>
                    <div class="preview-question-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-questions-text">Q: ${this.question}</h2>
                    </div>
                    <div class="preview-answer-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-answer-text">A: ${this.answer}</h2>
                    </div>
                    <div class="preview-image-container">
                        <img id="${this.boardType}-daily-double-image-${this.questionNumber}-image-preview" src="${this.imageURL}" alt="Image"/>
                    </div>
                    <div id="${this.boardType}-daily-double-question-${this.questionNumber}-team-viewer" class="preview-team-viewer">
                        <div class="team-view-container team-1">
                            <div class="team-view-team-name">
                                <h2>Team 1</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-team-1-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-1-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-1-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-2 selected-team">
                            <div class="team-view-team-name">
                                <h2>Team 2</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-team-2-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-2-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-2-subtract-button">-</button>
                            </div>
                        </div>
                        <div class="team-view-container team-3">
                            <div class="team-view-team-name">
                                <h2>Team 3</h2>
                            </div>
                            <div class="team-view-number-container">
                                <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-team-3-points">0</h2>
                            </div>
                            <div class="team-view-buttons-container">
                                <button class="add-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-3-add-button">+</button>
                                <button class="substract-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-team-3-subtract-button">-</button>
                            </div>
                        </div>
                    </div>
                    <div class="next-button-container">
                        <button id="${this.boardType}-next-daily-double-${this.questionNumber}-button">Reveal Question</button>
                    </div>
                </div>
            </div>
        `;
    }
    attachListnersForEditing() {
        this.editingText = false;
        this.showingDailyDoubles = false;
        this.revealedQuestion = false;
        this.revealedAnswer = false;
        this.secondsLeft = copy(this.timerLengthNormal);
        this.wager = 0;
        this.timerInterval = '';
        this.timerGoing = false;
        const this_question = this;
        let question_data_ref = user_data.game_boards[this.boardIndex].boards[`${boardName_boardNumber[this.boardType]}-${this.boardType}-board`]['question-infos'][`question-${this.questionNumber}`];
        document.getElementById(`${this.boardType}-board-question-${this.questionNumber}`).addEventListener('click', function() {
            if (this_question.editingText) return;
            document.getElementById(`${this_question.boardType}-board-container`).style.display = 'none';
            document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'block';
            if (this_question.dailyDouble) {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
            } else {
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
            }
            updateQuestionEdit();
        });
        for (const question_type of ['normal', 'daily-double']) {
            if (!this.imagesAllowed) {
                document.getElementById(`${this.boardType}-${question_type}-image-${this.questionNumber}-input`).style.display = 'none';
                document.getElementById(`${this.boardType}-${question_type}-image-${this.questionNumber}-preview`).style.display = 'none';
            }
            for (const team_name of ['team-1', 'team-2', 'team-3']) {
                document.getElementById(`${this.boardType}-${question_type}-question-${this.questionNumber}-${team_name}-add-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent) + this_question.wager;
                });
                document.getElementById(`${this.boardType}-${question_type}-question-${this.questionNumber}-${team_name}-subtract-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent) - this_question.wager;
                });
            }
            document.getElementById(`${this.boardType}-home-${question_type}-${this.questionNumber}-button`).addEventListener('click', function() {
                document.getElementById(`${this_question.boardType}-board-container`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
                document.removeEventListener("keydown", keyPress);
            });
            document.getElementById(`${this.boardType}-${question_type}-timer-delay-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.timerDelay = parseInt(this.value);
                question_data_ref['timer-delay'] = parseInt(this.value);
                update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                    "timer-delay": parseInt(this.value)
                });
            });
            document.getElementById(`${this.boardType}-${question_type}-question-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.question = this.value;
                question_data_ref.question = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                    "question": this.value
                });
            });
            document.getElementById(`${this.boardType}-${question_type}-answer-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.answer = this.value;
                question_data_ref.answer = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                    "answer": this.value
                });
            });
            document.getElementById(`${this.boardType}-${question_type}-image-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.imageURL = this.value;
                question_data_ref['image-URL'] = this.value;
                update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                    "image-URL": this.value
                });
                document.getElementById(`${this_question.boardType}-${question_type}-image-${this_question.questionNumber}-preview`).src = this_question.imageURL;
            });
            document.getElementById(`${this.boardType}-preview-${question_type}-question-${this.questionNumber}-button`).addEventListener('click', function() {
                updatePreview();
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-container`).style.display = 'block';
                document.addEventListener("keydown", keyPress, {'once': true});
            });
            document.getElementById(`${this.boardType}-${question_type}-question-${this.questionNumber}-start-stop-button`).addEventListener('click', function() {
                if (this_question.timerGoing) {
                    this.textContent = 'Start';
                    this_question.timerGoing = false;
                    clearInterval(this_question.timerInterval);
                } else {
                    if (this_question.secondsLeft <= 0) return;
                    this.textContent = 'Stop';
                    this_question.timerGoing = true;
                    this_question.timerInterval = setInterval(() => {
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                        this_question.secondsLeft--;
                        updateTimer();
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                    }, 1000);
                }
            });
        }
        document.getElementById(`${this.boardType}-normal-timer-${this.questionNumber}-input`).addEventListener('change', function() {
            this_question.timerLengthNormal = parseInt(this.value);
            question_data_ref['timer-length-normal'] = parseInt(this.value);
            update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                "timer-length-normal": parseInt(this.value)
            });
        });
        document.getElementById(`${this.boardType}-daily-double-timer-${this.questionNumber}-input`).addEventListener('change', function() {
            this_question.timerLengthDailyDouble = parseInt(this.value);
            question_data_ref['timer-length-daily-double'] = parseInt(this.value);
            update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                "timer-length-daily-double": parseInt(this.value)
            });
        });
        document.getElementById(`${this.boardType}-make-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
            this_question.dailyDouble = true;
            question_data_ref['daily-double'] = true;
            update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                "daily-double": true
            });
            updateQuestionEdit();
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
            if (this_question.showingDailyDoubles) document.getElementById(`${this_question.boardType}-board-question-${this_question.questionNumber}`).style.backgroundColor = 'red';
        });
        document.getElementById(`${this.boardType}-unmake-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
            this_question.dailyDouble = false;
            question_data_ref['daily-double'] = false;
            update(ref(db, `users/${userId}/game_boards/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                "daily-double": false
            });
            updateQuestionEdit();
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
            if (this_question.showingDailyDoubles) document.getElementById(`${this_question.boardType}-board-question-${this_question.questionNumber}`).style.backgroundColor = this_question.backgroundColor;
        });
        document.getElementById(`${this.boardType}-daily-double-wager-question-${this.questionNumber}-input`).addEventListener('change', function() {
            this_question.wager = parseInt(this.value);
            for (const team_name of ['team-1', 'team-2', 'team-3']) {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-add-button`).textContent = `+${this_question.wager}`;
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-subtract-button`).textContent = `-${this_question.wager}`;
            }
        });
        document.getElementById(`${this.boardType}-next-normal-${this.questionNumber}-button`).addEventListener('click', function() {
            if (this_question.revealedAnswer) {
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
            }
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-answer-text`).className = 'unfade';
            this.textContent = 'Go Home';
            this_question.timerGoing = false;
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
            clearInterval(this_question.timerInterval);
            this_question.revealedAnswer = true;
        });
        document.getElementById(`${this.boardType}-next-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
            if (!this_question.revealedQuestion) {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-questions-text`).className = 'unfade';
                this.textContent = 'Reveal Answer';
                this_question.revealedQuestion = true;
                setTimeout(() => {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).click();
                }, 1000 * this_question.timerDelay);
            } else if (!this_question.revealedAnswer) {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-answer-text`).className = 'unfade';
                this.textContent = 'Go Home';
                this_question.timerGoing = false;
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                clearInterval(this_question.timerInterval);
                this_question.revealedAnswer = true;
            } else {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
            }
        });
        document.getElementById(`${this.boardType}-normal-question-${this.questionNumber}-reset-button`).addEventListener('click', function() {
            clearInterval(this_question.timerInterval);
            this_question.timerGoing = false;
            this_question.secondsLeft = copy(this_question.timerLengthNormal);
            updateTimer();
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
        });
        document.getElementById(`${this.boardType}-daily-double-question-${this.questionNumber}-reset-button`).addEventListener('click', function() {
            clearInterval(this_question.timerInterval);
            this_question.timerGoing = false;
            this_question.secondsLeft = copy(this_question.timerLengthDailyDouble);
            updateTimer();
            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
        });
        function keyPress(e) {
            //frist see if this should be still active
            if (document.getElementById(`${this_question.boardType}-board-question-${this_question.questionNumber}`) === null) return;
            //then find out which you key you are supposed to be looking for
            let pressedKey = String(e.key);
            if (this_question.dailyDouble) {
                if ((this_question.revealedAnswer === false) && (pressedKey === this_question.keyRevealAnswer))
                    document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).click();
                else if ((this_question.revealedAnswer === true) && (pressedKey === this_question.keyGoHome))  
                    document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).click();
            } else {
                if ((this_question.revealedAnswer === false) && (pressedKey === this_question.keyRevealAnswer))
                    document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).click();
                else if ((this_question.revealedAnswer === true) && (pressedKey === this_question.keyGoHome))  
                    document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).click();
            }
            document.addEventListener("keydown", keyPress, {'once': true});
        }
        function updateQuestionEdit() {
            document.getElementById(`${this_question.boardType}-normal-timer-${this_question.questionNumber}-input`).value = this_question.timerLengthNormal;
            document.getElementById(`${this_question.boardType}-daily-double-timer-${this_question.questionNumber}-input`).value = this_question.timerLengthDailyDouble;
            for (const question_type of ['normal', 'daily-double']) {
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-title`).textContent = this_question.title;
                document.getElementById(`${this_question.boardType}-${question_type}-timer-delay-${this_question.questionNumber}-input`).value = this_question.timerDelay;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-input`).value = this_question.question != 'Enter question here' ? this_question.question : '';
                document.getElementById(`${this_question.boardType}-${question_type}-answer-${this_question.questionNumber}-input`).value = this_question.answer != 'Enter answer here' ? this_question.answer : '';
                document.getElementById(`${this_question.boardType}-${question_type}-image-${this_question.questionNumber}-input`).value = this_question.imageURL;
                document.getElementById(`${this_question.boardType}-${question_type}-image-${this_question.questionNumber}-preview`).src = this_question.imageURL;
            }
        }
        function updatePreview() {
            clearInterval(this_question.timerInterval);
            if (this_question.dailyDouble) this_question.wager = 0;
                else this_question.wager = copy(this_question.questionValue);
            for (const question_type of ['normal', 'daily-double']) {
                for (const team_name of ['team-1', 'team-2', 'team-3']) {
                    document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent = '0';
                    document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-add-button`).textContent = `+${this_question.wager}`;
                    document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-subtract-button`).textContent = `-${this_question.wager}`;
                }
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-answer-text`).className = '';
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-questions-text`).textContent = `Q: ${this_question.question}`;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-answer-text`).textContent = `A: ${this_question.answer}`;
                document.getElementById(`${this_question.boardType}-${question_type}-image-${this_question.questionNumber}-image-preview`).src = this_question.imageURL;
            }
            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-questions-text`).className = '';
            document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).textContent = 'Reveal Answer';
            document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).textContent = 'Reveal Question';
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-title`).textContent = this_question.title;
            if (this_question.imageURL === '') {
                document.getElementById(`${this_question.boardType}-normal-image-${this_question.questionNumber}-image-preview`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-daily-double-image-${this_question.questionNumber}-image-preview`).style.display = 'none';
            } else {
                document.getElementById(`${this_question.boardType}-daily-double-image-${this_question.questionNumber}-image-preview`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-normal-image-${this_question.questionNumber}-image-preview`).style.display = 'block';
            }
            if (this_question.dailyDouble) this_question.secondsLeft = copy(this_question.timerLengthDailyDouble);
                else this_question.secondsLeft = copy(this_question.timerLengthNormal);
            updateTimer();
            if (!this_question.dailyDouble) setTimeout(() => {
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).click();
            }, this_question.timerDelay * 1000);
            document.querySelector(':root').style.setProperty('--background-color', this_question.backgroundColor);
            document.querySelector(':root').style.setProperty('--question-color', this_question.questionColor);
            document.querySelector(':root').style.setProperty('--answer-color', this_question.answerColor);
            this_question.revealedAnswer = false;
            this_question.revealedQuestion = false;
            this_question.timerGoing = false;
        }
        function updateTimer() {
            let mintues = Math.floor(this_question.secondsLeft / 60);
            let seconds = Math.floor(this_question.secondsLeft - mintues * 60);
            if (seconds < 0) seconds = 0;
            mintues = mintues >= 10 ? `${mintues}` : `0${mintues}`;
            seconds = seconds >= 10 ? `${seconds}` : `0${seconds}`;
            if (this_question.dailyDouble) document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-timer-text`).textContent = `${mintues}:${seconds}`;
                else document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-timer-text`).textContent = `${mintues}:${seconds}`;
        }
    }
    loadForGame(team_names, gameIndex) {
        this.teamNames = team_names;
        this.boardIndex = gameIndex;
        if (this.faded) document.getElementById(`${this.boardType}-board-question-${this.questionNumber}`).className = 'opened-question';
        if (this.dailyDouble) {
            return `
                <div id="${this.boardType}-question-${this.questionNumber}-container" class="question-container">
                    <div id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-container" class="daily-double-question-preview-container">
                        <h1 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-title">Daily double!</h1>
                        <div class="timer-container">
                            <div class="timer-number-container">
                                <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-timer-text">01:00</h2>
                            </div>
                            <div class="timer-buttons-container">
                                <button class="start-stop-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-start-stop-button">Start</button>
                                <button class="reset-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-reset-button">Reset</button>
                            </div>
                        </div>
                        <div class="wager-container">
                            <label for="${this.boardType}-daily-double-wager-question-${this.questionNumber}-input">Wager:</label>
                            <input id="${this.boardType}-daily-double-wager-question-${this.questionNumber}-input" type="number" placeholder="0 - 1000..."/>
                        </div>
                        <div class="preview-question-container">
                            <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-questions-text">Q: ${this.question}</h2>
                        </div>
                        <div class="preview-answer-container">
                            <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-answer-text">A: ${this.answer}</h2>
                        </div>
                        <div class="preview-image-container">
                            <img id="${this.boardType}-daily-double-image-${this.questionNumber}-image-preview" src="${this.imageURL}" alt="Image"/>
                        </div>
                        <div class="game-next-button-container">
                            <button id="${this.boardType}-next-daily-double-${this.questionNumber}-button">Reveal Question</button>
                        </div>
                        <div class="question-home-button-container">
                            <button id="${this.boardType}-home-daily-double-${this.questionNumber}-button">Board</button>
                        </div>
                        <div id="${this.boardType}-daily-double-question-${this.questionNumber}-team-viewer" class="preview-team-viewer">
                            ${this.createHTMLforTeams()}
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div id="${this.boardType}-question-${this.questionNumber}-container" class="question-container">
                    <div id="${this.boardType}-normal-question-${this.questionNumber}-preview-container" class="normal-question-preview-container">
                        <h1 id="${this.boardType}-normal-question-${this.questionNumber}-preview-title">${this.title}</h1>
                        <div class="timer-container">
                            <div class="timer-number-container">
                                <h2 id="${this.boardType}-normal-question-${this.questionNumber}-timer-text">00:30</h2>
                            </div>
                            <div class="timer-buttons-container">
                                <button class="start-stop-button" id="${this.boardType}-normal-question-${this.questionNumber}-start-stop-button">Start</button>
                                <button class="reset-button" id="${this.boardType}-normal-question-${this.questionNumber}-reset-button">Reset</button>
                            </div>
                        </div>
                        <div class="preview-question-container">
                            <h2 id="${this.boardType}-normal-question-${this.questionNumber}-preview-questions-text">Q: ${this.question}</h2>
                        </div>
                        <div class="preview-answer-container">
                            <h2 id="${this.boardType}-normal-question-${this.questionNumber}-preview-answer-text">A: ${this.answer}</h2>
                        </div>
                        <div class="preview-image-container">
                            <img id="${this.boardType}-normal-image-${this.questionNumber}-image-preview" src="${this.imageURL}" alt="Image"/>
                        </div>
                        <div class="game-next-button-container">
                            <button id="${this.boardType}-next-normal-${this.questionNumber}-button">Reveal Answer</button>
                        </div>
                        <div class="question-home-button-container">
                            <button id="${this.boardType}-home-normal-${this.questionNumber}-button">Board</button>
                        </div>
                        <div id="${this.boardType}-normal-question-${this.questionNumber}-team-viewer" class="preview-team-viewer">
                            ${this.createHTMLforTeams()}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    createHTMLforTeams() {
        let returned = '';
        if (this.dailyDouble) {
            for (const team_name of this.teamNames) {
                returned += `
                <div id="${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-container" class="team-view-container team-${this.teamNames.indexOf(team_name) + 1}">
                    <div class="team-view-team-name">
                        <h2>${team_name}</h2>
                    </div>
                    <div class="team-view-number-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-points">0</h2>
                    </div>
                    <div class="team-view-buttons-container">
                        <button class="add-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-add-button">+</button>
                        <button class="substract-button" id="${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-subtract-button">-</button>
                    </div>
                </div>
                `;
            }
        } else {
            for (const team_name of this.teamNames) {
                returned += `
                <div id="${this.boardType}-normal-question-${this.questionNumber}-${team_name}-container" class="team-view-container team-${this.teamNames.indexOf(team_name) + 1}">
                    <div class="team-view-team-name">
                        <h2>${team_name}</h2>
                    </div>
                    <div class="team-view-number-container">
                        <h2 id="${this.boardType}-normal-question-${this.questionNumber}-${team_name}-points">0</h2>
                    </div>
                    <div class="team-view-buttons-container">
                        <button class="add-button" id="${this.boardType}-normal-question-${this.questionNumber}-${team_name}-add-button">+</button>
                        <button class="substract-button" id="${this.boardType}-normal-question-${this.questionNumber}-${team_name}-subtract-button">-</button>
                    </div>
                </div>
                `;
            }
        }
        return returned;
    }
    attachListnersForGame() {
        this.revealedQuestion = false;
        this.revealedAnswer = false;
        this.secondsLeft = copy(this.timerLengthNormal);
        this.wager = 0;
        this.timerInterval = '';
        this.timerGoing = false;
        const this_question = this;
        let question_data_ref = user_data.active_games[this.boardIndex].boards[`${boardName_boardNumber[this.boardType]}-${this.boardType}-board`]['question-infos'][`question-${this.questionNumber}`];
        document.getElementById(`${this.boardType}-board-question-${this.questionNumber}`).addEventListener('click', function() {
            // for (const object of document.getElementsByClassName('fade')) {
            //     if (!object.id.includes('board-question')) continue;
            //     object.className = 'already-faded';
            // }
            if (this_question.faded && !(user_data.active_games[this_question.boardIndex]['game-settings']['old-questions-clicked'])) return;
            document.getElementById(`${this_question.boardType}-board-container`).style.display = 'none';
            document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'block';
            if (this_question.dailyDouble) {
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-container`).style.display = 'block';
            } else {
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-container`).style.display = 'block';
            }
            this.className = 'opened-question';
            this_question.faded = true;
            question_data_ref.faded = true;
            update(ref(db, `users/${userId}/active_games/${this_question.boardIndex}/boards/${boardName_boardNumber[this_question.boardType]}-${this_question.boardType}-board/question-infos/question-${this_question.questionNumber}`), {
                "faded": true
            });
            document.addEventListener("keydown", keyPress, {'once': true});
            updateQuestionEdit();
        });
        if (this.dailyDouble) {
            if (this.imageURL === '') document.getElementById(`${this.boardType}-daily-double-image-${this.questionNumber}-image-preview`).style.display = 'none';
            document.getElementById(`${this.boardType}-home-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
                document.getElementById(`${this_question.boardType}-board-container`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
                document.removeEventListener("keydown", keyPress);
                this_question.updateSelectedTeam();
            });
            document.getElementById(`${this.boardType}-daily-double-question-${this.questionNumber}-start-stop-button`).addEventListener('click', function() {
                if (this_question.timerGoing) {
                    this.textContent = 'Start';
                    this_question.timerGoing = false;
                    clearInterval(this_question.timerInterval);
                } else {
                    if (this_question.secondsLeft <= 0) return;
                    this.textContent = 'Stop';
                    this_question.timerGoing = true;
                    this_question.timerInterval = setInterval(() => {
                        if (document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`) === null) return clearInterval(this_question.timerInterval);
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                        this_question.secondsLeft--;
                        updateTimer();
                        if (document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`) === null) return clearInterval(this_question.timerInterval);
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                    }, 1000);
                }
            });
            document.getElementById(`${this.boardType}-daily-double-wager-question-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.wager = parseInt(this.value);
                for (const team_name of this_question.teamNames) {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-add-button`).textContent = `+${this_question.wager}`;
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-subtract-button`).textContent = `-${this_question.wager}`;
                }
            });
            document.getElementById(`${this.boardType}-next-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
                if (!this_question.revealedQuestion) {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-questions-text`).className = 'unfade';
                    document.getElementById(`${this_question.boardType}-daily-double-image-${this_question.questionNumber}-image-preview`).className = 'unfade';
                    this.textContent = 'Reveal Answer';
                    this_question.revealedQuestion = true;
                    setTimeout(() => {
                        document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).click();
                    }, 1000 * this_question.timerDelay);
                } else if (!this_question.revealedAnswer) {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-answer-text`).className = 'unfade';
                    this.textContent = 'Board';
                    this_question.timerGoing = false;
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                    clearInterval(this_question.timerInterval);
                    this_question.revealedAnswer = true;
                } else {
                    this_question.updateSelectedTeam();
                    document.getElementById(`${this_question.boardType}-board-container`).style.display = 'block';
                    document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'none';
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
                    document.removeEventListener("keydown", keyPress);
                }
            });
            document.getElementById(`${this.boardType}-daily-double-question-${this.questionNumber}-reset-button`).addEventListener('click', function() {
                clearInterval(this_question.timerInterval);
                this_question.timerGoing = false;
                this_question.secondsLeft = copy(this_question.timerLengthDailyDouble);
                updateTimer();
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
            });
            for (const team_name of this.teamNames) {
                document.getElementById(`${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-add-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-points`).textContent) + this_question.wager;
                    user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score += this_question.wager;
                    update(ref(db, `users/${userId}/active_games/${this_question.boardIndex}/game-settings/teams/${this_question.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score
                    });
                });
                document.getElementById(`${this.boardType}-daily-double-question-${this.questionNumber}-${team_name}-subtract-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-${team_name}-points`).textContent) - this_question.wager;
                    user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score -= this_question.wager;
                    update(ref(db, `users/${userId}/active_games/${this_question.boardIndex}/game-settings/teams/${this_question.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score
                    });
                });
            }
        } else {
            if (this.imageURL === '') document.getElementById(`${this.boardType}-normal-image-${this.questionNumber}-image-preview`).style.display = 'none';
            document.getElementById(`${this.boardType}-home-normal-${this.questionNumber}-button`).addEventListener('click', function() {
                document.getElementById(`${this_question.boardType}-board-container`).style.display = 'block';
                document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
                document.removeEventListener("keydown", keyPress);
                this_question.updateSelectedTeam();
            });
            document.getElementById(`${this.boardType}-normal-question-${this.questionNumber}-start-stop-button`).addEventListener('click', function() {
                if (this_question.timerGoing) {
                    this.textContent = 'Start';
                    this_question.timerGoing = false;
                    clearInterval(this_question.timerInterval);
                } else {
                    if (this_question.secondsLeft <= 0) return;
                    this.textContent = 'Stop';
                    this_question.timerGoing = true;
                    this_question.timerInterval = setInterval(() => {
                        if (document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`) === null) return clearInterval(this_question.timerInterval);
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                        this_question.secondsLeft--;
                        updateTimer();
                        if (document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`) === null) return clearInterval(this_question.timerInterval);
                        if (this_question.secondsLeft <= 0) {
                            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                            clearInterval(this_question.timerInterval);
                        }
                    }, 1000);
                }
            });
            document.getElementById(`${this.boardType}-next-normal-${this.questionNumber}-button`).addEventListener('click', function() {
                if (this_question.revealedAnswer) {
                    document.getElementById(`${this_question.boardType}-board-container`).style.display = 'block';
                    document.getElementById(`${this_question.boardType}-question-${this_question.questionNumber}-container`).style.display = 'none';
                    document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-container`).style.display = 'none';
                    document.removeEventListener("keydown", keyPress);
                    this_question.updateSelectedTeam();
                }
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-preview-answer-text`).className = 'unfade';
                this.textContent = 'Board';
                this_question.timerGoing = false;
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
                clearInterval(this_question.timerInterval);
                this_question.revealedAnswer = true;
            });
            document.getElementById(`${this.boardType}-normal-question-${this.questionNumber}-reset-button`).addEventListener('click', function() {
                clearInterval(this_question.timerInterval);
                this_question.timerGoing = false;
                this_question.secondsLeft = copy(this_question.timerLengthNormal);
                updateTimer();
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
            });
            for (const team_name of this.teamNames) {
                document.getElementById(`${this.boardType}-normal-question-${this.questionNumber}-${team_name}-add-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-${team_name}-points`).textContent) + this_question.wager;
                    user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score += this_question.wager;
                    update(ref(db, `users/${userId}/active_games/${this_question.boardIndex}/game-settings/teams/${this_question.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score
                    });
                });
                document.getElementById(`${this.boardType}-normal-question-${this.questionNumber}-${team_name}-subtract-button`).addEventListener('click', function() {
                    document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-${team_name}-points`).textContent = parseInt(document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-${team_name}-points`).textContent) - this_question.wager;
                    user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score -= this_question.wager;
                    update(ref(db, `users/${userId}/active_games/${this_question.boardIndex}/game-settings/teams/${this_question.teamNames.indexOf(team_name)}`), {
                        "score": user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score
                    });
                });
            }
        }
        function keyPress(e) {
            //frist see if this should be still active
            if (document.getElementById(`${this_question.boardType}-board-question-${this_question.questionNumber}`) === null) return;
            //then find out which you key you are supposed to be looking for
            let pressedKey = String(e.key);
            if (this_question.dailyDouble) {
                if ((this_question.revealedAnswer === false) && (pressedKey === this_question.keyRevealAnswer))
                    document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).click();
                else if ((this_question.revealedAnswer === true) && (pressedKey === this_question.keyGoHome))  
                    document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).click();
            } else {
                if ((this_question.revealedAnswer === false) && (pressedKey === this_question.keyRevealAnswer))
                    document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).click();
                else if ((this_question.revealedAnswer === true) && (pressedKey === this_question.keyGoHome))  
                    document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).click();
            }
            document.addEventListener("keydown", keyPress, {'once': true});
        }
        function updateQuestionEdit() {
            clearInterval(this_question.timerInterval);
            if (this_question.dailyDouble) {
                this_question.wager = 0;
                this_question.secondsLeft = copy(this_question.timerLengthDailyDouble);
                document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-preview-questions-text`).className = '';
                document.getElementById(`${this_question.boardType}-daily-double-image-${this_question.questionNumber}-image-preview`).className = '';
                document.getElementById(`${this_question.boardType}-next-daily-double-${this_question.questionNumber}-button`).textContent = 'Reveal Question';
            } else {
                this_question.wager = copy(this_question.questionValue);
                this_question.secondsLeft = copy(this_question.timerLengthNormal);
                document.getElementById(`${this_question.boardType}-next-normal-${this_question.questionNumber}-button`).textContent = 'Reveal Answer';
            }
            const question_type = this_question.dailyDouble ? 'daily-double' : 'normal';
            for (const team_name of this_question.teamNames) {
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-points`).textContent = 
                    user_data.active_games[this_question.boardIndex]['game-settings']['teams'][this_question.teamNames.indexOf(team_name)].score;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-add-button`).textContent = `+${this_question.wager}`;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-subtract-button`).textContent = `-${this_question.wager}`;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${team_name}-container`).style.borderColor ='black';
            }
            document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-start-stop-button`).textContent = 'Start';
            document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-answer-text`).className = '';
            const selected_team = this_question.teamNames[user_data.active_games[this_question.boardIndex]['game-settings']['selected-team']];
            document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-${selected_team}-container`).style.borderColor ='red';
            updateTimer();
            if (!this_question.dailyDouble) setTimeout(() => {
                document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-start-stop-button`).click();
            }, this_question.timerDelay * 1000);
            document.querySelector(':root').style.setProperty('--background-color', this_question.backgroundColor);
            document.querySelector(':root').style.setProperty('--question-color', this_question.questionColor);
            document.querySelector(':root').style.setProperty('--answer-color', this_question.answerColor);
            this_question.revealedAnswer = false;
            this_question.revealedQuestion = false;
            this_question.timerGoing = false;
        }
        function updateTimer() {
            let mintues = Math.floor(this_question.secondsLeft / 60);
            let seconds = Math.floor(this_question.secondsLeft - mintues * 60);
            if (seconds < 0) seconds = 0;
            mintues = mintues >= 10 ? `${mintues}` : `0${mintues}`;
            seconds = seconds >= 10 ? `${seconds}` : `0${seconds}`;
            if ((document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-timer-text`) === null) &&
            (document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-timer-text`) === null)) return;
            if (this_question.dailyDouble) document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-timer-text`).textContent = `${mintues}:${seconds}`;
                else document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-timer-text`).textContent = `${mintues}:${seconds}`;
        }
    }
    updateSelectedTeam() {
        user_data.active_games[this.boardIndex]['game-settings']['selected-team']++;
        user_data.active_games[this.boardIndex]['game-settings']['selected-team'] %= this.teamNames.length;
        update(ref(db, `users/${userId}/active_games/${this.boardIndex}/game-settings/`), {
            "selected-team": user_data.active_games[this.boardIndex]['game-settings']['selected-team']
        });
        for (const team_name_index in this.teamNames) {
            document.getElementById(`${this.boardType}-team-${team_name_index}-selector`).style.color = 'yellow';
        }
        document.getElementById(`${this.boardType}-team-${user_data.active_games[this.boardIndex]['game-settings']['selected-team']}-selector`).style.color = 'red';
    }
    export() {
        return {
            'board-type': this.boardType,
            'question-value': this.questionValue,
            'question-number': this.questionNumber,
            'background-color': this.backgroundColor,
            'answer-color': this.answerColor,
            'question-color': this.questionColor,
            'images-allowed': this.imagesAllowed,
            'key-reveal-answer': this.keyRevealAnswer,
            'key-go-home': this.keyGoHome,
            'topic-number': this.topicNumber,
            'question-in-topic-number': this.questionInTopicNumber,
            'faded': this.faded,
            'image-URL': this.imageURL,
            'question': this.question,
            'answer': this.answer,
            'title': this.title,
            'timer-delay': this.timerDelay,
            'timer-length-normal': this.timerLengthNormal,
            'timer-length-daily-double': this.timerLengthDailyDouble,
            'daily-double': this.dailyDouble,
            'board-index': this.boardIndex
        };
    }
}

function hideScreens(expect) {
    for (const screen_type of [
        'home-container',
        'create-board-container',
        'edit-boards-container',
        'settings-container',
        'create-game-container',
        'select-board-container',
        'game-container',
        'load-game-container'
    ]) {
        if (screen_type === expect) 
            document.getElementById(screen_type).style.display = 
                screen_type === 'home-container' ? 'inline-grid' : 'block';
        else
            document.getElementById(screen_type).style.display = 'none';
    }
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

function getRandomInt(max = 1000000000) {
    return Math.floor(Math.random() * max);
}

function createGameListners() {
    document.getElementById("create-game-home-button").addEventListener('click', function() {
        hideScreens('home-container');
    });
    document.getElementById("select-board-home-button").addEventListener('click', function() {
        hideScreens('home-container');
    });
    document.getElementById("create-game-button").addEventListener('click', function() {
        if ((Object.keys(new_game['game-settings'].teams).length < 2) || (Object.keys(new_game['game-settings'].teams).length > 5)) return;
        if (typeof user_data.active_games === 'object') {
            const game_index = user_data.active_games.length;
            new_game['game-settings'].gameIndex = game_index;
            user_data.active_games.push(copy(new_game));
        } else {
            const game_index = 0;
            new_game['game-settings'].gameIndex = game_index;
            user_data.active_games = [copy(new_game)];
        }
        update(ref(db, `users/${userId}`), {
            "active_games": user_data.active_games
        });
        launchFullScreen();
        loadGame(new_game);
    });
    document.getElementById("add-team-button").addEventListener('click', function() {
        let new_team = document.createElement("div");
        new_team.className = 'option';
        new_team.teamName = getRandomInt();
        new_team.teamNumber = Object.keys(new_game['game-settings'].teams).length;
        new_team.innerHTML = `
            <label for="create-game-teams">Team: </label>
            <input id="create-game-team-${new_team.teamNumber}-name-input" placeholder="${new_team.teamName}" style="width: 159px" type="text"/>
            <label for="create-game-teams">Starting score:</label>
            <input id="create-game-team-${new_team.teamNumber}-score-input" class="large-input" step="100" value="0" type="number"/>
        `;
        document.getElementById("teams-options-container").appendChild(new_team);
        new_game['game-settings'].teams.push(copy({
            'name': new_team.teamName,
            'score': 0,
            'team-number': new_team.teamNumber
        }));
        document.getElementById(`create-game-team-${new_team.teamNumber}-name-input`).addEventListener('change', function() {
            new_game['game-settings'].teams[new_team.teamNumber].name = this.value;
        });
        document.getElementById(`create-game-team-${new_team.teamNumber}-score-input`).addEventListener('click', function() {
            new_game['game-settings'].teams[new_team.teamNumber].score = parseInt(this.value);
        });
        document.getElementById(`create-game-team-${new_team.teamNumber}-name-input`).focus();
    });
}

function updateSelectBoard() {
    if (user_data.game_boards === 'empty') return hideScreens('home-container');
    select_board_folders_created = ['main'];
    document.getElementById('select-board-folders').innerHTML = '<div id="select-board-folder-main" class="folder"></div>';
    for (const game_board_key in user_data.game_boards) {
        createSelectBoardDisplay(
            user_data.game_boards[game_board_key].name, 
            parseInt(game_board_key), 
            "12:00:00 PM", 
            user_data.game_boards[game_board_key]['file-path']
        );
    }
    hideSelectBoardFolders('main');
}

function createSelectBoardDisplay(name, boardIndex, dateCreated, filePath) {
    let new_board_display = document.createElement("div");
    new_board_display.boardIndex = boardIndex;
    let folders = filePath.split('/');
    folders.pop();
    new_board_display.folders = folders;
    new_board_display.clicked = false;
    new_board_display.id = `select-board-display-${boardIndex}`;
    new_board_display.className = 'board-displays';
    new_board_display.innerHTML = `
        <img class="board-image" src="./board.png"/>
        <button class="wide-button" id="select-board-display-${boardIndex}-button">${name}</button>
    `;
    for (const folder of folders) {
        if (document.getElementById(`select-board-folder-${folder}`) === null) createSelectBoardFolder(folders.slice(0, folders.indexOf(folder)), folder);
    }
    document.getElementById(`select-board-folder-${folders[folders.length - 1]}`).appendChild(new_board_display);
    document.getElementById(`select-board-display-${boardIndex}-button`).addEventListener('click', function() {
        if (new_board_display.clicked) {
            hideScreens('create-game-container');
            active_game_board_index = boardIndex;
            updateCreateGame();
            new_board_display.clicked = false;
        } else {
            new_board_display.clicked = true;
            setTimeout(() => {
                new_board_display.clicked = false;
            }, 1000);
        }
    });

}

function createSelectBoardFolder(path, name) {
    if (select_board_folders_created.indexOf(name) != -1) return;
    select_board_folders_created.push(name);
    if (document.getElementById(`select-board-folder-${path[path.length - 1]}`) === null) createFolder(path.slice(0, path.length - 1), path.slice(path.length - 1, path.length)[0]);
    let new_folder = document.createElement("div");
    new_folder.path = path;
    new_folder.id = `select-board-folder-${name}`;
    new_folder.className = 'folder';
    new_folder.innerHTML = `
        <button id="select-board-folder-${name}-back" class="wide-button">Back</button>
    `;
    new_folder.style.display = 'none';
    document.getElementById('select-board-folders').appendChild(new_folder);
    document.getElementById(`select-board-folder-${name}-back`).addEventListener('click', function() {
        hideSelectBoardFolders(path[path.length - 1]);
        select_board_path = new_folder.path.join('/') + '/';
        document.getElementById('select-board-path-text').textContent = `Path: ${select_board_path}`;
    });
    let new_folder_icon = document.createElement("div");
    new_folder_icon.id = `select-board-folder-${name}-icon`;
    new_folder_icon.className = 'folder-icon';
    new_folder_icon.innerHTML = `
        <img class="folder-image" src="./folder.png"/>
        <button id="select-board-folder-${name}-icon-button" class="wide-button">${name}</button>
    `;
    document.getElementById(`select-board-folder-${path[path.length - 1]}`).appendChild(new_folder_icon);
    document.getElementById(`select-board-folder-${name}-icon-button`).addEventListener('click', function() {
        hideSelectBoardFolders(name);
        select_board_path += `${name}/`;
        document.getElementById('select-board-path-text').textContent = `Path: ${select_board_path}`;
    });
}

function hideSelectBoardFolders(expect) {
    for (const folder_name of select_board_folders_created) {
        if (folder_name === expect)
            document.getElementById(`select-board-folder-${folder_name}`).style.display = 'block';
        else
            document.getElementById(`select-board-folder-${folder_name}`).style.display = 'none';
    }
}

function updateCreateGame() {
    document.getElementById("create-game-name").checked = true;
    document.getElementById("create-game-teams").checked = true;
    document.getElementById("create-game-boards").checked = true;
    document.getElementById("create-game-other").checked = true;
    document.getElementById("teams-options-container").innerHTML = '';
    new_game = user_data.game_boards[active_game_board_index];
    new_game['game-settings'] = {
        'teams': [],
        'selected-team': 0,
        'name': new_game.name,
        'normal-jeopardy': !(new_game.boards['1-normal-jeopardy-board'] === false),
        'double-jeopardy': !(new_game.boards['1-double-jeopardy-board'] === false),
        'final-jeopardy': !(new_game.boards['1-final-jeopardy-board'] === false),
        'old-questions-clicked': true,
        'team-order': true
    };
    for (const board_settting_type of Object.keys(new_game['game-settings'])) {
        const board_setting_type_value = new_game['game-settings'][board_settting_type];
        new_game['game-settings'][board_settting_type] = board_setting_type_value;
        if ((board_settting_type === 'teams') || (board_settting_type === 'selected-team')) continue;
        if (typeof board_setting_type_value === 'boolean') {
            document.getElementById(`create-game-${board_settting_type}-toggle`).checked = board_setting_type_value;
            document.getElementById(`create-game-${board_settting_type}-toggle`).addEventListener('click', function() {
                new_game['game-settings'][board_settting_type] = this.checked;
            });
        } else if (board_settting_type === 'name') {
            document.getElementById(`create-game-${board_settting_type}-input`).placeholder = board_setting_type_value;
            document.getElementById(`create-game-${board_settting_type}-input`).addEventListener('change', function() {
                new_game['game-settings'][board_settting_type] = this.value;
            });
        } else {
            document.getElementById(`create-game-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`create-game-${board_settting_type}-input`).addEventListener('change', function() {
                new_game['game-settings'][board_settting_type] = this.value;
            });
        }
    }
}

function loadGameListners() {
    document.getElementById('load-game-home-button').addEventListener('click', function() {
        hideScreens('home-container');
    });
}

function updateLoadGame() {
    document.getElementById('active-games-container').innerHTML = '';
    for (const game of user_data.active_games) {
        createGameSelector(game);
    }
}

function createGameSelector(game) {
    const game_index = game['game-settings'].gameIndex;
    let new_game_selector = document.createElement('div');
    new_game_selector.id = `game-selector-${game_index}`;
    new_game_selector.gameIndex = game_index;
    new_game_selector.className = 'board-displays';
    new_game_selector.editingName = false;
    new_game_selector.innerHTML = `
        <img class="board-image" src="./board.png"/>
        <button class="wide-button" id="game-display-${game_index}-button">${game['game-settings'].name}</button>
        <button class="delete-button" id="game-display-${game_index}-delete-button">Delete</button>
        <button class="change-name-button" id="game-display-${game_index}-change-name-button">Change Name</button>
    `;
    document.getElementById('active-games-container').appendChild(new_game_selector);
    document.getElementById(`game-display-${game_index}-button`).addEventListener('click', function() {
        if (new_game_selector.editingName) return;
        launchFullScreen();
        loadGame(game);
    });
    document.getElementById(`game-display-${game_index}-delete-button`).clicked = false;
    document.getElementById(`game-display-${game_index}-delete-button`).addEventListener('click', function() {
        if (this.clicked) {
            user_data.active_games.splice(game_index, 1);
            for (const active_game_index in user_data.active_games) user_data.active_games[active_game_index]['game-settings'].gameIndex = parseInt(active_game_index);
            update(ref(db, `users/${userId}`), {
                "active_games": user_data.active_games
            });
            updateLoadGame();
        }
        this.clicked = true;
        setTimeout(() => {
            document.getElementById(`game-display-${game_index}-delete-button`).clicked = false;
        }, 500);
    });
    document.getElementById(`game-display-${game_index}-change-name-button`).addEventListener('click', function() {
        document.getElementById(`game-display-${game_index}-button`).innerHTML = `
            <input id="game-display-${game_index}-input" class="board-display-input" type="text" value="${user_data.active_games[game_index]['game-settings'].name}"/>
        `;
        new_game_selector.editingName = true;
        document.getElementById(`game-display-${game_index}-input`).focus();
        document.getElementById(`game-display-${game_index}-input`).addEventListener('change', function() {
            user_data.active_games[game_index]['game-settings'].name = this.value;
            update(ref(db, `users/${userId}/active_games/${game_index}/game-settings`), {
                "name": this.value
            });
            new_game_selector.editingName = false;
            updateLoadGame();
        });
    });
}

function loadGame(game_info) {
    document.getElementById('game-container').innerHTML = '';
    document.getElementById('boards-container').innerHTML = '';
    hideScreens('game-container');
    let normal_board = 
        game_info.boards['1-normal-jeopardy-board'] != false && 
        game_info['game-settings']['normal-jeopardy'] != false ? 
        new Board(game_info.boards['1-normal-jeopardy-board'], false) : false; 
    let double_board = 
        game_info.boards['2-double-jeopardy-board'] != false && 
        game_info['game-settings']['double-jeopardy'] != false ? 
        new Board(game_info.boards['2-double-jeopardy-board'], false) : false;
    let final_board = 
        game_info.boards['3-final-jeopardy-board'] != false && 
        game_info['game-settings']['final-jeopardy'] != false ? 
        new Board(game_info.boards['3-final-jeopardy-board'], false) : false;
    if (typeof normal_board != 'boolean') normal_board.loadForGame(game_info['game-settings']);
    if (typeof double_board != 'boolean') double_board.loadForGame(game_info['game-settings']);
    if (typeof final_board != 'boolean') final_board.loadForGame(game_info['game-settings']);
    if (typeof normal_board != 'boolean') {
        document.getElementById("normal-jeopardy-board-container").style.display = 'block';
    } else if (typeof double_board != 'boolean') {
        document.getElementById("double-jeopardy-board-container").style.display = 'block';
    } else {
        document.getElementById("final-jeopardy-board-container").style.display = 'block';
    }
}

function createBoardListners() {
    for (const board_settting_type of Object.keys(user_data.default_board)) {
        const board_setting_type_value = user_data.default_board[board_settting_type];
        new_board_settings[board_settting_type] = board_setting_type_value;
        if (board_settting_type.includes('key')) {
            document.getElementById(`board-${board_settting_type}-input`).textContent = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('click', function() {
                document.addEventListener("keydown", (e) => {
                    let pressedKey = String(e.key);
                    if (pressedKey === 'Control') pressedKey = 'NA';
                    new_board_settings[board_settting_type] = copy(pressedKey);
                    document.getElementById(`board-${board_settting_type}-input`).textContent = pressedKey === '' ? 'NA' :  pressedKey;
                }, {'once': true});
            });
        } else if (typeof board_setting_type_value === 'boolean') {
            document.getElementById(`board-${board_settting_type}-toggle`).checked = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-toggle`).addEventListener('click', function() {
                new_board_settings[board_settting_type] = this.checked;
            });
        } else if (typeof board_setting_type_value === 'number') {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                new_board_settings[board_settting_type] = parseInt(this.value);
            });
        } else if (board_settting_type === 'name') {
            document.getElementById(`board-${board_settting_type}-input`).placeholder = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                new_board_settings[board_settting_type] = this.value;
            });
        } else {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                new_board_settings[board_settting_type] = this.value;
            });
        }
    }
    document.getElementById("finalize-board").addEventListener('click', function() {
        const settings = new_board_settings;
        if (typeof user_data.game_boards === 'object') {
            const board_index = user_data.game_boards.length;
            user_data.game_boards.push(copy({
                'name': new_board_settings.name === 'Name here...' ? getRandomInt() : new_board_settings.name,
                'settings': new_board_settings,
                'file-path': 'main/',
                'boards': {
                    '1-normal-jeopardy-board': settings['normal-jeopardy'] ? new Board(settings, true, board_index, 'normal-jeopardy').export() : false,
                    '2-double-jeopardy-board': settings['double-jeopardy'] ? new Board(settings, true, board_index, 'double-jeopardy').export() : false,
                    '3-final-jeopardy-board': settings['final-jeopardy'] ? new Board(settings, true, board_index, 'final-jeopardy').export() : false
                }
            }));
        } else {
            const board_index = 0;
            user_data.game_boards = [copy({
                'name': new_board_settings.name === 'Name here...' ? getRandomInt() : new_board_settings.name,
                'settings': new_board_settings,
                'file-path': 'main/',
                'boards': {
                    '1-normal-jeopardy-board': settings['normal-jeopardy'] ? new Board(settings, true, board_index, 'normal-jeopardy').export() : false,
                    '2-double-jeopardy-board': settings['double-jeopardy'] ? new Board(settings, true, board_index, 'double-jeopardy').export() : false,
                    '3-final-jeopardy-board': settings['final-jeopardy'] ? new Board(settings, true, board_index, 'final-jeopardy').export() : false
                }
            })];
        }
        update(ref(db, `users/${userId}`), {
            "game_boards": user_data.game_boards
        });
        const game_boards = user_data.game_boards; 
        launchFullScreen();
        createBoardHTML(game_boards[game_boards.length - 1]);
    });
    document.getElementById("create-board-home-button").addEventListener('click', function() {
        hideScreens('home-container');
    });
}

function updateCreateBoard() {
    document.getElementById("board-size").checked = true;
    for (const board_settting_type of Object.keys(user_data.default_board)) {
        const board_setting_type_value = user_data.default_board[board_settting_type];
        new_board_settings[board_settting_type] = board_setting_type_value;
        if (board_settting_type.includes('key')) {
            document.getElementById(`board-${board_settting_type}-input`).textContent = board_setting_type_value;
        } else if (typeof board_setting_type_value === 'boolean') {
            document.getElementById(`board-${board_settting_type}-toggle`).checked = board_setting_type_value;
        } else if (typeof board_setting_type_value === 'number') {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
        } else if (board_settting_type === 'name') {
            document.getElementById(`board-${board_settting_type}-input`).value = '';
            document.getElementById(`board-${board_settting_type}-input`).placeholder = board_setting_type_value;
        } else {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
        }
    }
}

function createBoardHTML(game_board) {
    document.getElementById('game-container').innerHTML = '';
    document.getElementById('boards-container').innerHTML = '';
    hideScreens('boards-container');
    let normal_board = game_board.boards['1-normal-jeopardy-board'] != false ? new Board(game_board.boards['1-normal-jeopardy-board'], false) : false; 
    let double_board = game_board.boards['2-double-jeopardy-board'] != false ? new Board(game_board.boards['2-double-jeopardy-board'], false) : false;
    let final_board = game_board.boards['3-final-jeopardy-board'] != false ? new Board(game_board.boards['3-final-jeopardy-board'], false) : false;
    if (typeof normal_board != 'boolean') normal_board.loadForEditing();
    if (typeof double_board != 'boolean') double_board.loadForEditing();
    if (typeof final_board != 'boolean') final_board.loadForEditing();
    if (typeof normal_board != 'boolean') {
        document.getElementById("normal-jeopardy-board-container").style.display = 'block';
    } else if (typeof double_board != 'boolean') {
        document.getElementById("double-jeopardy-board-container").style.display = 'block';
    } else {
        document.getElementById("final-jeopardy-board-container").style.display = 'block';
    }
}

function editBoardsListners() {
    document.getElementById("edit-boards-home-button").addEventListener('click', function() {
        hideScreens('home-container')
    });
    document.getElementById('edit-boards-create-folder-button').addEventListener('click', function() {
        user_data.folders.push(user_path + getRandomInt() + "/");
        update(ref(db, `users/${userId}/`), {
            "folders": user_data.folders
        });
        updateEditBoards();
    });
}

function updateEditBoards() {
    if (user_data.game_boards === 'empty') return;
    document.getElementById('folders').innerHTML = '<div id="folder-main" class="folder"></div>';
    created_folders = {'main': []};
    for (const game_board_key in user_data.game_boards) {
        createBoardDisplay(
            user_data.game_boards[game_board_key].name, 
            parseInt(game_board_key), 
            "12:00:00 PM", 
            user_data.game_boards[game_board_key]['file-path']
        );
    }
    for (const folder_path of user_data.folders) {
        if (folder_path === 'main/') continue;
        let folder_name = folder_path.split('/');
        folder_name = folder_name[folder_name.length - 2];
        if (document.getElementById(`folder-${folder_name}`) === null) createFolder(folder_path.split('/').slice(0, folder_path.split('/').length - 2), folder_name)
    }
    let current_folder = user_path.split('/');
    current_folder.pop();
    hideFolders(current_folder[current_folder.length - 1]);
}

function createBoardDisplay(name, boardIndex, dateCreated, filePath) {
    let new_board_display = document.createElement("div");
    new_board_display.name = name;
    new_board_display.boardIndex = boardIndex;
    new_board_display.dateCreated = dateCreated;
    new_board_display.filePath = filePath;
    let folders = filePath.split('/');
    folders.pop();
    new_board_display.folders = folders;
    new_board_display.hovered = false;
    new_board_display.editingName = false;
    new_board_display.id = `board-display-${boardIndex}`;
    new_board_display.className = 'board-displays';
    new_board_display.innerHTML = `
        <img class="board-image" src="./board.png"/>
        <button class="wide-button" id="board-display-${boardIndex}-button">${name}</button>
        <button class="edit-button" id="board-display-${boardIndex}-edit-button">Edit</button>
        <button class="copy-button" id="board-display-${boardIndex}-copy-button">Copy</button>
        <button class="delete-button" id="board-display-${boardIndex}-delete-button">Delete</button>
        <button class="change-name-button" id="board-display-${boardIndex}-change-name-button">Change Name</button>
    `;
    for (const folder of folders) {
        if (document.getElementById(`folder-${folder}`) === null) createFolder(folders.slice(0, folders.indexOf(folder)), folder);
        created_folders[folder].push(boardIndex);
    }
    document.getElementById(`folder-${folders[folders.length - 1]}`).appendChild(new_board_display);
    dragBoardDisplay(new_board_display);
    document.getElementById(`board-display-${boardIndex}-edit-button`).addEventListener('click', function() {
        const game_boards = user_data.game_boards; 
        launchFullScreen();
        createBoardHTML(game_boards[boardIndex]);
    });
    document.getElementById(`board-display-${boardIndex}-copy-button`).addEventListener('click', function() {
        user_data.game_boards.push(copy(user_data.game_boards[boardIndex]));
        updateGameBoardIndexs();
        update(ref(db, `users/${userId}`), {
            "game_boards": user_data.game_boards
        });
        updateEditBoards();
    });
    document.getElementById(`board-display-${boardIndex}-delete-button`).clicked = false;
    document.getElementById(`board-display-${boardIndex}-delete-button`).addEventListener('click', function() {
        if (this.clicked) {
            user_data.game_boards.splice(boardIndex, 1);
            updateGameBoardIndexs();
            update(ref(db, `users/${userId}`), {
                "game_boards": user_data.game_boards
            });
            updateEditBoards();
        }
        this.clicked = true;
        setTimeout(() => {
            document.getElementById(`board-display-${boardIndex}-delete-button`).clicked = false;
        }, 500);
    });
    document.getElementById(`board-display-${boardIndex}-change-name-button`).addEventListener('click', function() {
        document.getElementById(`board-display-${boardIndex}-button`).innerHTML = `
            <input id="board-display-${boardIndex}-input" class="board-display-input" type="text" value="${user_data.game_boards[boardIndex].name}"/>
        `;
        new_board_display.editingName = true;
        document.getElementById(`board-display-${boardIndex}-input`).focus();
        document.getElementById(`board-display-${boardIndex}-input`).addEventListener('change', function() {
            user_data.game_boards[boardIndex].name = this.value;
            update(ref(db, `users/${userId}/game_boards/${boardIndex}`), {
                "name": this.value
            });
            new_board_display.editingName = false;
            updateEditBoards();
        });
    });
}

function dragBoardDisplay(elmnt) {
    if (document.getElementById(elmnt.id + "-button")) {
        document.getElementById(elmnt.id + "-button").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
        if (elmnt.editingName) return;
        elmnt.style.position = 'absolute';
        elmnt.style.zIndex = '2';
        e = e || window.event;
        e.preventDefault();
        elmnt.style.left = (e.clientX - 140) + "px";
        elmnt.style.top = (e.clientY - 25) + "px";
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        elmnt.style.left = (e.clientX - 140) + "px";
        elmnt.style.top = (e.clientY - 25) + "px";
    }
    function closeDragElement() {
        elmnt.style.position = 'relative';
        elmnt.style.zIndex = '1';
        elmnt.style.top = '0px';
        elmnt.style.left = '0px';
        document.onmouseup = null;
        document.onmousemove = null;
        if (document.getElementsByClassName('hovered').length > 0) {
            if (document.getElementsByClassName('hovered')[0].className.includes('folder')) {
                user_data.game_boards[elmnt.boardIndex]['file-path'] += `${document.getElementsByClassName('hovered')[0].name}/`;
                update(ref(db, `users/${userId}/game_boards/${elmnt.boardIndex}`), {
                    "file-path": user_data.game_boards[elmnt.boardIndex]['file-path']
                });
                updateEditBoards();
            } else {
                user_data.game_boards[elmnt.boardIndex]['file-path'] = `${document.getElementsByClassName('hovered')[0].path.join('/')}/`;
                update(ref(db, `users/${userId}/game_boards/${elmnt.boardIndex}`), {
                    "file-path": user_data.game_boards[elmnt.boardIndex]['file-path']
                });
                updateEditBoards();
            }
        }
    }
}

function createFolder(path, name) {
    if (document.getElementById(`folder-${path[path.length - 1]}`) === null) createFolder(path.slice(0, path.length - 1), path.slice(path.length - 1, path.length)[0]);
    if (user_data.folders.indexOf(`${path.join('/')}/${name}/`) === -1) {
        user_data.folders.push(`${path.join('/')}/${name}/`);
        update(ref(db, `users/${userId}/`), {
            "folders": user_data.folders
        });
    }
    let new_folder = document.createElement("div");
    new_folder.id = `folder-${name}`;
    new_folder.name = name;
    new_folder.path = path;
    new_folder.className = 'folder';
    new_folder.innerHTML = `
        <button id="folder-${name}-back" class="wide-button">Back</button>
    `;
    new_folder.style.display = 'none';
    document.getElementById('folders').appendChild(new_folder);
    document.getElementById(`folder-${name}-back`).path = path;
    document.getElementById(`folder-${name}-back`).style.zIndex = '3';
    document.getElementById(`folder-${name}-back`).style.position = 'relative';
    document.getElementById(`folder-${name}-back`).addEventListener('click', function() {
        hideFolders(path[path.length - 1]);
        user_path = new_folder.path.join('/') + '/';
        document.getElementById('path-text').textContent = `Path: ${user_path}`;
    });
    document.getElementById(`folder-${name}-back`).addEventListener('mouseenter', function() {
        this.className = 'wide-button hovered';
    });
    document.getElementById(`folder-${name}-back`).addEventListener('mousedown', function() {
        this.className = 'wide-button';
    });
    document.getElementById(`folder-${name}-back`).addEventListener('mouseleave', function() {
        this.className = 'wide-button';
    });
    let new_folder_icon = document.createElement("div");
    new_folder_icon.name = name;
    new_folder_icon.path = path;
    new_folder_icon.id = `folder-${name}-icon`;
    new_folder_icon.className = 'folder-icon';
    new_folder_icon.editingName = false;
    new_folder_icon.clicked = false;
    new_folder_icon.style.zIndex = '3';
    new_folder_icon.innerHTML = `
        <img class="folder-image" src="./folder.png"/>
        <button id="folder-${name}-icon-button" class="wide-button">${name}</button>
        <button id="folder-${name}-delete" class="delete-button">Delete</button>
        <button id="folder-${name}-change-name" class="change-name-button">Change Name</button>
    `;
    document.getElementById(`folder-${path[path.length - 1]}`).appendChild(new_folder_icon);
    dragFolder(new_folder_icon);
    document.getElementById(`folder-${name}-icon-button`).addEventListener('click', function() {
        if (new_folder_icon.editingName) return;
        if (new_folder_icon.clicked) {
            hideFolders(name);
            user_path += `${name}/`;
            document.getElementById('path-text').textContent = `Path: ${user_path}`;
            new_folder_icon.clicked = false;
        } else {
            new_folder_icon.clicked = true;
            setTimeout(() => {
                new_folder_icon.clicked = false;
            }, 1000);
        }
    });
    document.getElementById(`folder-${name}-delete`).clicked = false;
    document.getElementById(`folder-${name}-delete`).addEventListener('click', function() {
        if (this.clicked) {
            for (const board_display_object_index of created_folders[name]) {
                const board_display_object = document.getElementById(`board-display-${board_display_object_index}`);
                board_display_object.folders.splice(board_display_object.folders.indexOf(name), 1);
                board_display_object.filePath = board_display_object.folders.join("/") + "/";
                user_data.game_boards[board_display_object_index]['file-path'] = board_display_object.filePath;
                update(ref(db, `users/${userId}/game_boards/${board_display_object_index}`), {
                    "file-path": board_display_object.filePath
                });
            }
            for (const folder_path_key in user_data.folders) {
                const folder_path = user_data.folders[folder_path_key];
                if (folder_path.includes(name)) {
                    let path = folder_path.split('/');
                    path.pop();
                    path.splice(path.indexOf(name), 1);
                    user_data.folders[folder_path_key] = path.join("/") + "/";
                }
            }
            user_data.folders = [...new Set(user_data.folders)];
            update(ref(db, `users/${userId}/`), {
                "folders": user_data.folders
            });
            updateEditBoards();
        }
        this.clicked = true;
        setTimeout(() => {
            document.getElementById(`folder-${name}-delete`).clicked = false;
        }, 500);
    });
    document.getElementById(`folder-${name}-change-name`).addEventListener('click', function() {
        new_folder_icon.editingName = true;
        document.getElementById(`folder-${name}-icon-button`).innerHTML = `
            <input id="folder-${name}-input" class="folder-input" type="text" value="${name}"/>
        `;
        document.getElementById(`folder-${name}-input`).focus();
        document.getElementById(`folder-${name}-input`).addEventListener('change', function() {
            const new_name = this.value;
            for (const board_display_object_index of created_folders[name]) {
                const board_display_object = document.getElementById(`board-display-${board_display_object_index}`);
                board_display_object.folders[board_display_object.folders.indexOf(name)] = new_name;
                board_display_object.filePath = board_display_object.folders.join("/") + "/";
                user_data.game_boards[board_display_object_index]['file-path'] = board_display_object.filePath;
                update(ref(db, `users/${userId}/game_boards/${board_display_object_index}`), {
                    "file-path": board_display_object.filePath
                });
            }
            for (const folder_path_key in user_data.folders) {
                const folder_path = user_data.folders[folder_path_key];
                if (folder_path.includes(name)) {
                    let path = folder_path.split('/');
                    path.pop();
                    path[path.indexOf(name)] = new_name;
                    user_data.folders[folder_path_key] = path.join("/") + "/";
                }
            }
            user_data.folders = [...new Set(user_data.folders)];
            update(ref(db, `users/${userId}/`), {
                "folders": user_data.folders
            });
            updateEditBoards();
        });
    });
    new_folder_icon.addEventListener('mouseenter', function() {
        this.className = 'folder-icon hovered';
    });
    new_folder_icon.addEventListener('mousedown', function() {
        this.className = 'folder-icon';
    });
    new_folder_icon.addEventListener('mouseleave', function() {
        this.className = 'folder-icon';
    });
    created_folders[name] = [];
}

function dragFolder(elmnt) {
    if (document.getElementById(elmnt.id + "-button")) {
        document.getElementById(elmnt.id + "-button").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
        if (elmnt.editingName) return;
        e = e || window.event;
        e.preventDefault();
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        elmnt.style.position = 'absolute';
        elmnt.style.zIndex = '2';
        elmnt.style.left = (e.clientX - 140) + "px";
        elmnt.style.top = (e.clientY - 25) + "px";
    }
    function closeDragElement() {
        elmnt.style.position = 'relative';
        elmnt.style.zIndex = '3';
        elmnt.style.top = '0px';
        elmnt.style.left = '0px';
        document.onmouseup = null;
        document.onmousemove = null;
        if (document.getElementsByClassName('hovered').length > 0) {
            if (document.getElementsByClassName('hovered')[0].className.includes('folder')) {
                const new_name = document.getElementsByClassName('hovered')[0].name;
                const name = elmnt.name;
                for (const board_display_object_index of created_folders[name]) {
                    const board_display_object = document.getElementById(`board-display-${board_display_object_index}`);
                    board_display_object.folders.splice(board_display_object.folders.indexOf(name), 0, new_name);
                    board_display_object.filePath = board_display_object.folders.join("/") + "/";
                    user_data.game_boards[board_display_object_index]['file-path'] = board_display_object.filePath;
                    update(ref(db, `users/${userId}/game_boards/${board_display_object_index}`), {
                        "file-path": board_display_object.filePath
                    });
                }
                for (const folder_path_key in user_data.folders) {
                    const folder_path = user_data.folders[folder_path_key];
                    if (folder_path.includes(name)) {
                        let path = folder_path.split('/');
                        path.pop();
                        path.splice(path.indexOf(name), 0, new_name);
                        user_data.folders[folder_path_key] = path.join("/") + "/";
                    }
                }
                user_data.folders = [...new Set(user_data.folders)];
                update(ref(db, `users/${userId}/`), {
                    "folders": user_data.folders
                });
                updateEditBoards();
            } else {
                const name = elmnt.name;
                for (const board_display_object_index of created_folders[name]) {
                    const board_display_object = document.getElementById(`board-display-${board_display_object_index}`);
                    board_display_object.folders.splice(board_display_object.folders.indexOf(name) - 1, 1);
                    board_display_object.filePath = board_display_object.folders.join("/") + "/";
                    user_data.game_boards[board_display_object_index]['file-path'] = board_display_object.filePath;
                    update(ref(db, `users/${userId}/game_boards/${board_display_object_index}`), {
                        "file-path": board_display_object.filePath
                    });
                }
                for (const folder_path_key in user_data.folders) {
                    const folder_path = user_data.folders[folder_path_key];
                    if (folder_path.includes(name)) {
                        let path = folder_path.split('/');
                        path.pop();
                        path.splice(path.indexOf(name) - 1, 1);
                        user_data.folders[folder_path_key] = path.join("/") + "/";
                    }
                }
                user_data.folders = [...new Set(user_data.folders)];
                update(ref(db, `users/${userId}/`), {
                    "folders": user_data.folders
                });
                updateEditBoards();
            }
        }
    }
}

function hideFolders(expect) {
    for (const folder_name of Object.keys(created_folders)) {
        if (folder_name === expect)
            document.getElementById(`folder-${folder_name}`).style.display = 'block';
        else
            document.getElementById(`folder-${folder_name}`).style.display = 'none';
    }
}

function updateGameBoardIndexs() {
    for (const game_board_key in user_data.game_boards) {
        const game_board = user_data.game_boards[game_board_key];
        for (const jeopardy_board_key in game_board.boards) {
            if (game_board.boards[jeopardy_board_key] === false) continue;
            user_data.game_boards[game_board_key].boards[jeopardy_board_key]['board-index'] = parseInt(game_board_key);
            for (const question_key in game_board.boards[jeopardy_board_key]['question-infos']) {
                game_board.boards[jeopardy_board_key]['question-infos'][question_key]['board-index'] = parseInt(game_board_key);
            }
        }
    }
}

function launchFullScreen() {
    const element = document.documentElement;
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
}

function settingsListners() {
    for (const settting_type of Object.keys(user_data.default_board)) {
        const setting_type_value = user_data.default_board[settting_type];
        user_data.default_board[settting_type] = setting_type_value;
        if (settting_type.includes('key')) {
            document.getElementById(`settings-${settting_type}-input`).textContent = setting_type_value;
            document.getElementById(`settings-${settting_type}-input`).addEventListener('click', function() {
                document.addEventListener("keydown", (e) => {
                    let pressedKey = String(e.key);
                    if (pressedKey === 'Control') pressedKey = 'NA';
                    user_data.default_board[settting_type] = copy(pressedKey);
                    document.getElementById(`settings-${settting_type}-input`).textContent = pressedKey === '' ? 'NA' :  pressedKey;    
                    update(ref(db, `users/${userId}`), {
                        "default_board": user_data.default_board
                    });
                }, {'once': true});
            });
        } else if (typeof setting_type_value === 'boolean') {
            document.getElementById(`settings-${settting_type}-toggle`).checked = setting_type_value;
            document.getElementById(`settings-${settting_type}-toggle`).addEventListener('click', function() {
                user_data.default_board[settting_type] = this.checked;
                update(ref(db, `users/${userId}`), {
                    "default_board": user_data.default_board
                });
            });
        } else if (typeof setting_type_value === 'number') {
            document.getElementById(`settings-${settting_type}-input`).value = setting_type_value;
            document.getElementById(`settings-${settting_type}-input`).addEventListener('change', function() {
                user_data.default_board[settting_type] = parseInt(this.value);
                update(ref(db, `users/${userId}`), {
                    "default_board": user_data.default_board
                });
            });
        } else if (settting_type === 'name') {
            document.getElementById(`settings-${settting_type}-input`).placeholder = setting_type_value;
            document.getElementById(`settings-${settting_type}-input`).addEventListener('change', function() {
                user_data.default_board[settting_type] = this.value;
                update(ref(db, `users/${userId}`), {
                    "default_board": user_data.default_board
                });
            });
        } else {
            document.getElementById(`settings-${settting_type}-input`).value = setting_type_value;
            document.getElementById(`settings-${settting_type}-input`).addEventListener('change', function() {
                user_data.default_board[settting_type] = this.value;
                update(ref(db, `users/${userId}`), {
                    "default_board": user_data.default_board
                });
            });
        }
    }
    document.getElementById("settings-home-button").addEventListener('click', function() {
        hideScreens('home-container');
    });
}

export function setUserData() {
    user_data = JSON.parse(localStorage.getItem('jeopardy-user-data'));
    settingsListners();
    document.getElementById('loading-screen').style.display = 'none';
}

export function setUserId() {
    userId = JSON.parse(localStorage.getItem('jeopardy-user-id'));
    settingsListners();
    document.getElementById('loading-screen').style.display = 'none';
}

createGameListners();
loadGameListners();
createBoardListners();
editBoardsListners();

document.getElementById("create-game").addEventListener('click', function() {
    hideScreens('select-board-container');
    updateSelectBoard();
});

document.getElementById("load-game").addEventListener('click', function() {
    if (user_data.active_games === 'empty') return;
    hideScreens('load-game-container');
    updateLoadGame();
});

document.getElementById("create-board").addEventListener('click', function() {
    hideScreens(`${this.id}-container`);
    updateCreateBoard();
});

document.getElementById("edit-boards").addEventListener('click', function() {
    hideScreens(`${this.id}-container`);
    updateEditBoards();
});

document.getElementById("open-settings").addEventListener('click', function() {
    hideScreens("settings-container");
});

document.getElementById("log-out").addEventListener('click', function() {
    localStorage.removeItem('jeopardy-user-data');
    localStorage.removeItem('jeopardy-user-cred');
    window.location.href = "index.html";
});