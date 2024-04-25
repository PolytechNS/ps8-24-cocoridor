const db = require("../database/database.js")
const apiQuery = require("../queryManagers/api.js")

class PlayerAccount {

    static Bot(difficulty = 1){
      let bot = new PlayerAccount()
      bot.username = "Terminator"
      bot.skins = {
          color : null,
          wallColor : null,
          humanSkin : ImageRef.FermierRobot,
          beastSkin : ImageRef.PouletRobot,
          wallSkin : "",
          humanSkins : [ImageRef.FermierRobot],
          beastSkins : [ImageRef.PouletRobot],
          wallSkins : []
      }
      bot.difficulty = difficulty
      bot.fakePlayer = true
      return bot;
    }

    static Guest(){
        let guest = new PlayerAccount()
        guest.username = "Guest"
        guest.skins = {
            color : null,
            wallColor : null,
            humanSkin : ImageRef.Fermier2,
            beastSkin : ImageRef.Poulet2,
            wallSkin : "",
            humanSkins : [ImageRef.Fermier2],
            beastSkins : [ImageRef.Poulet2],
            wallSkins : []
        }
        guest.fakePlayer = true
        return guest;
    }
    
    static createUser(email,username,password) {
        let user = {
            email : email,
            password : password,
            username : username,
            friends : {
                request:[],
                list:[]
            },
            achievements : [],
            savedGames : [],
            skins : {
                color : null,
                wallColor : null,
                humanSkin : ImageRef.Fermier,
                beastSkin : ImageRef.Poulet,
                wallSkin : "",
                humanSkins : [ImageRef.Fermier,ImageRef.Fermier2],
                beastSkins : [ImageRef.Poulet,ImageRef.Poulet2],
                wallSkins : []
            },
            stats : {
                elo : 1000,
                OnlinePlay : 0,
                OnlinePlayVictory : 0,
                
                LocalPlay : 0,
                
                AiPlay : 0,
                AiPlayVictory : 0,

                FriendPlay : 0,
                FriendPlayVictory : 0,
            },
            convs : {
                new : [],
                all : []
            }

        }
        return db.createUser(user);
    }

    static retrieveUser(accountId){
        db.getUser(accountId).then( (data) => {
            return new PlayerAccount(data);
        })
    }
/**
 * 
 * @param {{id:Number, email:String, password:String, username:String, friends:{list:Number[],request:Number[]},achievements:Any[],savedGames:Number,skins:{color:Color,wallColor:Any,humanSkin:ImageRef,beastSkin:ImageRef,wallSkin:ImageRef,humanSkins:ImageRef[],beastSkins:ImageRef[],wallSkins:ImageRef[]},stats:{elo:Number,OnlinePlay:Number,OnlinePlayVictory:Number,AiPlay:Number,AiPlayVictory:Number,FriendPlay:Number,FriendPlayVictory:Number,LocalPlay:Number}}} datas 
 */
    constructor(datas = null){
        if(datas==null){
            return;
        }
        this.email = datas.email,
        this.password = datas.password,
        this.username = datas.username,
        this.friends = datas.friends,
        this.achievements = datas.achievements,
        this.savedGames = datas.savedGames,
        this.skins = datas.skins,
        this.stats = datas.stats
        this.convs = datas.convs
    }
    /**
     * 
     * @param {String} friendId 
     * @returns 
     */
    addFriend(friendId){
        return db.addFriend(this.username, friendId)
    }
    friendsRequest(friendId){
        if(this.friends.request.includes(friendId)) return db.addFriend(this.username, friendId)
        return db.addFriendRequest(this.username,friendId)
    }
    /**
     * 
     * @param {{key:string,title:String,value:string,reward?:String[][]}[]} achievements
     */
    async addAchievements(achievements){
        let remainingAchievement = []
        for(let achievement of achievements){
            if(Achievements[achievement.key]==null){console.info(achievement.title,"don't exist"); continue;}
            for(let achieve of this.achievements) if(achieve.key == achievement.key){console.info("user already have",achievement.title); continue;}
            remainingAchievement.push(achievement);
            this.achievements.push(achievement)
        }
        console.log("achievmeent send to back",remainingAchievement)
        await apiQuery.addAchievement(this.username,remainingAchievement)
        return true;
    }

    getAchievement(achievement = null){
        if(achievement==null){
            if(this.achievements ==null) return [];
            return this.achievements
        }else{
            return this.achievements.includes(achievement)
        }

    }

}

  class Color{

    static black = new Color(0  ,0  ,0  );
    static red   = new Color(255,0  ,0  );
    static green = new Color(0  ,255,0  );
    static blue  = new Color(0  ,0  ,255);
    static white = new Color(255,255,255);
    static darkGrey = new Color(50,50,50);
    
      constructor(r,g,b){
        this.R = r;
        this.G = g;
        this.B = b;
      }
    
      /**
       * 
       * @param {Color} c 
       * @returns 
       */
      moy(c,per=0.5){
        let r = this.R;
        let g = this.G;
        let b = this.B;
        return new Color((c.R*(1-per)+r*per)/2,(c.G*(1-per)+g*per)/2,(c.B*(1-per)+b*per)/2)
      }
    
      toStyle(){
        return "rgb("+this.R+","+this.G+","+this.B+")"
      }
}

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

const Achievements = {
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

/**
 * 
 * @param {PlayerAccount} user 
 */
async function checkStatsAchievement(user){
    let potentialAchievement = []
    //AI Game
    if(user.stats.AiPlay>=25) potentialAchievement.push(Achievements.AiGameTwentyFive);
    if(user.stats.AiPlay>= 5) potentialAchievement.push(Achievements.AiGameFive);
    if(user.stats.AiPlay>= 1) potentialAchievement.push(Achievements.AiGamePlayed);

    if(user.stats.AiPlayVictory>= 1) potentialAchievement.push(Achievements.WinAiGame);
    
    //Friends
    if(user.friends.list.length >= 10) potentialAchievement.push(Achievements.TenFriends);
    if(user.friends.list.length >= 5) potentialAchievement.push(Achievements.FiveFriends);
    if(user.friends.list.length >= 1) potentialAchievement.push(Achievements.newFriend);

    if(user.stats.FriendPlayVictory>= 1) potentialAchievement.push(Achievements.WinFriendGame);

    //Friend Game
    if(user.stats.FriendPlay >= 25) potentialAchievement.push(Achievements.FriendGameTwentyFive);
    if(user.stats.FriendPlay >= 5) potentialAchievement.push(Achievements.FriendGameFive);
    if(user.stats.FriendPlay >= 1) potentialAchievement.push(Achievements.FriendGamePlayed);
    

    //Online Game
    if(user.stats.OnlinePlay >= 100) potentialAchievement.push(Achievements.OnlineGameHundred);
    if(user.stats.OnlinePlay >= 10) potentialAchievement.push(Achievements.OnlineGameTen);
    if(user.stats.OnlinePlay >= 1) potentialAchievement.push(Achievements.OnlineGamePlayed);
    
    if(user.stats.OnlinePlayVictory>= 1) potentialAchievement.push(Achievements.WinOnlineGame);

    if(user.stats.elo>= 1500) potentialAchievement.push(Achievements.EloOneTFiveH);
    if(user.stats.elo>= 1400) potentialAchievement.push(Achievements.EloOneTFourH);
    if(user.stats.elo>= 1300) potentialAchievement.push(Achievements.EloOneTThreeH);
    if(user.stats.elo>= 1200) potentialAchievement.push(Achievements.EloOneTTwoH);
    if(user.stats.elo>= 1100) potentialAchievement.push(Achievements.EloOneTOneH);


    //General Stats
    {
        let totalGame = user.stats.AiPlay  + user.stats.FriendPlay + user.stats.LocalPlay + user.stats.OnlinePlay
        let totalVictory = user.stats.AiPlayVictory + user.stats.FriendPlayVictory + user.stats.OnlinePlayVictory

        if(totalGame>= 1000)potentialAchievement.push(Achievements.OneThousandGames);
        if(totalGame>= 250)potentialAchievement.push(Achievements.TwoHundredFiftyGames);
        if(totalGame>= 50)potentialAchievement.push(Achievements.FiftyGames);
        if(totalGame>= 10)potentialAchievement.push(Achievements.TenGames);
        if(totalGame>= 1)potentialAchievement.push(Achievements.OneGame);
        
        if(totalVictory>= 1000)potentialAchievement.push(Achievements.OneThousandVictory);
        if(totalVictory>= 250)potentialAchievement.push(Achievements.TwoHundredFiftyVictory);
        if(totalVictory>= 50)potentialAchievement.push(Achievements.FiftyVictory);
        if(totalVictory>= 10)potentialAchievement.push(Achievements.TenVictory);
        if(totalVictory>= 1)potentialAchievement.push(Achievements.OneVictory);
        
    }
    user.addAchievements(potentialAchievement)
}

exports.Achievements = Achievements;
exports.checkStatsAchievement = checkStatsAchievement;
exports.PlayerAccount = PlayerAccount;
exports.Color = Color;