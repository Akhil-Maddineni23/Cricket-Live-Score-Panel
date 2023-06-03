exports.Create_NewMatch = async function(data , MatchDetails){
    let foundData = await MatchDetails.find();
    if(foundData.length == 0){
        await MatchDetails.create(data);    
        console.log("Sucessfully Entered Match Details into the Database:");
    }
    else{
        console.log("Already this MatchDetails have been saved:");
    }   
}

exports.BatsmanName_Insert = async function(batsmanName , BatsmanStats , batteamName){
    let foundData = await BatsmanStats.find({batteamName : batteamName , name : batsmanName});
    if(foundData.length == 0){
        const data = {
            batteamName : batteamName , name : batsmanName ,
            runs : 0, balls : 0, fours : 0, sixes : 0, outstatus : "Not Out", outString : "Not Out", scoreTimeline : "", strikeRate : 0.0
        }
        await BatsmanStats.create(data);
        console.log("Sucessfully inserted New Batsman Name into the Batsman Stats:");
    }
    else{
        console.log("Batsman Name already exists in the Batsman Stats :");
    } 
}

exports.BowlerName_Insert = async function(bowlerName , BowlerStats , bowlteamName){
    let foundData = await BowlerStats.find({bowlteamName : bowlteamName ,name : bowlerName});
    if(foundData.length == 0){
        const data = {
            bowlteamName : bowlteamName, name : bowlerName, 
            overs : 0, balls : 0, maidens : 0, runs : 0, wickets : 0, noballs : 0, wides : 0, economy : 0.0
        }
        await BowlerStats.create(data);
        console.log("Sucessfully inserted Bowler Name into the Bowler Stats:");  
    }
    else{
        console.log("Bowler Name already exists in the Bowler Stats :");
    }  
}

exports.BatInningsScore_Start = async function( battingteamName , batInningsDetails, inningsNo , totalovers){
    let foundData = await batInningsDetails.find({batteamName : battingteamName});
    if(foundData.length == 0){
        const data = {
            batteamName : battingteamName, inningsNo:inningsNo, totalScore : 0, totalWickets :0, oversPlayed : 0, totalOvers : totalovers
        }
        await batInningsDetails.create(data);
        console.log("Sucessfully created Bat Innings Score Table :");  
    }
    else{
        console.log("Batting Team Name already exists :")
    }    
}

exports.CurrentOverInningsScore_Start = async function(bowlerName , currOverInningsDetails , bowlteamName){
    let foundData = await currOverInningsDetails.find({bowlteamName : bowlteamName});
    if(foundData.length == 0){
        const data = {
            bowlteamName : bowlteamName,
            currBowlerName : bowlerName, currOverNo : 1,  currOverBalls : 0, currOverScore : 0, currOverTimeline : ""
        }
        await currOverInningsDetails.create(data);
        console.log("Sucessfully created Current Over Innings Score Table :");    
    } 
}

exports.ExtrasDetails_Start = async function( bowlteamName , ExtrasDetails){

    let foundData = await ExtrasDetails.find({bowlteamName : bowlteamName});
    if(foundData.length == 0){
        const data = {
            bowlteamName : bowlteamName , wides : 0, noballs : 0, byes : 0, legbyes : 0, total : 0
        }
        await ExtrasDetails.create(data);
        console.log("Sucessfully created extras Details table:");
    }   
}

exports.BatsmanScore_Update = async function(data , BatsmanStats , batteamName){
    console.log("Updating Batsman score:")
    let prev = await BatsmanStats.findOne({batteamName: batteamName , name : data.batsman});

    //console.log(player);
    let f1=0;
    let s1=0;
    if(data.run == 4){
        f1=1;
    }
    if(data.run == 6){
        s1=1;
    }
    let sr = Number(((prev.runs + Number(data.run))/(prev.balls + 1))*100).toFixed(2);
    let updatescore = {
        runs : prev.runs + Number(data.run),
        balls : prev.balls + 1,
        fours : prev.fours + f1,
        sixes : prev.sixes + s1,
        scoreTimeline : prev.scoreTimeline + " " + data.run,
        strikeRate : sr
    }
    await BatsmanStats.updateOne({batteamName: batteamName ,name : data.batsman} , updatescore);   
}

exports.OverDone_AllStatsUpdate = async function(currOverInningsDetails, bowlInningsDetails, BowlerStats, currBowlerName, bowlteamName , batInningsDetails, batteamName){

    console.log("Over Completed - Updating All Stats Tables");

    let prev = await currOverInningsDetails.findOne({bowlteamName : bowlteamName});
    let prev1 = await BowlerStats.findOne({bowlteamName: bowlteamName, name : currBowlerName});
    let prev2 = await batInningsDetails.findOne({batteamName : batteamName});

    let data = {
        bowlteamName : bowlteamName,
        overNo : prev.currOverNo,
        bowlerName : prev.currBowlerName,
        overScore : prev.currOverScore,
        overTimeline : prev.currOverTimeline
    }

    let maiden = prev1.maidens;
    if(prev.currOverScore == 0){
        maiden +=1
    }
    
    let updatescore1 = {
        overs : prev1.overs + 1,
        balls : 0,
        maidens : maiden
    }

    let data2 = {
        oversPlayed : prev2.oversPlayed + 1
    }
    
    await bowlInningsDetails.create(data);
    await BowlerStats.updateOne({bowlteamName: bowlteamName , name : currBowlerName} , updatescore1);   
    await batInningsDetails.updateOne({batteamName : batteamName} , data2);   
}

exports.InningsDone_AllStatsUpdate = async function(currOverInningsDetails, bowlteamName, bowlInningsDetails, batInningsDetails , batteamName){

    console.log("Innings Completed - Updating All Stats Tables");

    let prev = await currOverInningsDetails.findOne({bowlteamName : bowlteamName});
    let prev2 = await batInningsDetails.findOne({batteamName : batteamName});

    const data = {
        bowlteamName : bowlteamName,
        overNo : prev.currOverNo,
        bowlerName : prev.currBowlerName,
        overScore : prev.currOverScore,
        overTimeline : prev.currOverTimeline
    }

    const data2 = {
        oversPlayed : prev2.oversPlayed + Number("0." +prev.currOverBalls)
    }
    await bowlInningsDetails.create(data);   
    await batInningsDetails.updateOne({batteamName : batteamName} , data2);   
}

exports.CurrentOver_Update = async function(nextBowlerName, currOverInningsDetails, bowlteamName){

    let prev = await currOverInningsDetails.findOne({bowlteamName : bowlteamName});
    let updatescore = {
        currBowlerName : nextBowlerName,
        currOverNo : prev.currOverNo + 1,
        currOverBalls : 0,
        currOverScore : 0,
        currOverTimeline : ""    
    }
    await currOverInningsDetails.updateOne({bowlteamName : bowlteamName} , updatescore);
}

exports.InningsCompleted_SchemaUpdate = async function(batInningsDetails , inningsCompleted, currOverInningsDetails, batteamName, bowlteamName, MatchDetails ){
    let prev = await batInningsDetails.findOne({batteamName : batteamName});
    let prev1 = await inningsCompleted.findOne({inningsNo : 1});
    let prev2 = await currOverInningsDetails.findOne({bowlteamName : bowlteamName});
    const prev3 = await MatchDetails.find();

    const data = {
        stillRequired : prev1.target - prev.totalScore,
        wicketsleft : 10 - prev.totalWickets,
        ballsleft : Number(prev3[0].noofOvers)*6 - ((prev2.currOverNo - 1)*6 + prev2.currOverBalls)
    }
    await inningsCompleted.updateOne({inningsNo : 1} , data);
}

                                                                                                                                                                                                                                                     

