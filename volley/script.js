const teamAScore = document.getElementById("score-1");
const teamBScore = document.getElementById("score-2");
const teamASet = document.getElementById("set-1");
const teamBSet = document.getElementById("set-2");

const ballA = document.getElementById("ball-1");
const ballB = document.getElementById("ball-2");
const TeamΑName = document.getElementById("team-name-1");
const TeamΒName = document.getElementById("team-name-2");
const TeamΑLogo = document.getElementById("team-logo-1");
const TeamΒLogo = document.getElementById("team-logo-2");
const TeamΑColor = document.getElementById("color-1");
const TeamΒColor = document.getElementById("color-2");
const nameInputA = document.getElementById("team-name-1-input");
const logoInputA = document.getElementById("team-logo-url-1");
const colorInputA = document.getElementById("team-color-1-input");
const nameInputB = document.getElementById("team-name-2-input");
const logoInputB = document.getElementById("team-logo-url-2");
const colorInputB = document.getElementById("team-color-2-input");

// Setting names & logos
document.getElementById("set-logos-1").addEventListener("click", function() {
    const contentName1 = nameInputA.value;
    if (contentName1.trim() !== "") {
        TeamΑName.textContent = contentName1;
    }    
    const logoURL1 = logoInputA.value;
    if (logoURL1.trim() !== "") {
        TeamΑLogo.src = logoURL1;
    }    
    const colorInput1 = colorInputA.value;
    TeamΑColor.style.backgroundColor = colorInput1;

});

document.getElementById("set-logos-2").addEventListener("click", function() {
    const contentName2 = nameInputB.value;
    if (contentName2.trim() !== "") {
        TeamΒName.textContent = contentName2;
    }    
    const logoURL2 = logoInputB.value;
    if (logoURL2.trim() !== "") {
        TeamΒLogo.src = logoURL2;
    }    
    const colorInput2 = colorInputB.value;
    TeamΒColor.style.backgroundColor = colorInput2;
});

// Sub names & logos
const PlayerΑName = document.getElementById("sub-name-1");
const PlayerBName = document.getElementById("sub-name-2");
const PlayerΑNum = document.getElementById("sub-num-1");
const PlayerBNum = document.getElementById("sub-num-2");
const subNameInputA = document.getElementById("sub-name-1-input");
const subNumInputA = document.getElementById("sub-num-1-input");
const subNameInputB = document.getElementById("sub-name-2-input");
const subNumInputB = document.getElementById("sub-num-2-input");
const subFrameA = document.getElementById("substitution-team-1");
const subFrameB = document.getElementById("substitution-team-2");
var subTeamA=0;
var subTeamB=0;
document.getElementById("sub-button-1").addEventListener("click", function() {
    const contentsubName1 = subNameInputA.value;
    if (contentsubName1.trim() !== "") {
        PlayerΑName.textContent = contentsubName1;
    }    
    const contentsubNum1 = subNumInputA.value;
    if (contentsubNum1.trim() !== "") {
        PlayerΑNum.textContent = ""+contentsubNum1;
    } 
    if(subTeamA==0){
      subFrameA.style.display="flex";
      PlayerΑName.style.display="flex";
      PlayerΑNum.style.display="flex";
      subTeamA=1;
    }  
    else{
        subFrameA.style.display="none";
        PlayerΑName.style.display="none";
        PlayerΑNum.style.display="none";
        subTeamA=0;  
    } 
});

document.getElementById("sub-button-2").addEventListener("click", function() {
    const contentsubName2 = subNameInputB.value;
    if (contentsubName2.trim() !== "") {
        PlayerBName.textContent = contentsubName2;
    }    
    const contentsubNum2 = subNumInputB.value;
    if (contentsubNum2.trim() !== "") {
        PlayerBNum.textContent = contentsubNum2;
    } 
    if(subTeamB==0){
      subFrameB.style.display="flex";
      PlayerBName.style.display="flex";
      PlayerBNum.style.display="flex";
      subTeamB=1;
    }  
    else{
      subFrameB.style.display="none";
      PlayerBName.style.display="none";
      PlayerBNum.style.display="none";
      subTeamB=0;  
    }    
});


// Set & Match point
var checkset1 = 0;
const setpointA = document.getElementById("set-point-chance-1");
var checkset2 = 0;
const setpointB = document.getElementById("set-point-chance-2");

document.getElementById("set-point-1").addEventListener("click",function(){
    if(checkset1==0){
        setpointA.style.display="flex"
        checkset1=1;
    }
    else{
        setpointA.style.display="none" 
        checkset1=0;
    }
});

document.getElementById("set-point-2").addEventListener("click",function(){
    if(checkset2==0){
        setpointB.style.display="flex"
        checkset2=1;
    }
    else{
        setpointB.style.display="none" 
        checkset2=0;
    }
});

var checkmatch1 = 0;
const matchpointA = document.getElementById("match-point-chance-1");
var checkmatch2 = 0;
const matchpointB = document.getElementById("match-point-chance-2");

document.getElementById("match-point-1").addEventListener("click",function(){
    if(checkmatch1==0){
        matchpointA.style.display="flex"
        checkmatch1=1;
    }
    else{
        matchpointA.style.display="none" 
        checkmatch1=0;
    }
});

document.getElementById("match-point-2").addEventListener("click",function(){
    if(checkmatch2==0){
        matchpointB.style.display="flex"
        checkmatch2=1;
    }
    else{
        matchpointB.style.display="none" 
        checkmatch2=0;
    }
});

// Timeouts & Challenge

var checktimeout1 = 0;
const timeoutA = document.getElementById("timeout-team-1");
var checktimeout2 = 0;
const timeoutB = document.getElementById("timeout-team-2");

document.getElementById("timeout-1").addEventListener("click",function(){
    if(checktimeout1==0){
        timeoutA.style.display="flex"
        checktimeout1=1;
    }
    else{
        timeoutA.style.display="none" 
        checktimeout1=0;
    }
});

document.getElementById("timeout-2").addEventListener("click",function(){
    if(checktimeout2==0){
        timeoutB.style.display="flex"
        checktimeout2=1;
    }
    else{
        timeoutB.style.display="none" 
        checktimeout2=0;
    }
});

var checkchallenge1 = 0;
const challengeA = document.getElementById("challenge-team-1");
var checkchallenge2 = 0;
const challengeB = document.getElementById("challenge-team-2");

document.getElementById("challenge-1").addEventListener("click",function(){
    if(checkchallenge1==0){
        challengeA.style.display="flex"
        checkchallenge1=1;
    }
    else{
        challengeA.style.display="none" 
        checkchallenge1=0;
    }
});

document.getElementById("challenge-2").addEventListener("click",function(){
    if(checkchallenge2==0){
        challengeB.style.display="flex"
        checkchallenge2=1;
    }
    else{
        challengeB.style.display="none" 
        checkchallenge2=0;
    }
});

// Adding and removing points

document.getElementById("add-point-1").addEventListener("click", function() {
    teamAScore.innerText = parseInt(teamAScore.innerText) + 1;
    ballA.style.display = "flex";
    ballB.style.display = "none";
    if(parseInt(teamAScore.innerText)<10){
        teamAScore.innerText = "0"+teamAScore.innerText;
    }
});


document.getElementById("add-point-2").addEventListener("click", function() {
    teamBScore.innerText = parseInt(teamBScore.innerText) + 1;
    ballA.style.display = "none";
    ballB.style.display = "flex";
    if(parseInt(teamBScore.innerText)<10){
        teamBScore.innerText = "0"+teamBScore.innerText;
    }
});

document.getElementById("remove-point-1").addEventListener("click", function() {
    if((parseInt(teamAScore.innerText) - 1)>=0){
        ballA.style.display = "none";
        teamAScore.innerText = parseInt(teamAScore.innerText) - 1;
        if(parseInt(teamAScore.innerText)<10){
            teamAScore.innerText = "0"+teamAScore.innerText;
        }
    }
});

document.getElementById("remove-point-2").addEventListener("click", function() {
    if((parseInt(teamBScore.innerText) - 1)>=0){
        ballB.style.display = "none";
        teamBScore.innerText = parseInt(teamBScore.innerText) - 1;
        if(parseInt(teamBScore.innerText)<10){
            teamBScore.innerText = "0"+teamBScore.innerText;
        }
    }    
});

// Adding and removing sets

document.getElementById("set-team-1").addEventListener("click", function() {
    teamASet.innerText = parseInt(teamASet.innerText) + 1;
});


document.getElementById("set-team-2").addEventListener("click", function() {
    teamBSet.innerText = parseInt(teamBSet.innerText) + 1;
});

document.getElementById("noset-team-1").addEventListener("click", function() {
    if((parseInt(teamASet.innerText) - 1)>=0){
        teamASet.innerText = parseInt(teamASet.innerText) - 1;
    }
});

document.getElementById("noset-team-2").addEventListener("click", function() {
    if((parseInt(teamBSet.innerText) - 1)>=0){
        teamBSet.innerText = parseInt(teamBSet.innerText) - 1;
    }    
});

document.getElementById("reset-2").addEventListener("click", function() {
    teamBScore.innerText = "00";
});

document.getElementById("reset-1").addEventListener("click", function() {
    teamAScore.innerText = "00";
});


