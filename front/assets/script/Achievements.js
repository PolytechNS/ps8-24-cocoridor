

const ImageRef = {
    Fermier : "/assets/img/FermierJ2.png",
    Poulet : "/assets/img/PouletJ1.png",
    Fermier2 : "/assets/img/Fermier2.webp",
    Poulet2 : "/assets/img/Poulet2.png",
    MatchMakingGif : "/assets/img/polos.gif",
    Colonel : "/assets/img/colonel.png",
    ChickenNugget : "/assets/img/chickenNuggets.png",
    PouletRobot : "/assets/img/PouletRobot.png",
    FermierRobot : "/assets/img/FermierRobot.png"
}

export const Achievements = {
    // Friends
    newFriend : {key:"newFriend",title:"un nouveau au poulailler",value:"Avoir un amis"},
    FiveFriends : {key:"FiveFriends",title:"Le poulailler s'agrandit!",value:"Avoir 5 amis"},
    TenFriends : {key:"TenFriends",title:"Le plus grand de tout les poulailler",value:"Avoir 10 amis"},
    
    SendMessage : {key:"SendMessage",title:"Correspondance",value:"Envoyer un message a un amis"},

    // Features
    RetrieveGame : {key:"RetrieveGame",title:"Il est temps d'en finir",value:"Reprendre une partie"},

    // General Games
    OneGame : {key:"OneGame",title:"mes premiers pas",value:"Faire votre premiere partie",reward:[null,ImageRef.Colonel]},
    TenGames : {key:"TenGames",title:"en terrain connu",value:"Faire 10 parties"},
    FiftyGames : {key:"FiftyGames",title:"",value:"Faire 50 parties"},
    TwoHundredFiftyGames : {key:"TwoHundredFiftyGames",title:"",value:"Faire 250 parties"},
    OneThousandGames : {key:"OneThousandGames",title:"",value:"Faire 1000 parties"},

    OneVictory : {key:"OneVictory",title:"Premiere victoire",value:"gagner votre premiere partie",reward:[ImageRef.ChickenNugget,null]},
    TenVictory : {key:"TenVictory",title:"Les victoires ne sont plus si rare que ca",value:"gagner 10 parties"},
    FiftyVictory : {key:"FiftyVictory",title:"Les victoires s'accumulent",value:"gagner 50 parties"},
    TwoHundredFiftyVictory : {key:"Une montagne de victoires",title:"",value:"gagner 250 parties"},
    OneThousandVictory : {key:"Le plus victorieux de tous",title:"",value:"gagner 1000 parties"},

    // Ai Play
    AiGamePlayed : {key:"AiGamePlayed",title:"",value:"Jouer une partie contre une IA",reward:[null, ImageRef.FermierRobot]},
    AiGameFive : {key:"AiGameFive",title:"L'IA ne remplacera pas nos emplois",value:"Jouer 5 parties contre une IA"},
    AiGameTwentyFive : {key:"AiGameTwentyFive",title:"Terminator ne me fait plus peur",value:"Jouer 25 parties contre une IA"},

    WinAiGame : {key:"WinAiGame",title:"pas tres bien huilé",value:"Gagner une partie contre une IA",reward:[ImageRef.PouletRobot,null]},

    // Friend Play
    FriendGamePlayed : {key:"FriendGamePlayed",title:"",value:"Jouer une partie contre un amis"},
    FriendGameFive : {key:"FriendGameFive",title:"",value:"Jouer 5 partie contre un amis"},
    FriendGameTwentyFive : {key:"FriendGameTwentyFive",title:"",value:"Jouer 25 partie contre un amis"},
    
    WinFriendGame : {key:"WinFriendGame",title:"Non, pas sur le champs de bataille",value:"Gagner une partie contre un amis"},

    // Online Play
    OnlineGamePlayed : {key:"OnlineGamePlayed",title:"Premier affrontement",value:"Jouer une partie classé"},
    OnlineGameTen : {key:"OnlineGameTen",title:"Je ne lache rien!",value:"Jouer 10 parties classé"},
    OnlineGameHundred : {key:"OnlineGameHundred",title:"Ils auront peur de moi",value:"Jouer 100 parties classé"},
    
    WinOnlineGame : {key:"WinOnlineGame",title:"Il ferait mieux de rentrer dans sa ferme",value:"Gagner une partie en ligne"},

    // ELO
    EloOneTOneH: {key:"EloOneTOneH",title:"Chef du poulailler",value:"Atteindre 1100 de Elo"},
    EloOneTTwoH: {key:"EloOneTTwoH",title:"Maitre de la basse-cours",value:"Atteindre 1200 de Elo"},
    EloOneTThreeH: {key:"EloOneTThreeH",title:"Gouverneur de la ferme",value:"Atteindre 1300 de Elo"},
    EloOneTFourH: {key:"EloOneTFourH",title:"Souverain des elevages",value:"Atteindre 1400 de Elo"},
    EloOneTFiveH: {key:"EloOneTFiveH",title:"Empereur des volailles",value:"Atteindre 1500 de Elo"},

    // In-Game
    BerlinWall : {key:"BerlinWall",title:"Non, ca va pas recommencer",value:"Essayer d'enfermer le joueur adverse"},
    JumpOverPlayer : {key:"JumpOverPlayer",title:"Manoeuvre experimentale",value:"Sauter au dessus du joueur adverse"},
    ReactToTheGame : {key:"ReactToTheGame",title:"Il suffit de connaitre son adversaire",value:"Envoyez une emote pendant une partie"}
}