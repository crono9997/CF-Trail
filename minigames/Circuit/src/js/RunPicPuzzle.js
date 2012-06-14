var FRAMES_PER_SECOND   = 90;
var PUZZLE_IMG_SRC      = 'media/circuitboard_puzzle.png';
var BG_IMG_SRC          = 'media/circuitboard_medium.jpg';
var TMR_OVRLY_SRC       = 'media/timeroverlay.png';
var SCOREFONT_IMG_SRC   = 'media/scorefont.png';
var SPLASH_IMG_SRC      = 'media/splash.png';
var MAIN_CANVAS_NAME    = 'maincanvas';
var BG_CANVAS_NAME      = 'bgcanvas';
var STEPS_PER_MOVEMENT  = 20;
var PIXELS_PER_MOVEMENT = 100/STEPS_PER_MOVEMENT;
var DEFAULT_SCORE       = 30000;
var DEFAULT_NAME        = "PLYR1";

var TIMER_LIMIT         = FRAMES_PER_SECOND * 40; // 40 seconds
var TIMER_HEIGHT        = 325;
var TIMER_WIDTH         = 60;
var TIMER_PIXEL_DELTA   = TIMER_HEIGHT / TIMER_LIMIT;
var TIME_ADDED          = TIMER_LIMIT / 4;

var RETRY  = 0;
var SUBMIT = 1;

var canvas = document.getElementById( MAIN_CANVAS_NAME );
var ctx = canvas.getContext('2d');
var bgcanvas = document.getElementById( BG_CANVAS_NAME );
var bgctx = bgcanvas.getContext('2d');

var first_failed_frame  = true;
var submitted           = false;
var tile_clicked        = null;

var timer_frames_left = TIMER_LIMIT;
var score = DEFAULT_SCORE;
var updateInterval = null;
var name_buffer = null;
var hiscores = [];

var has_been_correct = null;

var scorefontimg = new Image();
scorefontimg.src = SCOREFONT_IMG_SRC;
var CHAR_WIDTH = 30;
var CHAR_HEIGHT = 50;

var bgimg           = new Image();
var img             = new Image();
var timeroverlayimg = new Image();
img.src             = PUZZLE_IMG_SRC;
bgimg.src           = BG_IMG_SRC;
timeroverlayimg.src = TMR_OVRLY_SRC;

show_splash();

function show_splash() {
    var splashimg = new Image();
    splashimg.src = SPLASH_IMG_SRC;
    splashimg.onload = function() { bgctx.drawImage( splashimg, 0, 0 ); };
    $("#bgcanvas").click( function( e ) {
        $("#bgcanvas").unbind( 'click' );
        $("#bgcanvas").click( function( e ) {
            if ( puzzle_is_solved() || puzzle_is_failed()) {
                switch( get_btn_from_mouse_pos( e.pageX - this.offsetLeft,
                                                e.pageY - this.offsetTop ) ) {
                    case SUBMIT:
                        if ( submitted ) break;
                        $.post( "../db/Leaderboards.php",
                            { "op": "setScore", "username": name_buffer,
                              "gameID": "circuit", "score": score } );
                        get_high_scores();
                        break;
                    case RETRY:
                        clearInterval( updateInterval );
                        init();
                        break;
                }
            }
        } );
        init();
    } );
}

function get_tile_from_mouse_pos( x, y ) {
    var col = Math.floor( x / 100 );
    var row = Math.floor( y / 100 );
    return { r: row, c: col };
}

function get_btn_from_mouse_pos( x, y ) {
    if ( y > 200 && y < 240 && x > 820 && x < 890 ) return SUBMIT;
    if ( y > 200 && y < 240 && x > 910 && x < 980 ) return RETRY;
}

function init() {
    $("#maincanvas").click( function(e) {
        if ( find_moving_piece() == null ) {
            var coords = get_tile_from_mouse_pos( e.pageX - this.offsetLeft,
                                              e.pageY - this.offsetTop );
            var piece = puzzle[coords.r][coords.c];
            if ( piece != null && piece.canMove() ) { tile_clicked = coords; }
        }
    } );
    has_been_correct = [ [ false, false, false, false, false ],
                         [ false, false, false, false, false ],
                         [ false, false, false, false, false ],
                         [ false, false, false, false, false ],
                         [ false, false, false, false, false ] ];
    timer_frames_left = TIMER_LIMIT;
    correct_tiles = DEFAULT_CORRECT;
    name_buffer = DEFAULT_NAME;
    score = DEFAULT_SCORE;
    first_failed_frame = true;
    submitted = false;
    shuffle_pieces();
    addEventListener( 'keydown', onKeyDown, false );
    get_high_scores();
    updateInterval = setInterval( update, 1000/FRAMES_PER_SECOND );
}

function onKeyDown( e ) {
    if ( puzzle_is_solved ) {
        var c = e.keyCode;
        if ( c == 8 && name_buffer.length > 0 ) {
            name_buffer = name_buffer.slice( 0, -1 );
        } else if ( ( c > 64 && c < 91 ) || ( c > 47 && c < 58 ) ) {
            // just write numbers and uppercase letters
            add_char_to_name_buffer( c );
        } else if ( c > 96 && c < 123 ) {
            // keeping it uppercase
            add_char_to_name_buffer( c - 32 );
        }
    }
}

function add_char_to_name_buffer( c ) {
    if ( name_buffer.length < 5 ) name_buffer += String.fromCharCode( c );
}

function update() {
    var piece = find_moving_piece();
    if ( piece != null ) {
        var row = piece.r;
        var col = piece.c;
        piece = puzzle[piece.r][piece.c];
        switch ( piece.moving ) {
            case 1:
                if ( piece.movecount < STEPS_PER_MOVEMENT ) {
                    puzzle[row][col].movecount++;
                    puzzle[row][col].x -= PIXELS_PER_MOVEMENT;
                } else {
                    puzzle[row][col].movecount = 0;
                    puzzle[row][col].moving = 0;
                }
                break;
            case 2:
                if ( piece.movecount < STEPS_PER_MOVEMENT ) {
                    puzzle[row][col].movecount++;
                    puzzle[row][col].x += PIXELS_PER_MOVEMENT;
                } else {
                    puzzle[row][col].movecount = 0;
                    puzzle[row][col].moving = 0;
                }
                break;
            case 3:
                if ( piece.movecount < STEPS_PER_MOVEMENT ) {
                    puzzle[row][col].movecount++;
                    puzzle[row][col].y -= PIXELS_PER_MOVEMENT;
                } else {
                    puzzle[row][col].movecount = 0;
                    puzzle[row][col].moving = 0;
                }
                break;
            case 4:
                if ( piece.movecount < STEPS_PER_MOVEMENT ) {
                    puzzle[row][col].movecount++;
                    puzzle[row][col].y += PIXELS_PER_MOVEMENT;
                } else {
                    puzzle[row][col].movecount = 0;
                    puzzle[row][col].moving = 0;
                }
                break;
        }
        row = SIDE_LENGTH; // break from both loops
    } else if ( tile_clicked != null ) {
        play_sliding_sound();
        var row = tile_clicked.r;
        var col = tile_clicked.c;
        var direction = puzzle[row][col].move();
        switch ( direction ) {
            case 1:
                puzzle[row][col-1].moving = 1;
                if ( puzzle[row][col-1].isCorrect ) {
                    if ( !( has_been_correct[row][col-1] ) ) {
                        add_time();
                        has_been_correct[row][col-1] = true;
                    }
                }
                break;
            case 2:
                puzzle[row][col+1].moving = 2;
                if ( puzzle[row][col+1].isCorrect ) {
                    if ( !( has_been_correct[row][col+1] ) ) {
                        add_time();
                        has_been_correct[row][col+1] = true;
                    }
                }
                break;
            case 3:
                puzzle[row-1][col].moving = 3;
                if ( puzzle[row-1][col].isCorrect ) {
                    if ( !( has_been_correct[row-1][col] ) ) {
                        add_time();
                        has_been_correct[row-1][col] = true;
                    }
                }
                break;
            case 4:
                puzzle[row+1][col].moving = 4;
                if ( puzzle[row+1][col].isCorrect ) {
                    if ( !( has_been_correct[row+1][col] ) ) {
                        add_time();
                        has_been_correct[row+1][col] = true;
                    }
                }
                break;
        }
        tile_clicked = null;
    }
    if ( puzzle_is_solved() && puzzle[4][3].Right == 0 ) { // if just solved
        play_complete_sound();
        puzzle[4][3].Right = 1;
    }
    if ( !( puzzle_is_failed() || puzzle_is_solved() ) ) {
        timer_frames_left--;
        score--;
    } else {
        $("#" + MAIN_CANVAS_NAME).unbind('click');
        if ( first_failed_frame && puzzle_is_failed() ) {
            play_surge_sound();
            score = 0;
            submitted = true;
            first_failed_frame = false;
        }
    }
    if ( Math.floor( Math.random()*201 ) == 0 ) {
        play_shock_sound();
    }
    draw();
}

function add_time() {
    timer_frames_left = timer_frames_left + TIME_ADDED > TIMER_LIMIT ?
        TIMER_LIMIT : timer_frames_left + TIME_ADDED;
}

function find_moving_piece() {
    for ( var row = 0; row < SIDE_LENGTH; row++ )
        for ( var col = 0; col < SIDE_LENGTH; col++ ) {
            var piece = puzzle[row][col];
            if ( piece != null && piece.moving != 0 )
                return { r: row, c: col };
        }
    return null;
}

function draw() {
    bgctx.drawImage( bgimg, 0, 0, 1000, 700 );
    draw_puzzle();
    draw_score();
    if ( puzzle_is_solved() ) {
        ctx.drawImage( img, 400, 400, 100, 100, 400, 400, 100, 100 );

        draw_high_scores();
    
        bgctx.fillStyle     = 'rgba(200,200,200,0.8)';
        bgctx.font          = 'bold 30px san-serif';
        bgctx.textBaseline  = 'top';
        bgctx.fillText ( 'Well done!', 835, 275 );
        bgctx.lineWidth     = 2;
        bgctx.fillRect( 824, 200, 70, 35 );
        bgctx.fillRect( 914, 200, 70, 35 );

        bgctx.fillStyle     = 'black';
        bgctx.font          = 'bold 20px san-serif';
        bgctx.fillText ( 'Retry' , 925, 208 );
        if ( submitted ) bgctx.fillStyle = 'rgba(0,0,0,0.5)';
        bgctx.fillText ( 'Submit', 828, 208 );

        bgctx.fillStyle     = 'rgb(200,200,200)';
        bgctx.font          = 'bold 30px san-serif';
        bgctx.fillText( name_buffer + "_", 820, 155 );

    } else if ( puzzle_is_failed() ) {
        bgctx.fillRect( 824, 200, 70, 35 );
        bgctx.fillRect( 914, 200, 70, 35 );

        bgctx.fillStyle     = 'black';
        bgctx.font          = 'bold 20px san-serif';
        bgctx.fillText ( 'Retry' , 925, 208 );
        bgctx.fillStyle = 'rgba(0,0,0,0.5)';
        bgctx.fillText ( 'Submit', 828, 208 );

        bgctx.fillStyle     = 'rgba(200,200,200,0.8)';
        bgctx.font          = 'bold 20px san-serif';
        bgctx.fillText( 'GAME OVER', 840, 275 );

        draw_high_scores();
    } else {
        bgctx.fillStyle     = 'rgb(200,200,200)';
        bgctx.font          = 'bold 25px san-serif';
        bgctx.fillText( "Time until next", 821, 190 );
        bgctx.fillText( "   power surge ", 821, 218 );
        draw_surge_timer();
    } 
}

function draw_score() {
    var x = 959;
    var y = 44;
    for ( var i = 1; i < 6; i++ ) {
        var num = Math.floor( (score % Math.pow(10,i)) / Math.pow(10,i-1) );
        bgctx.drawImage( scorefontimg, CHAR_WIDTH * num, 0, CHAR_WIDTH,
                         CHAR_HEIGHT, x, y, CHAR_WIDTH, CHAR_HEIGHT );
        x -= 35;
    }
}

function draw_surge_timer() {
    var h = timer_frames_left * TIMER_PIXEL_DELTA;
    bgctx.fillStyle = "black";
    bgctx.fillRect( 875, 575, TIMER_WIDTH, -TIMER_HEIGHT );
    bgctx.fillStyle = "rgb(139,0,0)";
    bgctx.fillRect( 875, 575, TIMER_WIDTH, -h );
    bgctx.drawImage( timeroverlayimg, 870, 570 - TIMER_HEIGHT );
}

function draw_puzzle() {
    ctx.clearRect( 0, 0, 500, 500 );
    bgctx.drawImage( bgimg, 0, 0, 1000, 700 );
    for ( var row = 0; row < SIDE_LENGTH; row++ )
        for ( var col = 0; col < SIDE_LENGTH; col++ ) {
            var piece = puzzle[row][col];
            if ( piece != null )
                ctx.drawImage( img, piece.sx, piece.sy, 100, 100, piece.x,
                    piece.y, 100, 100 );
        }   
}

function draw_high_scores() {
    var x = 820;
    var y = 400;

    bgctx.fillStyle     = 'rgb(200,200,200)';
    bgctx.textBaseline  = 'top';

    bgctx.font          = 'bold 30px san-serif';
    bgctx.fillText( 'TOP 10', 853, 365 );
    bgctx.font          = 'bold 20px san-serif';

    for ( s in hiscores ) {
        if ( y >= 700 ) { break; }
        bgctx.fillText( hiscores[s], x, y );
        y += 30;
    }
}

function get_high_scores() {
    hiscores.length = 0;
    $.post( "../db/Leaderboards.php",
        { "op":"getGameScores", "gameID":"circuit" },
        function( data ) {
            for ( row in data ) {
                hiscores.push( data[row].username + " - " + data[row].score );
            }
            console.log( hiscores );
        }, "json" );
}

function spark( x, y ) {
    this.xcoord   = x;
    this.ycoord   = y;
    this.frame    = 0;
    this.maxframe = Math.floor( Math.random()*151 + 30 );
}

function puzzle_is_failed() {
    return timer_frames_left == 0;
}

function stop_going_back_damnit( e ) {
    e = e || window.event;
    if ( e.keyCode == 8 ) return false;
}

document.onkeydown = stop_going_back_damnit;
