var shock_sounds = [ new Audio("media/shock1.ogg"),
                     new Audio("media/shock2.ogg"),
                     new Audio("media/shock3.ogg"),
                     new Audio("media/shock4.ogg"),
                     new Audio("media/shock5.ogg"),
                     new Audio("media/shock6.ogg"),
                     new Audio("media/shock7.ogg") ];
var button_sound = new Audio("media/slidingclick.ogg");
var done_sound   = new Audio("media/puzzlecomplete.ogg");
var surge_sound  = new Audio("media/powersurge.wav");

function play_shock_sound() {
    var r = Math.floor( Math.random() * shock_sounds.length );
    shock_sounds[ r ].play();
    shock_sounds[ r ].currentTime = 0;
}

function play_sliding_sound() {
    button_sound.play();
    button_sound.currentTime = 0;
}

function play_complete_sound() {
    done_sound.play();
    done_sound.currentTime = 0;
}

function play_surge_sound() {
    surge_sound.play();
    surge_sound.currentTime = 0;
}
