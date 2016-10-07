var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var id = ["",""];
var index = 0;
var playersReady = 0;

var started = false;
var pos1 = 225;
var pos2 = 225;

var ballX = 400;
var ballY = 225;

var ballXVel = 0;
var ballYVel = 0;

while (ballXVel == 0 || ballYVel == 0){
    ballXVel = (Math.floor(Math.random() * 3) -1) * 4;
    ballYVel = (Math.floor(Math.random() * 3) -1) * 4;
}

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + "/public/html/index.html");
});

io.on('connection', function(socket){
    console.log("User connected");
	if(id[0] != "" && id[1] != ""){
		index = 2;
	}
    io.emit('setIndex', index);
    console.log("The new user now has the index: " + index);
    index++;
    if(index > 1){
        index = 0;
    }
    
    socket.on('registerUser', function(playerId, index){
        id[index] = playerId;
        console.log("player " + index + " changed their id to: " + playerId);
        console.log(id);
        io.emit('playerJoined', playerId, index);
    });
    
    socket.on('ready', function(index){
        io.emit('ready', index);
        playersReady++;
        if(playersReady >= 2){
            io.emit('startGame');
            started = true;
        }
    });

	socket.on('leave', function(index){
		id[index] = "";
		io.emit('updateLobby', index);
	});
    
    socket.on('posUpdate', function(pos, index){
        if(index == 0){
            pos1 = pos;
        }else{
            pos2 = pos;
        }
    })
    
    socket.on('disconnect', function(){
        console.log("User disconnected");
    });
});

http.listen(3000, function(){
    console.log('Server running and listening!');
});

function update(){
    if(!started){
        return;
    }
    
    ballX += ballXVel;
    ballY += ballYVel;
    
    if(ballY <= 10 || ballY >= 440){
        ballYVel *= -1;
    }
    if(ballX <= 10){
        if(pos1 > ballY - 50 && pos1 < ballY + 50){
            ballXVel *= -1;
        }else{
            io.emit('won', 1);
            resetGame();
        }
    }
    else if(ballX >= 790){
        if(pos2 > ballY - 50 && pos2 < ballY + 50){
            ballXVel *= -1;
        }else{
            io.emit('won', 0);
            resetGame();
        }
    }
    io.emit('posUpdate', pos1, pos2, ballX, ballY);
}

setInterval(update, 10);

function resetGame(){
    started = false;
    playersReady = 0;
    
    ballX = 400;
    ballY = 225;
    
    pos1 = 225;
    pos2 = 225;
    
    while (ballXVel == 0 || ballYVel == 0){
        ballXVel = (Math.floor(Math.random() * 3) -1) * 4;
        ballYVel = (Math.floor(Math.random() * 3) -1) * 4;
    }
}
