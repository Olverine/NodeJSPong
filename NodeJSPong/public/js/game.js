var socket = io();
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext('2d');
var originX = canvas.width / 2;
var originY = canvas.height / 2;

var nameInput = document.getElementsByTagName("input")[0];
var lobby = document.getElementById("lobby");
var lobbycontrols = document.getElementById("lobbycontrols");
var gameOver = document.getElementById("fin");

var pos1 = canvas.height / 2;
var pos2 = canvas.height / 2;

var ballX = canvas.width / 2;
var ballY = canvas.height / 2;

var id;
var playerIndex;

var move = 0;
var started = false;

canvas.style.display = "none";
//lobby.style.display = "none";
lobbycontrols.style.display = "none";
gameOver.style.display = "none";

function registerUser (){
	if(nameInput.value == ""){
		alert("You need a username to play!");
		return;
	}
    id = nameInput.value
    socket.emit("registerUser", id, playerIndex);
    console.log("Registering user: " + nameInput.value);
    document.getElementById("reg").style.display = "none";
    lobby.style.display = "block";
	lobbycontrols.style.display = "block";
}

function setReady(){
    socket.emit('ready', playerIndex);
	lobbycontrols.style.display = "none";
}

function leaveGame(){
	socket.emit('leave', playerIndex);
    document.getElementById("reg").style.display = "block";
	lobbycontrols.style.display = "none";
}

socket.on('ready', function(index){
    li = lobby.getElementsByTagName("li")[index];
    li.style.color = "green";
});

socket.on('updateLobby', function(index){
    li = lobby.getElementsByTagName("li")[index];
    li.textContent = "";
});

socket.on('playerJoined', function(playerId, index){
    li = lobby.getElementsByTagName("li")[index];
    li.textContent = playerId;
});

socket.on('setIndex', function(index){
    if(playerIndex == null){
        playerIndex = index;
        console.log("playerIndex set to: " + playerIndex);
		if(index == 2){
			lobby.style.display = "none";
    		document.getElementById("reg").style.display = "none";
			canvas.style.display = "block";
		}
    }
});

socket.on('startGame', function(){
    lobby.style.display = "none";
    canvas.style.display = "block";
    started = true;
});

socket.on('won', function(i){
    var msg;
    if(i == playerIndex){
        msg = "You won!!";
    }else{
        msg = "You lost!!";
    }
    gameOver.style.display = "block";
    gameOver.getElementsByTagName("h1")[0].textContent = msg;
    started = false;
    li = lobby.getElementsByTagName("li")[0];
    li.style.color = "inherit";
    li = lobby.getElementsByTagName("li")[1];
    li.style.color = "inherit";
});

socket.on('posUpdate', function(p1, p2, bx, by){
	if(playerIndex == 0){
		pos2 = p2;
	}else if(playerIndex == 1){
		pos1 = p1;
	}else{
		pos1 = p1;
		pos2 = p2;
	}
    ballX = bx;
    ballY = by;
});

function update(){
    if(!started){
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.moveTo(5, pos1 - 50);
    context.lineTo(5, pos1 + 50);
    context.lineWidth = 2;
    context.strokeStyle = (playerIndex == 0 ? "#FF8900" : "#FFFFFF");
    context.stroke();
    
    context.beginPath();
    context.moveTo(canvas.width - 5, pos2 - 50);
    context.lineTo(canvas.width - 5, pos2 + 50);
    context.lineWidth = 2;
    context.strokeStyle = (playerIndex == 0 || !(playerIndex < 2) ? "#FFFFFF" : "#FF8900");
    context.stroke();
    
    context.beginPath();
    context.arc(ballX, ballY, 10, 0, 2 * Math.PI);
    context.lineWidth = 2;
    context.strokeStyle = "white";
    context.stroke();
    
    if(playerIndex == 0){
        pos1 += move * 8;
        socket.emit('posUpdate', pos1, 0);
    }else if(playerIndex == 1){
        pos2 += move * 8;
        socket.emit('posUpdate', pos2, 1);
    }
}

setInterval(update, 20);

function reset(){
    lobby.style.display = "block";
    canvas.style.display = "none";
    gameOver.style.display = "none";
	if(playerIndex <= 1)
	lobbycontrols.style.display = "block";
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 38) {
        move = -1;
    }
    else if(event.keyCode == 40) {
        move = 1;
    }
});

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 38 || event.keyCode == 40) {
        move = 0;
    }
});
