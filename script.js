let user_data = {
    'boards': [],
    'default_board': {
        'name': 'Name here...',
        'topic-amount': 5,
        'question-amount': 5,
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
        'double-jeopardy-m': 100,
        'double-jeopardy-b': 0,
        'final-jeopardy-m': 100,
        'final-jeopardy-b': 0
    }
};
let board = {};


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
    for (const board_settting_type of Object.keys(user_data.default_board)) {
        const board_setting_type_value = user_data.default_board[board_settting_type];
        board[board_settting_type] = board_setting_type_value;
        if (typeof board_setting_type_value === 'boolean') {
            document.getElementById(`board-${board_settting_type}-toggle`).checked = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-toggle`).addEventListener('click', function() {
                board[board_settting_type] = this.checked;
            });
        } else if (typeof board_setting_type_value === 'number') {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                board[board_settting_type] = parseInt(this.value);
            });
        } else {
            document.getElementById(`board-${board_settting_type}-input`).value = board_setting_type_value;
            document.getElementById(`board-${board_settting_type}-input`).addEventListener('change', function() {
                board[board_settting_type] = this.value;
            });
        }
    }
    document.getElementById("finalize-board").addEventListener('click', function() {
        user_data.boards.push(copy(board));
    });
}

document.getElementById("create-board").addEventListener('click', function() {
    hideScreens(`${this.id}-container`);
    createBoardListners();
});