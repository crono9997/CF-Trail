var MOVEMENTS_IN_SHUFFLE = 300;
var DEFAULT_CORRECT = 0;

/*************************
 * PUZZLE REPRESENTATION *
 *************************/

var SIDE_LENGTH = 5;
var MAX_INDEX = SIDE_LENGTH - 1;

var correct_tiles = 40;

var puzzle = new Array( SIDE_LENGTH );
for ( var i = 0; i < SIDE_LENGTH; i++ ) {
    puzzle[i] = new Array( SIDE_LENGTH );
}

/****************
 * PUZZLE PIECE *
 ****************/

function puzzlepiece( r, c, sx, sy, num, x, y ) {
    this.canMove = canMove;
    this.move = move;
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.moveUp = moveUp;
    this.moveDown = moveDown;

    this.Left = 1;
    this.Right = 1;
    this.Top = 1;
    this.Bottom = 1;

    this.row = r;
    this.col = c;

    this.sx = sx;
    this.sy = sy;
    this.x = x;
    this.y = y;
    this.num = num;
    this.moving = 0; // 0: not moving, 1: left, 2: right, 3: up, 4: down
    this.movecount = 0;
    this.isCorrect = false;
}

function canMove() {
    return this.Left == 0 || this.Right == 0 ||
           this.Top == 0 || this.Bottom == 0;
}

function move() {
    var direction = 0;

    // correct before the move means it will now be incorrect
    if ( this.isCorrect ) correct_tiles--;

    if ( this.Left == 0 ) {
        this.moveLeft();
        direction = 1;
    } else if ( this.Right == 0 ) {
        this.moveRight();
        direction = 2;
    } else if ( this.Top == 0 ) {
        this.moveUp();
        direction = 3;
    } else if ( this.Bottom == 0 ) {
        this.moveDown();
        direction = 4;
    }

    if ( this.isCorrect ) correct_tiles++;
    return direction;
}

function moveLeft() {
    this.Left = 1;
    this.Right = 0;
    if ( this.col != MAX_INDEX ) { puzzle[this.row][this.col+1].Left = 0; }
    if ( this.row != MAX_INDEX ) { puzzle[this.row+1][this.col].Top = 0;
                                   puzzle[this.row+1][this.col-1].Top = 1; }
    if ( this.row != 0 )         { puzzle[this.row-1][this.col].Bottom = 0;
                                   puzzle[this.row-1][this.col-1].Bottom = 1; }
    if ( this.col > 1 )          { puzzle[this.row][this.col-2].Right = 1; }
    puzzle[this.row][this.col-1] = this;
    puzzle[this.row][this.col] = null;
    if ( this.num == this.row*SIDE_LENGTH + this.col - 1 ) {
        this.isCorrect = true;
    }
    else { this.isCorrect = false; }
    this.col -= 1;
}

function moveRight() {
    this.Right = 1;
    this.Left = 0;
    if ( this.col < MAX_INDEX - 1 ) { puzzle[this.row][this.col+2].Left = 1; }
    if ( this.row != MAX_INDEX ) { puzzle[this.row+1][this.col].Top = 0;
                                   puzzle[this.row+1][this.col+1].Top = 1; }
    if ( this.row != 0 )         { puzzle[this.row-1][this.col].Bottom = 0;
                                   puzzle[this.row-1][this.col+1].Bottom = 1; }
    if ( this.col != 0 )         { puzzle[this.row][this.col-1].Right = 0; }
    puzzle[this.row][this.col+1] = this;
    puzzle[this.row][this.col] = null;
    if ( this.num == this.row*SIDE_LENGTH + this.col + 1 ) {
        this.isCorrect = true;
    }
    else { this.isCorrect = false; }
    this.col += 1;
}

function moveUp() {
    this.Top = 1;
    this.Bottom = 0;
    if ( this.row != MAX_INDEX ) { puzzle[this.row+1][this.col].Top = 0; }
    if ( this.col != MAX_INDEX ) { puzzle[this.row][this.col+1].Left = 0;
                                   puzzle[this.row-1][this.col+1].Left = 1; }
    if ( this.col != 0 )         { puzzle[this.row][this.col-1].Right = 0;
                                   puzzle[this.row-1][this.col-1].Right = 1; }
    if ( this.row > 1 )          { puzzle[this.row-2][this.col].Bottom = 1; }
    puzzle[this.row-1][this.col] = this;
    puzzle[this.row][this.col] = null;
    if ( this.num == ( this.row - 1 )*SIDE_LENGTH + this.col ) {
        this.isCorrect = true;
    }
    else { this.isCorrect = false; }
    this.row -= 1;
}

function moveDown() {
    this.Bottom = 1;
    this.Top = 0;
    if ( this.row < MAX_INDEX - 1 ) { puzzle[this.row+2][this.col].Top = 1; }
    if ( this.col != MAX_INDEX ) { puzzle[this.row][this.col+1].Left = 0;
                                   puzzle[this.row+1][this.col+1].Left = 1; }
    if ( this.col != 0 )         { puzzle[this.row][this.col-1].Right = 0;
                                   puzzle[this.row+1][this.col-1].Right = 1; }
    if ( this.row != 0 )         { puzzle[this.row-1][this.col].Bottom = 0; }
    puzzle[this.row+1][this.col] = this;
    puzzle[this.row][this.col] = null;
    if ( this.num == ( this.row + 1 )*SIDE_LENGTH + this.col ) {
        this.isCorrect = true;
    }
    else { this.isCorrect = false; }
    this.row += 1;
}

/****************
 * PUZZLE LOGIC *
 ****************/

var piece_info =
  [ { sx: 0,   sy: 0   }, { sx: 100, sy: 0   }, { sx: 200, sy: 0   },
    { sx: 300, sy: 0   }, { sx: 400, sy: 0   }, { sx: 0,   sy: 100 },
    { sx: 100, sy: 100 }, { sx: 200, sy: 100 }, { sx: 300, sy: 100 },
    { sx: 400, sy: 100 }, { sx: 0,   sy: 200 }, { sx: 100, sy: 200 },
    { sx: 200, sy: 200 }, { sx: 300, sy: 200 }, { sx: 400, sy: 200 },  
    { sx: 0,   sy: 300 }, { sx: 100, sy: 300 }, { sx: 200, sy: 300 },
    { sx: 300, sy: 300 }, { sx: 400, sy: 300 }, { sx: 0,   sy: 400 },
    { sx: 100, sy: 400 }, { sx: 200, sy: 400 }, { sx: 300, sy: 400 } ]

function shuffle_pieces() {
    for ( var row = 0; row < SIDE_LENGTH; row++ ) {
        for ( var col = 0; col < SIDE_LENGTH; col++ ) {
            if ( row == MAX_INDEX && col == MAX_INDEX ) { break; }
            var number = row*SIDE_LENGTH + col;
            var spot = piece_info[ number ];
            puzzle[row][col] = new puzzlepiece( row, col, spot.sx, spot.sy,
                number, 100*col, 100*row );
        }
    }
    puzzle[4][3].Right = 0;
    puzzle[3][4].Bottom = 0;
    
    var x = MAX_INDEX, y = MAX_INDEX;
    var coords = null;
    for ( var i = 0; i < MOVEMENTS_IN_SHUFFLE; i++ ) {
        coords = get_random_adjacent_piece( x, y );
        y = coords.y;
        x = coords.x;
        var piece = puzzle[y][x];
        var direction = piece.move();
        switch( direction ) {
            case 1:
                piece.x -= 100;
                break;
            case 2:
                piece.x += 100;
                break;
            case 3:
                piece.y -= 100;
                break;
            case 4:
                piece.y += 100;
                break;
        }
    }
}

function get_random_adjacent_piece( x, y ) {
    var X = 0, Y = 0, possibleMoves = 0;
    if ( x < MAX_INDEX && y < MAX_INDEX && x > 0 && y > 0 ) {
        switch( Math.floor( Math.random() * 4 ) ) {
            case 0:
                X = x - 1;
                Y = y;
                break;
            case 1:
                X = x;
                Y = y - 1;
                break;
            case 2:
                X = x + 1;
                Y = y;
                break;
            case 3:
                X = x;
                Y = y + 1;
                break;
        }
    } else if ( x < MAX_INDEX ) {
        if ( y < MAX_INDEX && y > 0 ) {
            switch( Math.floor( Math.random()*3 ) ) {
                case 0:
                    X = x;
                    Y = y - 1;
                    break;
                case 1:
                    X = x + 1;
                    Y = y;
                    break;
                case 2:
                    X = x;
                    Y = y - 1;
                    break;
            }
        } else if ( y == 0 ) {
            if ( x > 0 && x < 3 ) {
                switch( Math.floor( Math.random()*3 ) ) {
                    case 0:
                        X = x - 1;
                        Y = y;
                        break;
                    case 1:
                        X = x;
                        Y = y + 1;
                        break;
                    case 2:
                        X = x + 1;
                        Y = y;
                        break;
                }
            } else if ( x == 0 ) {
                switch( Math.floor( Math.random()*2 ) ) {
                    case 0:
                        X = x + 1;
                        Y = y;
                        break;
                    case 1:
                        X = x;
                        Y = y + 1;
                        break;
                }
            } else /* x == 3 */ {
                switch( Math.floor( Math.random()*2 ) ) {
                    case 0:
                        X = x - 1;
                        Y = y;
                        break;
                    case 1:
                        X = x;
                        Y = y + 1;
                        break;
                }
            }
        } else /* y == MAX_INDEX */ {
            if ( x < 3 && x > 0 ) {
                switch( Math.floor( Math.random()*3 ) ) {
                    case 0:
                        X = x - 1;
                        Y = y;
                        break;
                    case 1:
                        X = x;
                        Y = y - 1;
                        break;
                    case 2:
                        X = x + 1;
                        Y = y;
                        break;
                }
            } else if ( x == 0 ) {
                switch( Math.floor( Math.random()*2 ) ) {
                    case 0:
                        X = x;
                        Y = y - 1;
                        break;
                    case 1:
                        X = x + 1;
                        Y = y;
                        break;
                }
            } else /* x == 3 */ {
                switch( Math.floor( Math.random()*2 ) ) {
                    case 0:
                        X = x - 1;
                        Y = y;
                        break;
                    case 1:
                        X = x;
                        Y = y - 1;
                        break;
                }
            }
        }
    } else /* x == MAX_INDEX */ {
        if ( y < MAX_INDEX && y > 0 ) {
            switch( Math.floor( Math.random()*3 ) ) {
                case 0:
                    X = x;
                    Y = y - 1;
                    break;
                case 1:
                    X = x - 1;
                    Y = y;
                    break;
                case 2:
                    X = x;
                    Y = y + 1;
                    break;
            }
        } else if ( y == 0 ) {
            switch( Math.floor( Math.random()*2 ) ) {
                case 0:
                    X = x - 1;
                    Y = y;
                    break;
                case 1:
                    X = x;
                    Y = y + 1;
                    break;
            }
        } else /* y == MAX_INDEX */ {
            switch( Math.floor( Math.random()*2 ) ) {
                case 0:
                    X = x - 1;
                    Y = y;
                    break;
                case 1:
                    X = x;
                    Y = y - 1;
                    break;
            }
        }
    }
    return { x: X, y: Y };
}

function puzzle_is_solved() {
    return correct_tiles >= SIDE_LENGTH*SIDE_LENGTH - 1;
}
