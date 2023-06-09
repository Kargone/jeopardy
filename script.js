let user_data = {
    'game_boards': [],
    'default_board': {
        'name': 'Name here...',
        'normal-jeopardy-topic-amount': 5,
        'normal-jeopardy-question-amount': 5,
        'double-jeopardy-topic-amount': 5,
        'double-jeopardy-question-amount': 5,
        'timer-delay': 1,
        'timer-length-normal': 3,
        'timer-length-daily-double': 5,
        'normal-jeopardy': true,
        'double-jeopardy': true,
        'final-jeopardy': true,
        'title-color': '#f8ff00',
        'topic-color': '#f8ff00',
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
    }
};

// 'old-questions-clicked': true,
// 'team-order': true,

class Board {
    constructor(object, loadFromSettings, board_type = 'normal-jeopardy') {
        if (loadFromSettings) {
            this.loadFromSettings(object, board_type);
        } else {
            this.loadFromExport(object);
        }
    }
    loadFromSettings(settings, board_type) {
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
                    'timer_length_daily_double': this.timerLengthDailyDouble
                }, true);
            }
        }
    }
    loadFromExport(board_export) {
        this.type = board_export['type'];
        this.title = board_export['title'];
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
        let board_container = document.createElement("div");
        board_container.id = `${this.type}-board-container`;
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            // title
            // edit text
            // next board
            board_container.innerHTML = `
                <div id="${this.type}-title-container">
                    <h1>${this.title}</h1>
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
            // table
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
            // board_container.style.display = 'none';
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
            document.getElementById('boards-container').appendChild(board_container);
        }
        this.attachListnersForEditing();
    }
    attachListnersForEditing() {
        this.editingText = false;
        this.showingDailyDoubles = false;
        const this_board = this;
        document.getElementById(`${this.type}-home-button`).addEventListener('click', function() {
            document.getElementById('boards-container').innerHTML = '';
            hideScreens('home-container');
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
                });
                for (let topic_number = 1; topic_number <= this_board.topicAmount; topic_number++) {
                    document.getElementById(`${this_board.type}-topic-${topic_number}`).innerHTML = `
                        <input id="${this_board.type}-topic-${topic_number}-input" class="topic-heading-input" value="${this_board.topicNames[topic_number - 1]}" type="text"/>
                    `;
                    document.getElementById(`${this_board.type}-topic-${topic_number}-input`).addEventListener('change', function() {
                        this_board.topicNames[topic_number - 1] = this.value;
                        for (let question_in_topic_number = 1; question_in_topic_number <= this_board.questionAmount; question_in_topic_number++) {
                            const question_number = (topic_number - 1) * this_board.questionAmount + question_in_topic_number;
                            const question_info = this_board.questionInfos[`question-${question_number}`];
                            question_info.title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
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
                            question_info.title = `${this_board.topicNames[topic_number - 1]} $${question_info.questionValue} Question`;
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
            
        }
    }
    loadForGame(gameSettings) {

    }
    attachListnersForGame() {
        
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
        this.imageURL = question_export['image-URL'];
        this.question = question_export['question'];
        this.answer = question_export['answer'];
        this.title = question_export['title'];
        this.timerDelay = question_export['timer-delay'];
        this.timerLengthNormal = question_export['timer-length-normal'];
        this.timerLengthDailyDouble = question_export['timer-length-daily-double'];
        this.dailyDouble = question_export['daily-double'];
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
                        <input id="${this.boardType}-normal-question-${this.questionNumber}-input" type="text" value="${this.question}"/>
                    </div>
                    <div class="answer-input-container">
                        <label>A:</label>
                        <input id="${this.boardType}-normal-answer-${this.questionNumber}-input" type="text" value="${this.answer}"/>
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
                        <input id="${this.boardType}-daily-double-question-${this.questionNumber}-input" type="text" value="${this.question}"/>
                    </div>
                    <div class="answer-input-container">
                        <label>A:</label>
                        <input id="${this.boardType}-daily-double-answer-${this.questionNumber}-input" type="text" value="${this.answer}"/>
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
                        <h2 id="${this.boardType}-normal-question-${this.questionNumber}-preview-answer-text">A:${this.answer}</h2>
                    </div>
                    <div class="preview-image-container">
                        <img id="${this.boardType}-normal-image-${this.questionNumber}-image-preview" src="${this.imageURL}" alt="Image"/>
                    </div>
                    <div id="${this.boardType}-normal-question-${this.questionNumber}-team-viewer" class="preview-team-viewer"></div>
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
                    <div class="preview-timer-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-timer">Timer:${this.timerLengthDailyDouble}</h2>
                    </div>
                    <div class="preview-question-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-questions-text">Q: ${this.question}</h2>
                    </div>
                    <div class="preview-answer-container">
                        <h2 id="${this.boardType}-daily-double-question-${this.questionNumber}-preview-answer-text">A:${this.answer}</h2>
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
            });
            document.getElementById(`${this.boardType}-${question_type}-timer-delay-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.timerDelay = this.value;
            });
            document.getElementById(`${this.boardType}-${question_type}-question-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.question = this.value;
            });
            document.getElementById(`${this.boardType}-${question_type}-answer-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.answer = this.value;
            });
            document.getElementById(`${this.boardType}-${question_type}-image-${this.questionNumber}-input`).addEventListener('change', function() {
                this_question.imageURL = this.value;
                document.getElementById(`${this_question.boardType}-${question_type}-image-${this_question.questionNumber}-preview`).src = this_question.imageURL;
            });
            document.getElementById(`${this.boardType}-preview-${question_type}-question-${this.questionNumber}-button`).addEventListener('click', function() {
                updatePreview();
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-preview-container`).style.display = 'block';
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
            this_question.timerLengthNormal = this.value;
        });
        document.getElementById(`${this.boardType}-daily-double-timer-${this.questionNumber}-input`).addEventListener('change', function() {
            this_question.timerLengthDailyDouble = this.value;
        });
        document.getElementById(`${this.boardType}-make-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
            this_question.dailyDouble = true;
            updateQuestionEdit();
            document.getElementById(`${this_question.boardType}-normal-question-${this_question.questionNumber}-edit-container`).style.display = 'none';
            document.getElementById(`${this_question.boardType}-daily-double-question-${this_question.questionNumber}-edit-container`).style.display = 'block';
            if (this_question.showingDailyDoubles) document.getElementById(`${this_question.boardType}-board-question-${this_question.questionNumber}`).style.backgroundColor = 'red';
        });
        document.getElementById(`${this.boardType}-unmake-daily-double-${this.questionNumber}-button`).addEventListener('click', function() {
            this_question.dailyDouble = false;
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
        function updateQuestionEdit() {
            document.getElementById(`${this_question.boardType}-normal-timer-${this_question.questionNumber}-input`).value = this_question.timerLengthNormal;
            document.getElementById(`${this_question.boardType}-daily-double-timer-${this_question.questionNumber}-input`).value = this_question.timerLengthDailyDouble;
            for (const question_type of ['normal', 'daily-double']) {
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-title`).textContent = this_question.title;
                document.getElementById(`${this_question.boardType}-${question_type}-timer-delay-${this_question.questionNumber}-input`).value = this_question.timerDelay;
                document.getElementById(`${this_question.boardType}-${question_type}-question-${this_question.questionNumber}-input`).value = this_question.question;
                document.getElementById(`${this_question.boardType}-${question_type}-answer-${this_question.questionNumber}-input`).value = this_question.answer;
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
    loadForGame() {
        
    }
    attachListnersForGame() {

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
            'image-URL': this.imageURL,
            'question': this.question,
            'answer': this.answer,
            'title': this.title,
            'timer-delay': this.timerDelay,
            'timer-length-normal': this.timerLengthNormal,
            'timer-length-daily-double': this.timerLengthDailyDouble,
            'daily-double': this.dailyDouble
        };
    }
}

function hideScreens(expect) {
    for (const screen_type of [
        'home-container',
        'create-board-container',
        'boards-container'
    ]) {
        if (screen_type === expect) 
            document.getElementById(screen_type).style.display = screen_type === 'home-container' ? 'inline-grid' : 'block';
        else
            document.getElementById(screen_type).style.display = 'none';
    }
}

function copy(value) {
    return JSON.parse(JSON.stringify(value));
}

function createBoardListners() {
    let new_board_settings = {};
    for (const board_settting_type of Object.keys(user_data.default_board)) {
        const board_setting_type_value = user_data.default_board[board_settting_type];
        new_board_settings[board_settting_type] = board_setting_type_value;
        if (board_settting_type.includes('key')) {
            document.getElementById(`board-${board_settting_type}-input`).textContent = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('click', function() {
                document.addEventListener("keydown", (e) => {
                    let pressedKey = String(e.key);
                    new_board_settings[board_settting_type] = pressedKey;
                    document.getElementById(`board-${board_settting_type}-input`).textContent = pressedKey;    
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
        } else {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                new_board_settings[board_settting_type] = this.value;
            });
        }
    }
    document.getElementById("finalize-board").addEventListener('click', function() {
        const settings = new_board_settings;
        user_data.game_boards.push({
            'name': new_board_settings.name,
            'settings': new_board_settings,
            'file-path': 'main/',
            'boards': {
                '1-normal-jeopardy-board': settings['normal-jeopardy'] ? new Board(settings, true, 'normal-jeopardy').export() : false,
                '2-double-jeopardy-board': settings['double-jeopardy'] ? new Board(settings, true, 'double-jeopardy').export() : false,
                '3-final-jeopardy-board': settings['final-jeopardy'] ? new Board(settings, true, 'final-jeopardy').export() : false
            }
        });
        const game_boards = user_data.game_boards; 
        launchFullScreen();
        CreateBoardHTML(game_boards[game_boards.length - 1]);
    });
}

function CreateBoardHTML(game_board) {
    hideScreens('boards-container');
    let normal_board = game_board.boards['1-normal-jeopardy-board'] != false ? new Board(game_board.boards['1-normal-jeopardy-board'], false) : false; 
    let double_board = game_board.boards['2-double-jeopardy-board'] != false ? new Board(game_board.boards['2-double-jeopardy-board'], false) : false;
    let final_board = game_board.boards['3-final-jeopardy-board'] != false ? new Board(game_board.boards['3-final-jeopardy-board'], false) : false;
    if (typeof normal_board != 'boolean') normal_board.loadForEditing();
    // if (typeof double_board != 'boolean') double_board.loadForEditing();
    // if (typeof final_board != 'boolean') final_board.loadForEditing();
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

function showBoard(type) {

}

createBoardListners();
document.getElementById("create-board").addEventListener('click', function() {
    hideScreens(`${this.id}-container`);
});