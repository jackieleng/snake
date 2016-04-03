function create_board(rows, cols) {
    var board = new Array(rows);
    for (var i = 0; i < rows; i++) {
        board[i] = new Array(cols);
    }
    return board;
}

/**
 * Fills the board in place.
 * @param {array} board - A 2d matrix
 * @param val - fill value
 */
function fill2d(board, val) {
    for (var i = 0; i < board.length; i++) {
        board[i].fill(val);
    }
    return board;
}

function print_board(board) {
    var output = '';
    var border = '';
    for (var i = 0; i < board.length; i++) {
        if (i === 0) {
            border = board[i].slice().fill('---');
            output += '+' + border.join('') + '+\n';
        }

        output += '|' + board[i].join('') + '|\n';

        if (i === board.length - 1) {
            border = board[i].slice().fill('---');
            output += '+' + border.join('') + '+\n';
        }
    }
    process.stdout.write(output);
}

// Get something more readable
function parse_key(key) {
    var _key = key;
    // Arrow key
    if (key == '\u001B\u005B\u0041') {
        _key = 'up';
    }
    if (key == '\u001B\u005B\u0043') {
        _key = 'right';
    }
    if (key == '\u001B\u005B\u0042') {
        _key = 'down';
    }
    if (key == '\u001B\u005B\u0044') {
        _key = 'left';
    }
    if (key === '\u0003') {
        // End-of-text, i.e., Ctrl-C
        _key = 'eot';
    }
    return _key;
}

function update_board(board, snake, food) {
    fill2d(board, '   ');
    var i;
    for (i = 0; i < snake.length; i++) {
        row = snake[i][0];
        col = snake[i][1];
        board[row][col] = ' O ';
    }
    for (i = 0; i < food.length; i++) {
        row = food[i][0];
        col = food[i][1];
        board[row][col] = ' # ';
    }
}

// Check if snake coordinates are inside board defined by rows and cols
function snake_inside(snake, rows, cols) {
    for (var i = 0; i < snake.length; i++) {
        row = snake[i][0];
        col = snake[i][1];
        if (row < 0 || col < 0 || row > rows - 1 || col > cols - 1) {
            return false;
        }
    }
    return true;
}

// Check if snake touches itself, by checking duplicate coordinates
function snake_touching(snake) {
    // Crappy string sorting, but doesn't really matter.
    var sorted = snake.slice().sort();
    for (var i = 0; i < sorted.length - 1; i++) {
        // TODO: elementwise comparison would be better... but yeah,
        // coordinates are always [row, col] anyway...
        if (JSON.stringify(sorted[i]) === JSON.stringify(sorted[i + 1])) {
            return true;
        }
    }
    return false;
 
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init_snake(board_rows, board_cols) {
    var start = [getRandomIntInclusive(0, board_rows - 1), getRandomIntInclusive(0, board_cols - 1)];
    var part1 = [start[0] + 1, start[1]];
    var part2 = [start[0] + 2, start[1]];
    return [start, part1, part2];
}

function init_food(board_rows, board_cols) {
    var start = [getRandomIntInclusive(0, board_rows - 1), getRandomIntInclusive(0, board_cols - 1)];
    return [start];
}

// TODO: not very clean: mutates the food array
function snake_food_intersects(snake, food) {
    for (var i = 0; i < food.length; i++) {
        for (var j = 0; j < snake.length; j ++) {
            if (JSON.stringify(food[i]) === JSON.stringify(snake[j])) {
                return food.splice(i, 1);
            }
        }
    }
    return null;
}

// Move the snake array in the desired direction
function move_snake(snake, direction, food) {
    if (direction === '') {
        return;
    }
    var head = snake[0].slice();
    var tail = snake.pop();
    if (direction === 'up') {
        head[0] -= 1;
    } else if (direction === 'down') {
        head[0] += 1;
    } else if (direction === 'left') {
        head[1] -= 1;
    } else if (direction === 'right') {
        head[1] += 1;
    }
    snake.unshift(head);

    var eaten = snake_food_intersects(snake, food);
    if (eaten !== null) {
        snake.push(tail);
    }
}

function main() {
    var rows = 20;
    var cols = 20;
    var board = create_board(rows, cols);
    fill2d(board, ' . ');
    var snake = init_snake(rows, cols);
    var food = init_food(rows, cols);
    update_board(board, snake, food);
    var _key = '';
    console.log(board);
    print_board(board);

    // Get raw input, without having to press Enter.
    // Note: need TTY check because setRawMode not available in debugger
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (key) {
        _key = parse_key(key);
        process.stdout.write(_key);
        // Ctrl-C exits
        if (_key === 'eot') {
            process.stdout.write('Ctrl-C pressed, exiting...\n');
            process.exit();
        }
    });
    //debugger;

    setInterval(function() {
        move_snake(snake, _key, food);
        if (food.length === 0) {
            food = init_food(rows, cols);
        }
        if (!snake_inside(snake, rows, cols) || snake_touching(snake)) {
            process.stdout.write('Lost!\n');
            process.exit();
        }
        update_board(board, snake, food);
        // Clears console
        console.log('\033[2J');
        print_board(board);
    }, 150);

}

if (require.main === module) {
    main();
}

exports.create_board = create_board;
exports.fill2d = fill2d;
exports.move_snake = move_snake;
exports.init_snake = init_snake;
