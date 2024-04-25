import { Achievements } from "../assets/script/Achievements.js";

document.addEventListener('DOMContentLoaded', async function() {
    const imgBeast= document.getElementById('imgBeast');
    const imgFarm= document.getElementById('imgFarm');   

    const usernameCookie = document.cookie.split('; ').find(row => row.startsWith('nomCookie='));
    if (!usernameCookie) {
        alert("Vous n'êtes pas connecté");
        window.location.href = "../index.html";
        return;
    }
    const nameUser = usernameCookie.split('=')[1];
    const hostname = window.location.hostname;
    const api = "http://" + hostname + ":8000/api/getInfo";
    const user = await fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: nameUser})
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error:', error);
            });
    const name = user.username;
    const elo = user.stats.elo
    const beastSkins = user.skins.beastSkins;
    const humanSkins = user.skins.humanSkins;

    let cptBeast=beastSkins.indexOf(user.skins.beastSkin);
    let cptFarm=humanSkins.indexOf(user.skins.humanSkin);

    imgBeast.setAttribute('src', ".."+beastSkins[cptBeast]);
    imgFarm.setAttribute('src', ".."+humanSkins[cptFarm]);

    document.getElementById('playerRank').textContent = 'Elo ' + elo;
    document.getElementById('name').textContent =name;
        
    
    const BleftArrow=document.getElementById('arrowLBeast');    
    const BRightArrow=document.getElementById('arrowRBeast');
    
    const FleftArrow=document.getElementById('arrowLFarm');    
    const FRightArrow=document.getElementById('arrowRFarm');

    if(cptBeast==0) BleftArrow.style.visibility="hidden"
    else if(cptBeast==beastSkins.length-1) BRightArrow.style.visibility="hidden"
    if(cptFarm==0) FleftArrow.style.visibility="hidden"
    else if(cptFarm==humanSkins.length-1) FRightArrow.style.visibility="hidden"

    BleftArrow.addEventListener('click', async function() {
       cptBeast=changeImg(cptBeast,beastSkins,imgBeast,BleftArrow,BRightArrow,true)
    });

    FleftArrow.addEventListener('click', async function() {
        cptFarm=changeImg(cptFarm,humanSkins,imgFarm,FleftArrow,FRightArrow,true)
    });


    BRightArrow.addEventListener('click', async function() {
        cptBeast=changeImg(cptBeast,beastSkins,imgBeast,BRightArrow,BleftArrow,false);
    });

    FRightArrow.addEventListener('click', async function() {
        cptFarm=changeImg(cptFarm,humanSkins,imgFarm,FRightArrow,FleftArrow,false);
    });

    const saveButton=document.getElementById('confirm');
    saveButton.addEventListener('click', async function() {
        let obj = {
            name: name,
            beastSkin: beastSkins[cptBeast],
            humanSkin: humanSkins[cptFarm]
        }

        let api = "http://"+hostname+":8000/api/changeSkin";
        await fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(response => {
            if (response.ok) {
                alert('Modifications enregistrées');
                window.location.reload();
                //renvoie sur la main page
                window.location.href = "../index.html";
            } else {
                throw new Error('La requête a échoué'); // Gestion des erreurs
            }
        })


    });
    {   
        let achievementsKeys = Object.keys(Achievements)
        let userKeys = []
        for(let value of user.achievements) userKeys.push(value.key)
        let achievementGrid = document.getElementById("achievementGrid")
        if(achievementGrid==null)console.error("Grid Not Found")
        else {
            let maxNbRow = 10
            let maxNbCol = 10
            let title = document.getElementById("achievementTitle")
            let description = document.getElementById("achievementDescription")
            let reward = document.getElementById("achievementReward")
            for(let i=0;i<maxNbCol;i++){
                let line = document.createElement("div");
                line.style.display="flex"
                line.style.height=(100/maxNbCol)+"%"
                for(let j=0;j<maxNbRow;j++){
                    const selectedAchievement = Achievements[achievementsKeys[(i*(maxNbCol))+j]]
                    let row = document.createElement("div");
                    row.classList.add("achievementGrid")
                    row.style.width=(100/maxNbRow)+"%"
                    row.style.backgroundColor="white"
                    row.style.border = "1px solid grey"
                    if(!selectedAchievement)continue;
                    console.log(selectedAchievement?.title)
                    for(let current of userKeys){
                        if(current == selectedAchievement.key) {row.style.opacity=0;break;}
                    }

                    function displayAchievement(){

                        let skinsToUnlock = []
                        console.log(selectedAchievement)
                        if(selectedAchievement.reward){
                            if(selectedAchievement.reward[0]!=null)skinsToUnlock.push(selectedAchievement.reward[0])
                            if(selectedAchievement.reward[1]!=null)skinsToUnlock.push(selectedAchievement.reward[1]) 
                        }
                        {
                            let found = false;
                            for(let current of userKeys){
                                if(current == selectedAchievement.key) {
                                    found = true
                                    break;
                                }
                            }
                            if(found){
                                document.getElementById("achievementDisplay").classList.remove("locked"); 
                                if(skinsToUnlock.length==0)reward.style.visibility="hidden"
                                else{
                                    reward.style.visibility="visible";
                                    reward.textContent="Rewards :"
                                    for(let skin of skinsToUnlock){
                                        let element = document.createElement("img")
                                        element.setAttribute("src",skin)
                                        element.classList.add("miniature")
                                        reward.appendChild(element)
                                    
                                    }
                                }

                            }else{
                                document.getElementById("achievementDisplay").classList.add("locked")
                                reward.textContent="Rewards :";
                                if(skinsToUnlock.length==0)reward.style.visibility="hidden";
                                else {
                                    reward.style.visibility="visible";
                                    for(let skin in skinsToUnlock){ 
                                        reward.textContent+=" ? ";
                                    }
                                }
                            }
                        }
                        title.textContent="Title: "+selectedAchievement.title
                        description.textContent="description: "+selectedAchievement.value
                    }
                    row.addEventListener("mouseenter",displayAchievement)
                    row.addEventListener("mousedown",displayAchievement)
                    line.appendChild(row);
                }
                achievementGrid.appendChild(line)
                
            }
        }
    }
});

function changeImg(cpt,skins,img,arrow,arrow2,type){
    if(type){
        cpt--;
        if(cpt==0){
            arrow.style.visibility='hidden';
        }
    }else{
        cpt++;
        if(cpt==skins.length-1){
            arrow.style.visibility='hidden';
        }
    }

    img.setAttribute('src',skins[cpt]);
    if(arrow2.style.visibility=='hidden'){
        arrow2.style.visibility='';
    }

    return cpt
}
