var canvas1 = document.getElementById("gameScreen");
var ctx = canvas1.getContext("2d");
var gameWidth = 640;
var gameHeight = 360;
// menu active?
var menu = true;

//character class (or rather player)
class character {
    constructor(x, y, texture, width, height) {
        this.x = x; // positions on x,y axis
        this.y = y; //
        this.vx = 0; // speed on x,y axis
        this.vy = 0; //
        this.speed = 2;
        this.width = width;
        this.height = height;
        this.face = 1; // direction player is facing 1-2-3-4 clockwise, where 1 is top
        this.state = 1; // is character busy?
        // 0 - busy - doesnt accept any inputs
        // 1 - standing
        // 2 - walking
        this.texture = new Image();
        this.texture.src = texture;
        this.loc = 0;
    }
}
p1 = new character(10*16,15*16,"p1.png",10,16);


// camera object describing where camera should point to //
var camera = {
    x: 0.0,
    y: 0.0,
    width: gameWidth,
    height: gameHeight,
    x_offset: 0.0,
    y_offset: 0.0,
    //min and max for camera so it wont move near the edges of the map //

}




///////////////////////////////////////////////////////////////////////////
///////////////////////////// GAME WORLD //////////////////////////////////
///////////////////////////////////////////////////////////////////////////


//obstacle for a logic grid
// x, y coords on current board, not global world
class obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

//each route should have same scheme.
//routes are just a slices of maps in a current world, each tileset etc are preloaded with world in
//init_world function
var route1 = {
    name: "route1",
    tileset: "tileset1.png",
    cols: 4,
    rows: 5,
    tsize: 16,
    x_offset: 13,
    y_offset: 0,
    tiles: [
        1,2,3,2,
        4,5,6,0,
        1,5,2,0,
        2,4,5,2,
        1,6,2,1
    ],
    logic_grid: [new obstacle(0, 0, 16, 16)],
    getTile: function (col, row) {
        return this.tiles[row * this.cols + col];
    }

};
var route2 = {
    name: "route2",
    tileset: "true_frameset.png",
    cols: 20,
    rows: 13,
    tsize: 16,
    x_offset: 4,
    y_offset: 5,
    tiles: [
        11,11,11,11,11,11,1,1,1,2,10,10,4,1,1,1,11,11,11,11,
        11,11,11,11,11,1,1,1,1,2,10,10,4,1,1,1,11,11,11,11,
        11,11,11,11,1,18,19,1,6,12,10,10,4,1,1,1,11,11,11,11,
        11,11,11,11,1,20,21,1,2,10,10,10,4,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,1,2,10,10,14,8,1,1,1,11,11,11,11,
        11,11,11,11,1,17,1,1,2,10,10,4,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,6,12,10,10,4,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,10,4,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,14,8,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,4,1,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,4,1,1,1,17,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,4,1,1,1,1,1,11,11,11,11,
        11,11,11,11,1,1,1,2,10,10,4,1,1,1,1,1,11,11,11,11,
    ],
    logic_grid: [
        new obstacle(14*16+2, 10*16+5, 12, 9),
        new obstacle(5*16, 2*16+7, 32, 25),
        new obstacle(5*16+2, 5*16+5, 12, 9)
    ],
    getTile: function (col, row) {
        return this.tiles[row * this.cols + col];
    }
};

// each world should consist of a selected routes to be rendered and tested for collisions
var world1 = new Array(route1, route2);
// current world can be changed if needed for loading.
// ITLL ALWAYS BE USED FOR RENDERING
var current_world = world1;
// lists of tilesets images, alt are used to indentify which tileset are which
var tilesets = new Array();



function init_world(world) {
    let tilesets_list = new Array(); // just a list of what we need to load
    let i = 0; // number of elements in an array-1 (indexes start with 0)
    let j = 0;
    for(board of world) {
        if(tilesets_list.length === 0) {tilesets_list[i++] = board.tileset;}
        for (loaded_ts of tilesets_list) {
            if (board.tileset !== loaded_ts) {tilesets_list[i++] = board.tileset;} // add tilesets to load
        }
    }
    for(j=0 ; j<i ; j++) {
        var current_img = new Image();
        current_img.src = tilesets_list[j]; // src will change to adequate path, so we need to store name somewhere else
        current_img.alt = tilesets_list[j]; // keep the name of the tileset as an alt
        tilesets[j] = current_img;
    }
}


/*
function anim_char(char_obj, start_index, anim_length, anim_timestamp) {

    if(Date.now()-anim_timestamp >= anim_length) {
        let r_index = 0;                                               // same notation as in gameLoop to keep it consistent
        let c_index = start_index * char_obj.width - char_obj.width;   // r - row, c - column
        while (c_index > char_obj.texture) {
            r_index += char_obj.height;
            c_index -= Math.floor(char_obj.texture / char_obj.width) * char_obj.width;
        }
        anim_timestamp = Date.now();
    }
}
*/

function draw_current_world() {
    for (board of current_world) {
        var board_ts = null;
        for (tileset of tilesets) {
            if (tileset.alt === board.tileset) {
                board_ts = tileset;
            }
        }

        //sprawdzic jaki tileset i go ustawic, zeby pozniej z niego wczytywac;
        for (let c = 0; c < board.cols; c++) {
            for (let r = 0; r < board.rows; r++) {
                let tile = board.getTile(c, r);
                if (tile !== 0) { // 0 = empty tile
                    let r_index = 0; // we need something to store the row index of our tile
                    let c_index = tile * board.tsize - board.tsize; // same for column, but instead of beggining with 0,
                                                                    // we'll begin with whole index minus one tile, cause
                                                                    // tile indexed with 0 is reserved for an empty tile.
                                                                    // if the index is too big for the row, we'll substract
                                                                    // row width, and add one c_index.
                    while (c_index >= board_ts.width) {
                        r_index += board.tsize;
                        c_index -= Math.floor(board_ts.width / board.tsize) * board.tsize;
                    }
                    // calc the position of indexed tiles
                    ctx.drawImage(
                        board_ts, // tileset source
                        c_index, // lets get the right indexed tile from a tileset
                        r_index, // offsets for x and y calc'd above
                        board.tsize, // size for our tile
                        board.tsize, // and since were using square tiles itll be same value 2 times
                        (c * board.tsize) + (board.x_offset * board.tsize) - camera.x, // x_offset of a tile
                        (r * board.tsize) + (board.y_offset * board.tsize) - camera.y, // y_offset of a tile
                        board.tsize,    // scaling of the image on the actual board
                        board.tsize     // itll be same as tileset for now, but may be a subject to change later
                    );
                }
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////  COLLISIONS ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// to be changed to return direction of the collision with the object

function handle_collisions(player) {
    //check which board the players in
    // stores the information about which wall of the obstacle did character hit
    // 0 - top, 1 - right and so on clockwise
    let col_dir = {};
    for(board of current_world) {
        if (player.x >= board.x_offset*board.tsize && player.x <= board.cols*board.tsize+board.x_offset*board.tsize &&
            player.y >= board.y_offset*board.tsize && player.y <= board.rows*board.tsize+board.y_offset*board.tsize) {
            player.loc = board;
        }
    }

    // iterate over all the level obstacles and check for collisions
    if(player.loc.logic_grid !== undefined) {
        for (obj of player.loc.logic_grid) {

            //////////////////////////////////////////////////////////////////////////////////////////////
            // CURRENTLY CHECKING ACTUAL POSITION INSTEAD OF NEXT WITH + player.vx - BEWARE THE RESULTS //
            //////////////////////////////////////////////////////////////////////////////////////////////
            // Actually last position can be useful as to check from which side the collision happend   //
            // We can check if it overlapped on the previous position too and if so, then the other one //
            // must be the one causing the collision. May be useful on the cusps                        //
            //////////////////////////////////////////////////////////////////////////////////////////////

            //check for regular case of overlapping
            col_dir[5] = 0;
            if(player.x-(player.loc.x_offset*player.loc.tsize) >= obj.x && player.x-(player.loc.x_offset*player.loc.tsize) < obj.x + obj.width) { col_dir[0] = 1; col_dir[2] = 1 } else { col_dir[0] = 0; col_dir[2] = 0; col_dir[5] += 1}
            if(player.x+player.width-(player.loc.x_offset*player.loc.tsize) > obj.x && player.x+player.width-(player.loc.x_offset*player.loc.tsize) <= obj.x + obj.width) { col_dir[1] = 1; col_dir[3] = 1 } else { col_dir[1] = 0; col_dir[3] = 0; col_dir[5] += 1}

            // if the char and obstacle does not overlap, check if the obstacle is "inside" the character
            // we dont even need to check all the cusps - 2 is enough to confirm we didnt get a hit
            if(col_dir[5] === 2) {
                if (
                    ( obj.x > player.x-(player.loc.x_offset*player.loc.tsize) && obj.x < player.x+player.width-(player.loc.x_offset*player.loc.tsize) )
                    &&
                    ( obj.x+obj.width > player.x-(player.loc.x_offset*player.loc.tsize) && obj.x+obj.width < player.x+player.width-(player.loc.x_offset*player.loc.tsize) )
                )
                {
                    col_dir[1] = 1; col_dir[3] = 1; col_dir[0] = 1; col_dir[2] = 1;
                }
            }

            // check the y-axis now
            // easier to use some flag to determine whatever we've found anything on y axis - well use col_dir[4] for this as this is unused anyway
            col_dir[4] = 0;
            if ( player.y-(player.loc.y_offset*player.loc.tsize) >= obj.y && player.y-(player.loc.y_offset*player.loc.tsize) < obj.y + obj.height ) { col_dir[0] += 1; col_dir[1] += 1 ; col_dir[4] = 1;} else {col_dir[4] += 1}
            if ( player.y+player.height-(player.loc.y_offset*player.loc.tsize) > obj.y && player.y+player.height-(player.loc.y_offset*player.loc.tsize) <= obj.y + obj.height ) { col_dir[2] += 1; col_dir[3] += 1;} else {col_dir[4] += 1}
            //if the char and obstacle does not overlap, check if the obstacle is "inside" the character
            if(col_dir[4] === 2) {
                if (
                    ( obj.y > player.y-(player.loc.y_offset*player.loc.tsize) && obj.y < player.y+player.height-(player.loc.y_offset*player.loc.tsize) )
                    &&
                    ( obj.y+obj.height > player.y-(player.loc.y_offset*player.loc.tsize) && obj.y+obj.height < player.y+player.height-(player.loc.y_offset*player.loc.tsize) )
                )
                {
                    col_dir[1] += 1; col_dir[3] += 1; col_dir[0] += 1; col_dir[2] += 1;
                }
            }

            if(col_dir[0] === 2 && col_dir[1] === 2 && col_dir[2] < 2 && col_dir[3] < 2 ) {
                //top from player hitbox collision
                player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                player.vy = 0;
            } else if (col_dir[0] < 2 && col_dir[1] < 2 && col_dir[2] === 2 && col_dir[3] === 2 ) {
                //bottom from player hitbox collision
                player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                player.vy = 0;
            } else if (col_dir[0] === 2 && col_dir[1] < 2 && col_dir[2] === 2 && col_dir[3] < 2 ) {
                //left from player hitbox collision
                player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                player.vx = 0;
            } else if (col_dir[0] < 2 && col_dir[1] === 2 && col_dir[2] < 2 && col_dir[3] === 2 ) {
                //right from player hitbox collision
                player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                player.vx = 0;
            } else if (col_dir[0] === 2 && col_dir[1] < 2 && col_dir[2] < 2 && col_dir[3] < 2 ) {
                //top-left corner is colliding - check the distance to the bottom-right corner on x and y axis and determine which is shorter

                // which distance is shorter? in this case we check if y-axis is closer than x-axis
                if(player.vx !== 0 && player.vy !== 0) {
                    if (Math.sqrt(Math.pow(player.x - obj.x - obj.width - (player.loc.x_offset * player.loc.tsize), 2)) > Math.sqrt(Math.pow(player.y - obj.y - obj.height - (player.loc.y_offset * player.loc.tsize), 2))) {
                        //cusp closer to the bottom
                        player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                        player.vy = 0;
                    } else {
                        //cusp closer to the right
                        player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                        player.vx = 0;
                    }
                } else if (player.vx === 0) {
                    // collision on y-axis
                    player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                    player.vy = 0;
                } else {
                    // collision on x-axis
                    player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                    player.vx = 0;
                }
            } else if (col_dir[0] < 2 && col_dir[1] === 2 && col_dir[2] < 2 && col_dir[3] < 2 ) {
                //top-right corner
                if(player.vx !== 0 && player.vy !== 0) {
                    if (Math.sqrt(Math.pow(player.width + player.x - obj.x - (player.loc.x_offset * player.loc.tsize), 2)) > Math.sqrt(Math.pow(player.y - obj.y - obj.height - (player.loc.y_offset * player.loc.tsize), 2))) {
                        //closer to bottom
                        player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                        player.vy = 0;
                    } else {
                        //closer to left
                        player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                        player.vx = 0;
                    }
                } else if (player.vx === 0) {
                    // collision on y-axis
                    player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                    player.vy = 0;
                } else {
                    // collision on x-axis
                    player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                    player.vx = 0;
                }
            } else if (col_dir[0] < 2 && col_dir[1] < 2 && col_dir[2] === 2 && col_dir[3] < 2 ) {
                //bottom-left corner
                // mozliwe, ze nie lapie "ostatniego" pixela i przechodzi od razu do else tego na dole
                if(player.vx !== 0 && player.vy !== 0) {
                    if (Math.sqrt(Math.pow(player.x - obj.x - obj.width - (player.loc.x_offset * player.loc.tsize), 2)) > Math.sqrt(Math.pow(player.y + player.height - obj.y - (player.loc.y_offset * player.loc.tsize), 2))) {
                        // closer to top
                        player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                        player.vy = 0;
                    } else {
                        //closer to right
                        player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                        player.vx = 0;

                    }
                } else if (player.vx === 0) {
                    // collision on y-axis
                    player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                    player.vy = 0;
                } else {
                    // collision on x-axis
                    player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                    player.vx = 0;
                }
            } else if (col_dir[0] < 2 && col_dir[1] < 2 && col_dir[2] < 2 && col_dir[3] === 2 ) {
                //bottom-right corner
                if(player.vx !== 0 && player.vy !== 0) {
                    if (Math.sqrt(Math.pow(player.x + player.width - obj.x - (player.loc.x_offset * player.loc.tsize), 2)) > Math.sqrt(Math.pow(player.y + player.height - obj.y - (player.loc.y_offset * player.loc.tsize), 2))) {
                        //closer to top
                        player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                        player.vy = 0;
                    } else {
                        //closer to left
                        player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                        player.vx = 0;
                    }
                } else if (player.vx === 0) {
                    // collision on y-axis
                    player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                    player.vy = 0;
                } else {
                    // collision on x-axis
                    player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                    player.vx = 0;
                }
            } else if (col_dir[0] === 2 && col_dir[1] === 2 && col_dir[2] === 2 && col_dir[3] === 2 ) {
                //obj is entirely inside player hitbox
                //or
                //player is inside the hitbox area entirely

                //just check whatever edge the object is closest to from its center and determine which velocity is needed to be cut



                //obj inside player case
                if(col_dir[4] === 2 && col_dir[5] === 2) {
                    //top edge
                    col_dir[0] = Math.sqrt(Math.pow(obj.y + (obj.height / 2) - player.y + (player.loc.y_offset * player.loc.tsize), 2));
                    //right edge
                    col_dir[1] = Math.sqrt(Math.pow(player.x + player.width - obj.x + (obj.width / 2) - (player.loc.x_offset * player.loc.tsize), 2));
                    //bot edge
                    col_dir[2] = Math.sqrt(Math.pow(player.y + player.height - obj.y + (obj.height / 2) - (player.loc.y_offset * player.loc.tsize), 2));
                    //left edge
                    col_dir[3] = Math.sqrt(Math.pow(obj.x + (obj.width / 2) - player.x + (player.loc.x_offset * player.loc.tsize), 2));
                    let min = col_dir[0];
                    let min_index = 0;
                    for (let i = 0; i < 4; i++) {
                        if (col_dir[i] < min) {
                            min = col_dir[i];
                            min_index = i;
                        }
                    }
                    switch (min_index) {
                        case 0:
                            //closest to top edge
                            player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                            player.vy = 0;
                            break;
                        case 1:
                            //closest to right edge
                            player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                            player.vx = 0;
                            break;
                        case 2:
                            //closest to bot edge
                            player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                            player.vy = 0;
                            break;
                        case 3:
                            //closest to left edge
                            player.x = obj.x + obj.width + (player.loc.x_offset * player.loc.tsize);
                            player.vx = 0;
                            break;
                    }
                } else {
                    //player inside hitbox case
                    //top edge
                    col_dir[0] = Math.sqrt(Math.pow(player.y + (player.height/2) - obj.y - (player.loc.y_offset * player.loc.tsize), 2));
                    //right edge
                    col_dir[1] = Math.sqrt(Math.pow(obj.x + obj.width - player.x - (player.width/2) + (player.loc.x_offset * player.loc.tsize), 2));
                    //bot edge
                    col_dir[2] = Math.sqrt(Math.pow(obj.y + obj. height - player.y - (player.height/2) + (player.loc.y_offset * player.loc.tsize), 2));
                    //left edge
                    col_dir[3] = Math.sqrt(Math.pow(player.x + (player.width/2) - obj.x - (player.loc.x_offset * player.loc.tsize), 2));
                    let min = 0;
                    for(let i = 1 ; i < 4 ; i++) {
                        if(col_dir[i] < min) {min = i}
                    }
                    switch(min) {
                        case 0:
                            //closest to top edge
                            player.y = obj.y - player.height + (player.loc.y_offset * player.loc.tsize);
                            player.vy = 0;
                            break;
                        case 1:
                            //closest to right edge
                            player.x = obj.x +obj.width + (player.loc.x_offset * player.loc.tsize);
                            player.vx = 0;
                            break;
                        case 2:
                            //closest to bot edge
                            player.y = obj.y + obj.height + (player.loc.y_offset * player.loc.tsize);
                            player.vy = 0;
                            break;
                        case 3:
                            //closest to left edge
                            player.x = obj.x - player.width + (player.loc.x_offset * player.loc.tsize);
                            player.vx = 0;
                            break;
                    }
                }
            }
        }
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  DIALOGUE BOXES ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// to be added - portrait rendering
// a bit of chaos in the names of the classes etc due to poor planning, to be clarified later...


//just a small class so we have easier access to portrait with
class portrait {
    constructor(port_name, image, height, width) {
        this.name = port_name;
        this.image = image;
        this.height = height;
        this.width = width;
    }
}

// actually just a chat line class, not a dialogue
class dialogue {
    constructor(port_name, port_index, side, text, text_size, text_color) {
        this.port_name = port_name; // port = portrait. name - portrait name
        this.port_index = port_index; // index if few portraits are loded in one sprite
        this.side = side; // which side of the screen should portrait appear at
        this.text = text; // chat line
        this.text_size = text_size;
        this.text_color = text_color;
    }
}


//dialogue object
var dialogue_1 = {
    frame_src: "frame2.png",
    frame_height: 16,
    // format is name, height, width
    // we dont want to create new objects so we wont have problems with dupes, and instead while initiating world,
    // well load all the needed portraits into the the unique objects.
    portrait_list: [
        "mario1.png", 100, 100,
        "mario1-2.png", 200, 200,
        "mario1-4.png", 300, 300,
        "mario1-3.png", 400, 400
    ],
    //structure of this table in index of the portrait + dialoque that'll appear near it
    // indexes from the list start with 1 - 0 means no portrait will be shown
    text: [
        new dialogue("mario1.png", 0, 0, "Hello, its me mario klshdf kjsdhg kjsd kshdf oiwe bmwer isdf ,msdf wmb,wer iwe rm,sd fwe rlkweri wsdfm,b sd dfgklj dkl f kldf glkd flk dflk fjgd lfkgjd flgjkd fglkjd lkgjd fg ldkddg lgdkgd glkdj fglkjd fglkjdf gkldjf gkljd fkj d klgjdfgklj df gkldj fgkldjf glkdjf glkdj fglkdjf gldkjf gldkj gldkfjg dklfjg dlkjgkljd fkj d klgjdfgklj df gkldj fgkldjf glkdjf glkdj fglkdjf gldkjf gldkj gldkfjg dklfjg dlkj Hello, its me mario klshdf kjsdhg kjsd kshdf oiwe bmwer isdf ,msdf wmb,wer iwe rm,sd fwe rlkweri wsdfm,b sd dfgklj dkl f kldf glkd flk dflk fjgd lfkgjd flgjkd fglkjd lkgjd fg ldkddg lgdkgd glkdj fglkjd fglkjdf gkl Hello, its me mario klshdf kjsdhg kjsd kshdf oiwe bmwer isdf ,msdf wmb,wer iwe rm,sd fwe rlkweri wsdfm,b sd dfgklj dkl f kldf glkd flk dflk fjgd lfkgjd flgjkd fglkjd lkgjd fg ldkddg lgdkgd glkdj fglkjd fglkjdf gkl Hello, its me mario klshdf kjsdhg kjsd kshdf oiwe bmwer isdf ,msdf wmb,wer iwe rm,sd fwe rlkweri wsdfm,b sd dfgklj dkl f kldf glkd flk dflk fjgd lfkgjd flgjkd fglkjd lkgjd fg ldkddg lgdkgd glkdj fglkjd fglkjdf gkl ", 30, "red"),
        new dialogue("mario3.png", 0, 1, "Hello, its me mario2", 50, "blue")
    ]

};

// frameset loading function to be added
let frameset1 = new Image();
frameset1.src = dialogue_1.frame_src;

// class for storing any information we need to store while rendering text boxes, so we dont need to calc it
// every frame, which would be a bit troublesome
class text_box_animation {
    constructor(dialogue) {
        this.dialogue = dialogue;
        this.frames_elapsed = 0; // frames elapsed since last drawing on screen
        this.dialog_line = 0;    // used as an indicator which dialog line is playing rn
        this.text_letter = 0;      // indicator for textboxes what letter from a current text we are on, so we can write
                            // letter by letter
        this.textbox_line = 0;
        // coords for frame drawing
        this.y_start = 0.7*gameHeight-dialogue.frame_height; // first block to be spawned on y-axis
        this.frame_height = Math.floor((gameHeight-(0.7*gameHeight))/dialogue.frame_height); // height in blocks
        this.y_end = this.y_start + this.frame_height*dialogue.frame_height; // last col well be drawing at
        this.frame_width = Math.floor(gameWidth/dialogue.frame_height); // width in blocks
        this.x_start = (gameWidth-(this.frame_width*dialogue.frame_height))/2 // first block to be spawned on x-axis
        this.x_end = this.x_start + this.frame_width*dialogue.frame_height - dialogue.frame_height; // last row well be drawing at
        this.current_text = {}; // current chat line split into lines to be rendered easier
        this.text_x_start = this.x_start + 2*dialogue.frame_height; // coords telling where we should start and stop drawing
        this.text_width = this.frame_width*dialogue.frame_height - 4*dialogue.frame_height; // max width to draw
        this.text_y_start = this.y_start + 2*dialogue.frame_height + dialogue.text[this.dialog_line].text_size/1.33;
        this.text_height = gameHeight - this.text_y_start; // max height to draw
        this.lines = Math.floor(this.text_height/(dialogue.text[this.dialog_line].text_size*1.0));
        this.current_line_num = 0; // which line are we drawing now? (letter by letter)
        this.lines_to_draw = 0; // cumulative lines to draw in current chat line
        this.current_dialog_lines = null; //at which line of our textbox are we writing rn
        this.skip = false; // have we skipped something in current spacebar click?
        this.finished = false; // have all the chat lines been drawn?
    }
}

//function to init dialogue objects
var abc = new text_box_animation(dialogue_1);


// a function to split chat line into separate lines to draw
function split_lines_for_textbox(dlg) {
    ctx.font = dlg.dialogue.text[dlg.dialog_line].text_size+"px serif";
    let tmp = dlg.dialogue.text[dlg.dialog_line].text.split(' ');
    let last_index = tmp.length;
    let current_index = 0;
    let line_num = -1;
    var line = {};
    // line_num < 20 - just to be sure we dont go into infinite loop
    while(current_index < last_index && line_num < 20) {
        line_num += 1;
        line[line_num] = tmp[current_index];
        current_index += 1;
        while (ctx.measureText(line[line_num] + tmp[current_index] + ' ').width < dlg.text_width && current_index < last_index) {
            line[line_num] += ' ' + tmp[current_index];
            current_index += 1;
        }
    }
    dlg.lines_to_draw = line_num;
    delete dlg.current_dialog_lines;
    dlg.current_dialog_lines = line;
}

// initial split to be included in some init function
split_lines_for_textbox(abc);


// unfortunate name, its just rendering the whole dialogue
function init_dialogue(dlg) {
    let i = 0; // just a tmp for iteration
    let j = 0;
    let frameset = frameset1;
    // frameset to be decided later from init frameset func
    /*for (frame of frameset_list) {
        if (frame.alt === dialogue.frame_src) {frameset = frame;}
    }*/

    var current_text = dlg.dialogue.text[dlg.dialog_line].text;


    ctx.font = dlg.dialogue.text[dlg.dialog_line].text_size+"px serif";
    ctx.fillStyle = dlg.dialogue.text[dlg.dialog_line].text_color;

    // draw background for the text
    for(j = 1; j < dlg.frame_width-1; j++) {
        for (i = 1; i < dlg.frame_height; i++) {
            //top bar
            ctx.drawImage(
                frameset,
                dlg.dialogue.frame_height * 6,
                0,
                dlg.dialogue.frame_height,
                dlg.dialogue.frame_height,
                dlg.x_start + j * dlg.dialogue.frame_height,
                dlg.y_start + i * dlg.dialogue.frame_height,
                dlg.dialogue.frame_height,
                dlg.dialogue.frame_height
            );
        }
    }


    // for some reason text writing begins in bottom left corner(?), so we'll need to take that into account while calc
    // text_y_start and available lines
    for(i = 0 ; i < dlg.current_line_num ; i++) {
        ctx.fillText(dlg.current_dialog_lines[i], dlg.text_x_start, dlg.text_y_start+dlg.dialogue.text[dlg.dialog_line].text_size*i);
    }
        //draw a letter by letter
        ctx.fillText(dlg.current_dialog_lines[i].slice(0,dlg.text_letter), dlg.text_x_start, dlg.text_y_start+dlg.dialogue.text[dlg.dialog_line].text_size*i);

    if(dlg.current_line_num <= dlg.lines_to_draw && dlg.text_letter < dlg.current_dialog_lines[dlg.current_line_num].length) {
        dlg.text_letter += 1;
    } else if(dlg.current_line_num < dlg.lines_to_draw && dlg.text_letter === dlg.current_dialog_lines[dlg.current_line_num].length) {
        dlg.current_line_num += 1;
        dlg.text_letter = 0;
    } else if(dlg.current_line_num === dlg.lines_to_draw) {
        if(keyState[32] === true && dlg.skip === false) {
            if(dlg.dialog_line < dlg.dialogue.text.length-1) {
                // we need to adjust line height etc in order to fit new text_size if different from the previous etc
                dlg.dialog_line += 1;
                split_lines_for_textbox(dlg);
                dlg.skip = true;
                dlg.current_line_num = 0;
                dlg.text_letter = 0;
            } else {
                dlg.finished = true;
            }
        }
    }

    if(keyState[32] === true && dlg.skip === false) {
        while(dlg.current_line_num < dlg.lines_to_draw) {
            dlg.current_line_num += 1;
        }
        dlg.skip = true;
    }

    if(keyState[32] === false) {
        dlg.skip = false;
    }



    // lets draw the corners first
    //left-top corner
    ctx.drawImage (
        frameset,
        0,
        0,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
        dlg.x_start,
        dlg.y_start,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
    );

    //right-top corner
    ctx.drawImage (
        frameset,
        dlg.dialogue.frame_height,
        0,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
        dlg.x_end,
        dlg.y_start,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
);

    //right-bot corner
    ctx.drawImage (
        frameset,
        dlg.dialogue.frame_height*2,
        0,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
        dlg.x_end,
        dlg.y_end,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
);

    //left-bot corner
    ctx.drawImage (
        frameset,
        dlg.dialogue.frame_height*3,
        0,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
        dlg.x_start,
        dlg.y_end,
        dlg.dialogue.frame_height,
        dlg.dialogue.frame_height,
);

    //now lets draw the remaining lines connecting the corners
    //top and bottom bars
    for(i = 1 ; i < dlg.frame_width-1 ; i++) {
        //top bar
        ctx.drawImage (
            frameset,
            dlg.dialogue.frame_height*4,
            0,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.x_start+i*dlg.dialogue.frame_height,
            dlg.y_start,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
        );
        //bottom bar
        ctx.drawImage (
            frameset,
            dlg.dialogue.frame_height*4,
            0,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.x_start+i*dlg.dialogue.frame_height,
            dlg.y_end,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height
        );
    }

    //left and right lines
    for(i = 1 ; i < dlg.frame_height ; i++) {
        //top bar
        ctx.drawImage (
            frameset,
            dlg.dialogue.frame_height*5,
            0,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.x_start,
            dlg.y_start+i*dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height
        );
        //bottom bar
        ctx.drawImage (
            frameset,
            dlg.dialogue.frame_height*5,
            0,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.x_end,
            dlg.y_start+i*dlg.dialogue.frame_height,
            dlg.dialogue.frame_height,
            dlg.dialogue.frame_height
        );
    }


    // and now we need to draw to the portrait
    // and if statement for empty one

}




////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  MENU OBJECTS  ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

class button {
    constructor(name) {
        this.name = name;
        // 0 not highligthed, not clicked, nothing, 1 - highlighted, 2 - clicked(?)
        this.state = 0;
    }
}
var mainmenu = {
    buttons: [new button("Start"), new button("Options"), new button("Quit")],
    framesElapsed: 0
}

function render_menu() {
    let i = 0;
    ctx.font = "30px Verdana";
    ctx.fillStyle = "white";
    for(button of mainmenu.buttons) {
        if(button.state === 1) {i++;}
    }
    if(i === 0) {mainmenu.buttons[0].state = 1;}
    i = 0;
    if(keyState[40] === true && mainmenu.framesElapsed > 8) {
        for(button of mainmenu.buttons) {
            if(button.state === 0) {
                i++;
            } else {
                button.state = 0;
                i += 1;
                if(i < mainmenu.buttons.length) {
                    mainmenu.buttons[i].state = 1;
                    break;
                } else {
                    mainmenu.buttons[0].state = 1;
                }
            }
        }
        mainmenu.framesElapsed = 0;
    } else if(keyState[38] === true && mainmenu.framesElapsed > 8) {
        for(button of mainmenu.buttons) {
            if(button.state === 0) {
                i++;
            } else {
                button.state = 0;
                i -= 1;
                if(i >= 0) {
                    mainmenu.buttons[i].state = 1;
                    break;
                } else {
                    mainmenu.buttons[mainmenu.buttons.length-1].state = 1;
                }
            }
        }
        mainmenu.framesElapsed = 0;
    }
    i = 0;
    for(button of mainmenu.buttons) {
        if(button.state === 1) {
            ctx.fillStyle = "red";
            ctx.fillText(button.name, gameWidth / 2 - (ctx.measureText(button).width / 3), (gameHeight / 2 - 15) - ((mainmenu.buttons.length-1) * 22.5) + i * 45);
            i++;
        } else {
            ctx.fillStyle = "white";
            ctx.fillText(button.name, gameWidth / 2 - (ctx.measureText(button).width / 3), (gameHeight / 2 - 15) - ((mainmenu.buttons.length-1) * 22.5) + i * 45);
            i++;
        }
    }
    mainmenu.framesElapsed += 1;
    i = 0;
    if(keyState[13] === true) {
        for(button of mainmenu.buttons) {
            if(button.state === 1) {button.state = 2;}
        }
    }
    if(mainmenu.buttons[0].state === 2) {
        init_world(world1);
        menu = false;
        for(button of mainmenu.buttons) {
            button.state = 0;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  register key inputs  /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


var keyState = {};
window.addEventListener("keydown", (e) => {
    keyState[e.keyCode] = true;
});
window.addEventListener("keyup", (e) => {
    keyState[e.keyCode] = false;
});

function handle_player_mov(player) {

    if (player.state !== 0) {
        if (keyState[38] === true && keyState[39] === true) {
            player.vx = p1.speed;
            player.vy = -p1.speed;
        } else if (keyState[39] === true && keyState[40] === true) {
            player.vx = p1.speed;
            player.vy = p1.speed;
        } else if (keyState[40] === true && keyState[37] === true) {
            player.vx = -p1.speed;
            player.vy = p1.speed;
        } else if (keyState[37] === true && keyState[38] === true) {
            player.vx = -p1.speed;
            player.vy = -p1.speed;
        } else if (keyState[39] === true) {
            player.vx = p1.speed;
            player.vy = 0;
        } else if (keyState[38] === true) {
            player.vy = -p1.speed;
            player.vx = 0;
        } else if (keyState[40] === true) {
            player.vy = p1.speed;
            player.vx = 0;
        } else if (keyState[37] === true) {
            player.vx = -p1.speed;
            player.vy = 0;
        } else {
            player.vx = 0;
            player.vy = 0;
        }
        update_pos(player);
        handle_collisions(player);
    }
}



function update_pos(player) {
    player.x += player.vx;
    player.y += player.vy;
}





window.requestAnimationFrame(gameLoop);
function gameLoop() {

    ctx.clearRect(0, 0, gameWidth, gameHeight);

    if(!menu) {

        handle_player_mov(p1);

        // actuallly centering around player, but if free cam is wanted there need to be if statement to check if we have
        // free cam and change the formula for calculating the camera.x and camera.y
        // also need to change player rendering(?)
        // calc camera based on the position after collisions cause other ways can cause problems
        camera.x = p1.x + p1.width / 2 - gameWidth / 2;
        camera.y = p1.y + p1.height / 2 - gameHeight / 2;

        draw_current_world();


        // only method to run a dialogue for now - to be included in npc class in the future
        //init_dialogue(abc);

        //draw player
        ctx.drawImage(p1.texture, 0, 0, p1.width, p1.height, p1.x - camera.x, p1.y - camera.y, p1.width, p1.height);
    } else {
        render_menu();
    }
    window.requestAnimationFrame(gameLoop);
}