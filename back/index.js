const back = require("./logic/back.js")
const adaptator = require("./logic/aiAdaptator.js")
const profile = require("./logic/profile.js")
// The http module contains methods to handle http queries.
const http = require('http')
// Let's import our logic.
const fileQuery = require('./queryManagers/front.js')
const apiQuery = require('./queryManagers/api.js')


/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */


const server=http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

const { Server } = require("socket.io");
const {CurrentPlayer} = require("./logic/back");
const io = new Server(server);



// Fonction qui attend le délai spécifié (en millisecondes)

function sleep(milliseconds) {
    const startTime = Date.now();
    while (Date.now() - startTime < milliseconds) {}
}

//Fonction qui envoie une requête à la db pour enregistrer l'état d'une partie

async function saveGame(gameState,gameId=null){
    let res = null;
    if(gameId===null){
        res = await apiQuery.createGame(gameState);
    }else{
        res = await apiQuery.updateGame(gameState, gameId);
    }
    return res;
}

async function getGame(idGame){
    let res = null;
    res = await apiQuery.getGame(idGame);
    return res;
}

io.of("/api/AIgame").on('connection', (socket) => {
    let playerList
    let gameState
    let turnNb
    let gameId
    let saveId
    let myId
    let bot = profile.PlayerAccount.Bot()
    socket.on('newGame',async (playerId) => {
        gameId = back.init();
        myId = playerId
        let me = await apiQuery.getUser(myId)
        if(!me){
            me = profile.PlayerAccount.Guest();
            myId = me.username;
        }
        await back.setPlayers(gameId,[me , bot])
        playerList= back.getPlayerList(gameId);
        bot = getPlayerInList(playerList,bot.username)
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId) me = playerList[i];
            else if(playerList[i].difficulty!=null){
                let aiMove = await adaptator.setup(bot.modifier, back.setUpBoard(gameId,bot).Positions);
                
                back.placePlayer(gameId, bot.getid(), aiMove);
            }
        }
        socket.emit("choosePos",back.setUpBoard(gameId,me),playerList,turnNb = back.getTurnNb(gameId),back.getNbWalls(playerList));

    })
    socket.on("start",async ()=>{
        console.log("start")
        playerList = back.getPlayerList(gameId);
        turnNb = back.getTurnNb(gameId);
        let gameState = back.getGameState(gameId);
        saveId = await saveGame(gameState);
        let me = null
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("launch", back.setUpBoard(gameId,me).Board, turnNb, gameId, nbWalls);
        if(playerList[turnNb%playerList.length].getid()==bot.getid()){
            let aiBoard = back.BoardFor(gameId, bot);
            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard,bot.getid());
                if(computemove.vertical===undefined) {
                    moved = back.execMove(gameId, bot, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(gameId, bot,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(gameId, bot.getid());
                    await adaptator.correction(move);
                }
            }
            aiBoard = back.BoardFor(gameId, bot);
            await adaptator.updateBoard(aiBoard,bot.getid());
            gameState = back.getGameState(gameId);
            turnNb = back.getTurnNb(gameId);
            saveGame(gameState, saveId);
            newBoard = back.BoardFor(gameId, me);
            let nbWalls = back.getNbWalls(playerList);
            socket.emit("updateBoard", newBoard, turnNb,nbWalls);
        }

    })
    socket.on('retrieveGame', async (playerId,idGame) => {
        saveId = idGame;
        myId = playerId;
        let game = await getGame(saveId);
        gameState =await back.retrieveGame(game.gameState);
        gameId = gameState.id;
        playerList = back.getPlayerList(gameId);
        turnNb = back.getTurnNb(gameId);
        let me = null
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==playerId){
                me = playerList[i];
                continue;
            }
            if(playerList[i].difficulty!=null){
                bot = playerList[i];
                continue;
            }
        }
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("launch", back.BoardFor(gameId,me), turnNb, gameId, nbWalls);
        if(playerList[turnNb%playerList.length].getid()==bot.getid()){
            console.log("here")
            let aiBoard = back.BoardFor(gameId, bot);
            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard,bot.getid());
                if(computemove.vertical===undefined) {
                    moved = back.execMove(gameId, bot, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(gameId, bot,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(gameId, bot.getid());
                    await adaptator.correction(move);
                }
            }
            aiBoard = back.BoardFor(gameId, bot);
            await adaptator.updateBoard(aiBoard,bot.getid());
            gameState = back.getGameState(gameId);
            turnNb = back.getTurnNb(gameId);
            await saveGame(gameState, saveId);
            let newBoard = back.BoardFor(gameId, me);
            let nbWalls = back.getNbWalls(playerList);
            socket.emit("updateBoard", newBoard, turnNb,nbWalls);
        }
    })
    socket.on('move', async (move) => {
        console.log('x: ' + move.x, 'y: ' + move.y);
        playerList = back.getPlayerList(gameId)
        let me = playerList[turnNb%playerList.length]
        if(me.getid()!=myId){console.log("CANCEL");return;};
        
        let actionDone = back.execMove(gameId, me, move.x, move.y);
        if (actionDone) {
            gameState = back.getGameState(gameId);
            await saveGame(gameState, saveId);
            let newBoard = back.BoardFor(gameId, me);
            turnNb = back.getTurnNb(gameId);
            let nbWalls = back.getNbWalls(playerList);
            socket.emit("updateBoard", newBoard,turnNb,nbWalls);
            let winners = back.GameWinner(gameId);
            if (winners != null && winners.length!=0) {
                socket.emit("endGame", winners);
            }
                let aiBoard = back.BoardFor(gameId, bot);
                {
                    sleep(1000)
                    let moved
                    let computemove = await adaptator.computeMove(aiBoard,bot.getid());
                    if(computemove.vertical===undefined) {
                        moved = back.execMove(gameId, bot, computemove.x, computemove.y);
                    }else{
                        moved = back.execWall(gameId, bot,computemove.x,computemove.y,computemove.vertical);
                    }
                    if (!moved) {
                        let move = back.execRandomMove(gameId, bot.getid());
                        await adaptator.correction(move);
                    }
                }
                aiBoard = back.BoardFor(gameId, bot);
                await adaptator.updateBoard(aiBoard,bot.getid());
                turnNb = back.getTurnNb(gameId);
                gameState = back.getGameState(gameId);
                await saveGame(gameState, saveId);
                newBoard = back.BoardFor(gameId, me);
                nbWalls = back.getNbWalls(playerList);
                socket.emit("updateBoard", newBoard, turnNb, nbWalls);

            
        }
        let winners = back.GameWinner(gameId);
        if (winners != null && winners.length!=0) {
            socket.emit("endGame", winners);

        }


    });

    socket.on('wall', async (wall) => {
        console.log('x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        let me = getPlayerInList(playerList, myId)
        let actionDone = back.execWall(gameId,me, wall.x, wall.y, wall.vertical);


        if (actionDone) {
            turnNb = back.getTurnNb(gameId);
            gameState = back.getGameState(gameId);
            saveGame(gameState, saveId);
            let me = getPlayerInList(playerList, myId)
            bot = getPlayerInList(playerList, bot.getid())
            let newBoard = back.BoardFor(gameId,me);
            let nbWalls = back.getNbWalls(playerList);
            socket.emit("updateBoard", newBoard, turnNb, nbWalls);
            let winners = back.GameWinner(gameId);
            if (winners != null && winners.length!=0) {
                socket.emit("endGame", winners);
            }
            let aiBoard = back.BoardFor(gameId,bot);

            {
                sleep(1000)
                let moved
                let computemove = await adaptator.computeMove(aiBoard,bot.getid());
                if(computemove.vertical===undefined) {
                    moved = back.execMove(gameId,bot, computemove.x, computemove.y);
                }else{
                    moved = back.execWall(gameId,bot,computemove.x,computemove.y,computemove.vertical);
                }
                if (!moved) {
                    let move = back.execRandomMove(gameId,bot.getid());
                    await adaptator.correction(move);
                    console.log("correction : " + move);
                }else{
                    console.log("IA move")
                    console.log(computemove)
                }
            }
            aiBoard = back.BoardFor(gameId,bot);
            await adaptator.updateBoard(aiBoard,bot.getid());
            gameState = back.getGameState(gameId);
            turnNb = back.getTurnNb(gameId);
            saveGame(gameState, saveId);
            newBoard = back.BoardFor(gameId,me)
            nbWalls = back.getNbWalls(playerList);
            socket.emit("updateBoard", newBoard,turnNb, nbWalls)
        }

        let winners = back.GameWinner(gameId);
        if (winners != null) {
            socket.emit("endGame", winners);
        }
    });
    socket.on("gameSetup",(move)=>{
        let me = null;
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }

        if(me.OnTile!=null) return;
        let coords = {X:move.x,Y:move.y}
        if(me.start.find((e)=>e.X==coords.X&&e.Y==coords.Y) ==null )return;
        playerList= back.getPlayerList(gameId);

        back.placePlayer(gameId,myId,coords);
    
        for(let player of playerList){
            if(player.OnTile==null) return;
        }
        socket.emit("playersReady", gameId)
    })

});

io.of("/api/Localgame").on('connection', (socket) => {

    let playerArePlaced = false
    let playerList;
    let turnNb;
    let gameId;
    socket.on("newGame",async (myId)=>{
        console.log("CONNEXION")
        console.log(myId)
        gameId = back.init()
        let me = await apiQuery.getUser(myId)
        console.log(me)
        let me2 = profile.PlayerAccount.Guest()
        if(!me)me = profile.PlayerAccount.Guest();
        else me2.skins = me.skins
        me2.username = me.username+"-2"
        back.setPlayers(gameId, [me,me2],true)

        playerList = back.getPlayerList(gameId)
    //Placer les joueurs
    //Placer les joueurs
    console.log(playerList)
        //Placer les joueurs
    console.log(playerList)

        turnNb = back.getTurnNb(gameId)
        socket.emit("choosePos",back.setUpBoard(gameId,playerList[0]), playerList, turnNb, back.getNbWalls(playerList));

    })

    socket.on('move', (move) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        let actionDone = back.execMove(gameId,back.CurrentPlayer(gameId),move.x,move.y);
        if(actionDone){
            let newBoard = back.BoardFor(gameId,back.CurrentPlayer(gameId));
            socket.emit("updateBoard",newBoard,back.getTurnNb(gameId),back.getNbWalls(playerList));
        }
        let winners = back.GameWinner(gameId);
        if(winners !=null){
            socket.emit("endGame", winners);
        }


    });

    socket.on('wall', (wall) => {
        console.log('x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        if(!playerArePlaced)return;
        let actionDone = back.execWall(gameId,back.CurrentPlayer(gameId),wall.x,wall.y,wall.vertical)
        
        if(actionDone){
            let newBoard = back.BoardFor(gameId,back.CurrentPlayer(gameId));
            socket.emit("updateBoard",newBoard,back.getTurnNb(gameId),back.getNbWalls(playerList));
        }
        let winners = back.GameWinner(gameId);
        if(winners !=null){
            socket.emit("endGame", winners);
        }
    });

    socket.on("gameSetup",(move)=>{
        for (let i=0;i<playerList.length;i++){
            if(playerList[i].OnTile==null){
                back.placePlayer(gameId,playerList[i].getid(),{X:move.x,Y:move.y})
                
                if(playerList[playerList.length-1].OnTile!=null){
                    playerArePlaced = true;
                    let nbWalls = back.getNbWalls(playerList);
                    socket.emit("launch",back.BoardFor(gameId,playerList[turnNb%playerList.length]),turnNb,nbWalls)
                    return;
                }

                let newBoard = back.setUpBoard(gameId,playerList[i+1])
                socket.emit("choosePos",newBoard,playerList,turnNb,back.getNbWalls(playerList));
                return;
            }
        }
    })

});

let players = [];
let connectedPlayers = {}
io.of("/api/1vs1").on('connection', async (socket) => {
    let myId;
    let playerList;
    let gameState;
    let turnNb;
    let gameId;
    let saveId;
    let winners;
    socket.on('sendInfo', async (playerid) => {
        myId = playerid;

        console.log("playerid: "+playerid)
        let alreadyIn = false;
        for(let i = 0; i < players.length; i++){
            if(players[i].id === playerid){
                players[i].socket.disconnect();
                players[i].socket = socket;
                alreadyIn = true;
            }
        }
        let myElo = await apiQuery.getUserElo(myId);
        let gamePlayers = [];
        if(!alreadyIn){
            let newPlayer = {id: playerid, socket: socket, elo: myElo};
            players.push(newPlayer);
            gamePlayers.push(newPlayer);
        }
        for(let player of players) {
            if(player.id !== myId){
                if(player.elo >=myElo-200 || player.elo <= myElo+200){
                    gamePlayers.push(player);
                    if(gamePlayers.length >= 2) break;
                }
            }
        }
        console.log("gamePlayers: "+gamePlayers)

        if (gamePlayers.length >= 2) {
            let playersForGame = [];
            for(let i = 0; i < gamePlayers.length; i++){
                for(let j = 0; j < players.length; j++){
                    if(players[j] === gamePlayers[i]){
                        playersForGame.push(players[j].id);
                        players.splice(j,1);
                    }
                }
            }
            console.log("playersForGame: "+playersForGame)
            gameId = back.init();
            for(let i = 0; i < gamePlayers.length; i++){
                gamePlayers[i].socket.join('room'+gameId);
            }
            {
                let res = []
                for(let playerId of playersForGame){
                    res.push(await apiQuery.getUser(playerId));
                }
                playersForGame = res
            }
            playerList = back.setPlayers(gameId, playersForGame);
            playerList = back.getPlayerList(gameId);
            connectedPlayers[gameId] = [];
            for(let player of playerList){
                connectedPlayers[gameId].push(player);
            }
            turnNb = back.getTurnNb(gameId);
            gameState = back.getGameState(gameId);
            saveId = await saveGame(gameState);
            io.of("/api/1vs1").to('room'+gameId).emit("initChoosePos",gameId)
        }
    });
    socket.on('move', async (move) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        playerList = back.getPlayerList(gameId);
        if(myId ===  playerList[turnNb%playerList.length].getid()) {
            
            let me = null;
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execMove(gameId, me, move.x, move.y);
            if (actionDone) {
                gameState = back.getGameState(gameId);
                await saveGame(gameState, saveId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('wall', async (wall) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        playerList = back.getPlayerList(gameId);
        if(myId === playerList[turnNb%playerList.length].getid()) {
            
            let me = null;
            playerList= back.getPlayerList(gameId);
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execWall(gameId, me, wall.x, wall.y, wall.vertical)
            if (actionDone) {
                gameState = back.getGameState(gameId);
                await saveGame(gameState, saveId);
                io.of("/api/1vs1").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('update', async () => {

        turnNb = back.getTurnNb(gameId);
        
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        let newBoard = back.BoardFor(gameId,me);
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("updateBoard", newBoard,turnNb,nbWalls);
        winners = back.GameWinner(gameId);
        if (winners != null && winners.length!=0) {
            socket.emit("endGame", winners);
        }
    });
    
    socket.on('gameSetup', async ( move) => {

        let me = null;
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        if(me.OnTile!=null) return;
        let coords = {X:move.x,Y:move.y}
        if(me.start.find((e)=>e.X==coords.X&&e.Y==coords.Y) ==null )return;
        playerList= back.getPlayerList(gameId);

        back.placePlayer(gameId,myId,coords);
    
        for(let player of playerList){
            if(player.OnTile==null) return;
        }
        io.of("/api/1vs1").to('room' + gameId).emit("playersReady", gameId);
        
        
    });
    socket.on('start',async ()=>{
        back.getTurnNb(gameId)
        back.getPlayerList(gameId);
        back.getBoard(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }

        let newBoard = back.BoardFor(gameId,me)
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("launch",newBoard, turnNb,nbWalls);
    })
    socket.on('askForInitPos', async (gameID) => {
        gameId=gameID;
        turnNb = back.getTurnNb(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
            }
        }
        socket.emit("choosePos", back.setUpBoard(gameId,me),playerList,turnNb,back.getNbWalls(playerList));
    });
    socket.on('message', (message,playerName) => {
        io.of("/api/1vs1").to('room' + gameId).emit("message", message,playerName);
    });
    socket.on("disconnect",()=>{

        if(!connectedPlayers.hasOwnProperty(gameId))return;
        for (let i = 0; i < connectedPlayers[gameId].length; i++) {
            if (connectedPlayers[gameId][i].getid() === myId) {
                connectedPlayers[gameId].splice(i, 1);
                i--; 
            }
        }
        console.log(playerList);
        connectedPlayers[gameId].filter((e)=>e.getid() != myId )
        if(connectedPlayers[gameId].length==0){
            if (winners != null && winners.length!==0) {
                console.log("here");
                console.log(playerList);
                for(let winner of winners){
                    for(let player of playerList){
                        if(player.getid()!==winner){
                            updateElo(winner,player.getid());
                        }
                    }
                }
            }
            back.deleteGame(gameId);
        }
    })
});

io.of("/api/friendChat").on('connection', async (socket) => {
    socket.on('join', async (nameUser, friendName) => {
        socket.join(nameUser + friendName);
        socket.join(friendName + nameUser);
    });
    socket.on('newMessage', async (nameUser, friendName) => {
        io.of("/api/friendChat").to(nameUser + friendName).emit('updateMessage');
    });
});

function getPlayerInList(playerList , id){
    for(let i=0;i<playerList.length;i++){
        if(playerList[i].getid()==id){
            return playerList[i];
        }
    }
}
async function updateElo(winner, loser) {
    let winnerElo = await apiQuery.getUserElo(winner);
    let loserElo = await apiQuery.getUserElo(loser);
    let k = 20;
    let expected = loserElo / winnerElo;
    let value = Math.floor(k*expected);
    if (value <= 0) {
        value = 1;
    }
    let newWinner = winnerElo+value;
    let newLoser = loserElo-value;
    console.log("newWinner : ", newWinner, " newLoser : ", newLoser)
    await apiQuery.updateElo(winner, newWinner);
    await apiQuery.updateElo(loser, newLoser);
}

let playersRooms = {}
let friendMatch = {}
io.of("/api/1vs1Friend").on('connection', async (socket) => {
    let myId;
    let playerList;
    let turnNb;
    let gameId;
    let saveId;
    let winners;
    let gameState;
    socket.on('sendRoomInfo', async (playerid,friendid) => {
        myId = playerid;
        //faire une clé unique pour chaque room ( quel que soit l'ordre des joueurs)
        let roomKey = myId>=friendid?myId+friendid:friendid+myId;
        playersRooms[roomKey] = playersRooms[roomKey] || [];
        let alreadyIn = false;
        for( let player  in playersRooms[roomKey]){
            if(player.id === playerid){
                players.socket.disconnect();
                players.socket = socket;
                alreadyIn = true;
            }
        }
        if(!alreadyIn){playersRooms[roomKey].push({id:playerid,socket:socket});}
        if(playersRooms[roomKey].length >= 2){
            let playersForGame = [];
            let gamePlayers = [];
            for(let i = 0; i < playersRooms[roomKey].length; i++){
                playersForGame.push(playersRooms[roomKey][i].id);
                gamePlayers.push(playersRooms[roomKey][i]);
                playersRooms[roomKey].splice(i,1);
                i--;
            }
            gameId = back.init();
            for(let i = 0; i < gamePlayers.length; i++){
                gamePlayers[i].socket.join('room'+gameId);
            }
            {
                let res = []
                for(let playerId of playersForGame){
                    res.push(await apiQuery.getUser(playerId));
                }
                playersForGame = res
            }
            playerList = back.setPlayers(gameId, playersForGame);
            playerList = back.getPlayerList(gameId);
            friendMatch[gameId] = [];
            for(let player of playerList){
                friendMatch[gameId].push(player);
            }
            turnNb = back.getTurnNb(gameId);
            gameState = back.getGameState(gameId);
            saveId = await saveGame(gameState);
            io.of("/api/1vs1Friend").to('room'+gameId).emit("initChoosePos",gameId)
        }
    });
    socket.on('move', async (move) => {
        console.log('playerID: ' + move.playerID, 'x: ' + move.x, 'y: ' + move.y);
        playerList = back.getPlayerList(gameId);
        if(myId ===  playerList[turnNb%playerList.length].getid()) {

            let me = null;
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execMove(gameId, me, move.x, move.y);
            if (actionDone) {
                gameState = back.getGameState(gameId);
                await saveGame(gameState, saveId);
                io.of("/api/1vs1Friend").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('wall', async (wall) => {
        console.log('playerID: ' + wall.playerID, 'x: ' + wall.x, 'y: ' + wall.y, 'vertical: ' + wall.vertical);
        playerList = back.getPlayerList(gameId);
        if(myId === playerList[turnNb%playerList.length].getid()) {

            let me = null;
            playerList= back.getPlayerList(gameId);
            for(let i=0;i<playerList.length;i++){
                if(playerList[i].getid()==myId){
                    me = playerList[i];
                    continue;
                }
            }
            let actionDone = back.execWall(gameId, me, wall.x, wall.y, wall.vertical)
            if (actionDone) {
                gameState = back.getGameState(gameId);
                await saveGame(gameState, saveId);
                io.of("/api/1vs1Friend").to('room' + gameId).emit("moved", gameId);
            }
        }else{
            console.log("not your turn");
        }
    });
    socket.on('update', async () => {

        turnNb = back.getTurnNb(gameId);

        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        let newBoard = back.BoardFor(gameId,me);
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("updateBoard", newBoard,turnNb,nbWalls);
        winners = back.GameWinner(gameId);
        if (winners != null && winners.length!=0) {
            socket.emit("endGame", winners);
        }
    });

    socket.on('gameSetup', async ( move) => {

        let me = null;
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }
        if(me.OnTile!=null) return;
        let coords = {X:move.x,Y:move.y}
        if(me.start.find((e)=>e.X==coords.X&&e.Y==coords.Y) ==null )return;
        playerList= back.getPlayerList(gameId);

        back.placePlayer(gameId,myId,coords);

        for(let player of playerList){
            if(player.OnTile==null) return;
        }
        io.of("/api/1vs1Friend").to('room' + gameId).emit("playersReady", gameId);


    });
    socket.on('start',async ()=>{
        back.getTurnNb(gameId)
        back.getPlayerList(gameId);
        back.getBoard(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
                continue;
            }
        }

        let newBoard = back.BoardFor(gameId,me)
        let nbWalls = back.getNbWalls(playerList);
        socket.emit("launch",newBoard, turnNb, nbWalls);
    })
    socket.on('askForInitPos', async (gameID) => {
        gameId=gameID;
        turnNb = back.getTurnNb(gameId);
        let me = null;
        playerList= back.getPlayerList(gameId);
        let playerListId = []
        for(let i=0;i<playerList.length;i++){
            if(playerList[i].getid()==myId){
                me = playerList[i];
            }
            playerListId.push(playerList[i].getid())
        }
        socket.emit("choosePos", back.setUpBoard(gameId,me),playerListId,turnNb,back.getNbWalls(playerList));
    });
    socket.on('message', (message,playerName) => {
        io.of("/api/1vs1Friend").to('room' + gameId).emit("message", message,playerName);
    });
    socket.on("disconnect",()=>{

        if(!friendMatch.hasOwnProperty(gameId))return;
        for (let i = 0; i < friendMatch[gameId].length; i++) {
            if (friendMatch[gameId][i].getid() === myId) {
                friendMatch[gameId].splice(i, 1);
                i--;
            }
        }
        console.log(playerList);
        friendMatch[gameId].filter((e)=>e.getid() != myId )
        if(friendMatch[gameId].length==0){
            back.deleteGame(gameId);
        }
    })
});



