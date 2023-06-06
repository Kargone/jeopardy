let user_data = {
    'game_boards': [],
    'default_board': {
        'name': 'Name here...',
        'normal-jeopardy-topic-amount': 5,
        'normal-jeopardy-question-amount': 5,
        'double-jeopardy-topic-amount': 5,
        'double-jeopardy-question-amount': 5,
        'normal-jeopardy': true,
        'double-jeopardy': true,
        'final-jeopardy': true,
        'title-color': '#f8ff00',
        'topic-color': '#f8ff00',
        'background-color': '#073763',
        'answer-color': '#ffffff',
        'question-color': '#ffffff',
        'images-allowed': true,
        'key-reveal-answer': '',
        'key-go-home': '',
        'old-questions-clicked': true,
        'team-order': true,
        'normal-jeopardy-m': 100,
        'normal-jeopardy-b': 0,
        'double-jeopardy-m': 200,
        'double-jeopardy-b': 0
    }
};

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
        this.oldQuestionsClicked = settings['old-questions-clicked'];
        this.teamOrder = settings['team-order'];
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
                    'background_color': this.backgroundColor,
                    'answer_color': this.answerColor,
                    'question_color': this.questionColor,
                    'images_allowed': this.imagesAllowed,
                    'key_reveal_answer': this.keyRevealAnswer,
                    'key_go_home': this.keyGoHome,
                    'old_question_clicked': this.oldQuestionsClicked,
                    'topic_number': topic_number,
                    'question_in_topic_number': question_in_topic_number
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
        this.oldQuestionsClicked = board_export['old-questions-clicked'];
        this.teamOrder = board_export['team-order'];
        this.m = board_export['baord-m'];
        this.b = board_export['baord-b'];
        this.topicAmount = board_export['topic-amount'];
        this.questionAmount = board_export['question-amount'];
        this.topicNames = board_export['topic-names'];
        this.questionInfos = board_export['question-infos'];
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
        board_container.id = `${this.type}-baord-container`;
        if ((this.type === 'normal-jeopardy') || (this.type === 'double-jeopardy')) {
            board_container.innerHTML = `
                <h1>${this.title}</h1>
            `;
            // title
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
            console.log(table)
            board_container.innerHTML += table;
            console.log(board_container.innerHTML)
            // edit text
            // next board
            document.getElementById('boards-container').appendChild(board_container);
            let question_container = document.createElement("div");
            question_container.id = `${this.type}-questions-container`;
            // document.getElementById('boards-container').appendChild(question_container);
        } else {
            document.getElementById('boards-container').appendChild(board_container);
        }
    }
    loadForGame(gameSettings) {

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
            'topicColor': this.topicColor,
            'backgroundColor': this.backgroundColor,
            'answer-color': this.answerColor,
            'question-color': this.questionColor,
            'images-allowed': this.imagesAllowed,
            'key-reveal-answer': this.keyRevealAnswer,
            'key-go-home': this.keyGoHome,
            'old-questions-clicked': this.oldQuestionsClicked,
            'team-order': this.teamOrder,
            'baord-m': this.m,
            'baord-b': this.b,
            'topic-amount': this.topicAmount,
            'question-amount': this.questionAmount,
            'topic-names': this.topicNames,
            'question-infos': this.exportQuestionInfos()
        };
    }
}

class Question {
    constructor(object, loadFromSettings = true) {
        if (loadFromSettings) {
            this.loadFromSettings(
                object.board_type,
                object.question_value, 
                object.background_color, 
                object.answer_color, 
                object.question_color, 
                object.images_allowed, 
                object.key_reveal_answer, 
                object.key_go_home, 
                object.old_question_clicked,
                object.topic_number,
                object.question_in_topic_number
            );
        } else {
            this.loadFromExport(object);
        }
    }
    loadFromSettings(board_type,
        question_value, 
        background_color, 
        answer_color, 
        question_color, 
        images_allowed, 
        key_reveal_answer, 
        key_go_home, 
        old_question_clicked,
        topic_number,
        question_in_topic_number) {
        this.boardType = board_type;
        this.questionValue = question_value;
        this.backgroundColor = background_color;
        this.answerColor = answer_color;
        this.questionColor = question_color;
        this.imagesAllowed = images_allowed;
        this.keyRevealAnswer = key_reveal_answer;
        this.keyGoHome = key_go_home;
        this.oldQuestionsClicked = old_question_clicked;
        this.topicNumber = topic_number;
        this.questionInTopicNumber = question_in_topic_number;
        this.imageURL = '';
        this.question = 'Enter question here';
        this.answer = 'Enter answer here';
        this.title = `Topic ${this.topicNumber} $${this.questionValue} Question`;

    }
    loadFromExport(question_export) {
        this.boardType = question_export['board-type'];
        this.questionValue = question_export['question-value'];
        this.backgroundColor = question_export['background-color'];
        this.answerColor = question_export['answer-color'];
        this.questionColor = question_export['question-color'];
        this.imagesAllowed = question_export['images-allowed'];
        this.keyRevealAnswer = question_export['key-reveal-answer'];
        this.keyGoHome = question_export['key-go-home'];
        this.oldQuestionsClicked = question_export['old-questions-clicked'];
        this.topicNumber = question_export['topic-number'];
        this.questionInTopicNumber = question_export['question-in-topic-number'];
        this.imageURL = question_export['image-URL'];
        this.question = question_export['question'];
        this.answer = question_export['answer'];
        this.title = question_export['title'];
    }
    loadForEditing() {

    }
    loadForGame() {
        
    }
    export() {
        return {
            'board-type': this.boardType,
            'question-value': this.questionValue,
            'background-color': this.backgroundColor,
            'answer-color': this.answerColor,
            'question-color': this.questionColor,
            'images-allowed': this.imagesAllowed,
            'key-reveal-answer': this.keyRevealAnswer,
            'key-go-home': this.keyGoHome,
            'old-questions-clicked': this.oldQuestionsClicked,
            'topic-number': this.topicNumber,
            'question-in-topic-number': this.questionInTopicNumber,
            'image-URL': this.imageURL,
            'question': this.question,
            'answer': this.answer,
            'title': this.title
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
            document.getElementById(screen_type).style.display = 'block';
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
        if (typeof board_setting_type_value === 'boolean') {
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
            'boards': {
                '1-normal-jeopardy-baord': settings['normal-jeopardy'] ? new Board(settings, true, 'normal-jeopardy').export() : false,
                '2-double-jeopardy-baord': settings['double-jeopardy'] ? new Board(settings, true, 'double-jeopardy').export() : false,
                '3-final-jeopardy-board': settings['final-jeopardy'] ? new Board(settings, true, 'final-jeopardy').export() : false
            }
        });
        const game_boards = user_data.game_boards; 
        CreateBoardHTML(game_boards[game_boards.length - 1]);
    });
}

function CreateBoardHTML(game_board) {
    hideScreens('boards-container');
    let normal_board = game_board.boards['1-normal-jeopardy-baord'] != false ? new Board(game_board.boards['1-normal-jeopardy-baord'], false) : false; 
    let double_board = game_board.boards['2-double-jeopardy-baord'] != false ? new Board(game_board.boards['2-double-jeopardy-baord'], false) : false;
    let final_board = game_board.boards['3-final-jeopardy-board'] != false ? new Board(game_board.boards['3-final-jeopardy-board'], false) : false;
    if (typeof normal_board != 'boolean') normal_board.loadForEditing();
    // if (typeof double_board != 'boolean') double_board.loadForEditing();
    // if (typeof final_board != 'boolean') final_board.loadForEditing();
}

function showBoard(type) {

}

document.getElementById("create-board").addEventListener('click', function() {
    hideScreens(`${this.id}-container`);
    createBoardListners();
});