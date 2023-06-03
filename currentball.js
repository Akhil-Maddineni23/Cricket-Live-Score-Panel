const update = require(__dirname + "/dataUpdate.js")

exports.HandleCurrentBall_Wide_Update = async function(data ,currdata , schemas){
    /*
        No increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + timline
    2.) Need to update in BowlerStats - runs + wide
    3.) Need to update in ExtrasDetails - wides
    4.) Need to update in batInningsDetails - totalscore
    */

    console.log("Entered Handle Current Ball -> Wide Update:");
    
    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + 1,
        currOverTimeline : prev1.currOverTimeline + " " + "WD"
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);
    
    //2.)
    let prev2 = await schemas.bowlerstats.findOne({ bowlteamName : currdata.bowlteamname ,name : currdata.bowlername});
    let update2 = {
        runs : prev2.runs + 1,
        wides : prev2.wides + 1
    }
    await schemas.bowlerstats.updateOne({ bowlteamName : currdata.bowlteamname , name : currdata.bowlername} , update2);
    
    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        wides : prev3.wides + 1,
        total : prev3.total + 1
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);
    
    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + 1
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);
}

exports.HandleCurrentBall_WideByes_Update = async function(data , currdata , schemas){
    /*
    // No increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + timeline
    2.) Need to update in BowlerStats - runs + wides
    3.) Need to update in ExtrasDetails - wides + byes
    4.) Need to update in batInningsDetails - totalscore
     */

    console.log("Entered Handle Current Ball -> Wide + Byes Update:");
    
    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + 1 + Number(data.run),
        currOverTimeline : prev1.currOverTimeline + " " + "WD" + "+B" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);
    
    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername});
    let update2 = {
        runs : prev2.runs + 1 + Number(data.run),
        wides : prev2.wides + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);
    
    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        wides : prev3.wides + 1,
        byes : prev3.byes + Number(data.run),
        total : prev3.total + 1 + Number(data.run)
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);
    
    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + 1 + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);
}

exports.HandleCurrentBall_NoBall_Update = async function(data , currdata , schemas){
     /*
    // No increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + timeline
    2.) Need to update in BowlerStats - runs + noballs
    3.) Need to update in ExtrasDetails - noballs
    4.) Need to update in batInningsDetails - totalscore
    5.) Need to update in Batsman Stats - Batsman score
     */

    console.log("Entered Handle Current Ball -> NoBall Update:");

    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + 1 + Number(data.run),
        currOverTimeline : prev1.currOverTimeline + " " + "NB" + "+" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        runs : prev2.runs + 1 + Number(data.run),
        noballs : prev2.noballs + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);
    
    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        noballs : prev3.noballs + 1,
        total : prev3.total + 1
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);

    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + 1 + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

    //5.)
    await update.BatsmanScore_Update(data , schemas.batsmanstats , currdata.batteamname);
      
}

exports.HandleCurrentBall_NoBallByes_Update = async function(data , currdata , schemas){
    /*
    // No increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + timeline
    2.) Need to update in BowlerStats - runs + noball
    3.) Need to update in ExtrasDetails - noball + byes
    4.) Need to update in batInningsDetails - totalscore
     */

    console.log("Entered Handle Current Ball -> NoBall + Byes Update:");
    
    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + 1 + Number(data.run),
        currOverTimeline : prev1.currOverTimeline + " " + "NB" + "+B" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);
    
    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        runs : prev2.runs + 1 + Number(data.run),
        noballs : prev2.noballs + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);
    
    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        noballs : prev3.noballs + 1,
        byes : prev3.byes + Number(data.run),
        total : prev3.total + 1 + Number(data.run)
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);
    
    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + 1 + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

}

exports.HandleCurrentBall_NoBallLegbyes_Update = async function(data , currdata , schemas){
     /*
    // No increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + timeline
    2.) Need to update in BowlerStats - No of Noballs + extra run
    3.) Need to update in ExtrasDetails - noballs + legbyes
    4.) Need to update in batInningsDetails - totalscore
    5.) Need to update in Batsman Stats - increase ball count
     */
    console.log("Entered Handle Current Ball -> NoBall + LegByes Update:");

    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + 1 + Number(data.run),
        currOverTimeline : prev1.currOverTimeline + " " + "NB" + "+LB" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        runs : prev2.runs + 1 ,
        noballs : prev2.noballs + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);

    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        noballs : prev3.noballs + 1,
        legbyes : prev3.legbyes + Number(data.run),
        total : prev3.total + 1 + Number(data.run)
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);

    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + 1 + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

    //5.)
    data.run =0;
    await update.BatsmanScore_Update(data , schemas.batsmanstats , currdata.batteamname);

}

exports.HandleCurrentBall_Byes_Update = async function(data , currdata , schemas){
     /*
    // Increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + Balls + timeline
    2.) Need to update in BowlerStats - Balls
    3.) Need to update in ExtrasDetails - Byes runs
    4.) Need to update in batInningsDetails - totalscore
    5.) Need to update in Batsman Stats - increase ball count
     */

    console.log("Entered Handle Current Ball -> Byes Update:");

    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + Number(data.run),
        currOverBalls : prev1.currOverBalls + 1,
        currOverTimeline : prev1.currOverTimeline + " " + "B" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        balls : prev2.balls + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);

    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        byes : prev3.byes + Number(data.run),
        total : prev3.total + Number(data.run)
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);

    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

    //5.)
    data.run =0;
    await update.BatsmanScore_Update(data , schemas.batsmanstats , currdata.batteamname);
}

exports.HandleCurrentBall_Legbyes_Update = async function(data , currdata , schemas){
    /*
    // Increase in count of Balls
    1.) Need to update in currOverInningsDetails - Balls + runs + timeline
    2.) Need to update in BowlerStats - Balls
    3.) Need to update in ExtrasDetails - legByes runs
    4.) Need to update in batInningsDetails - totalscore
    5.) Need to update in Batsman Stats - increase ball count
     */

    console.log("Entered Handle Current Ball -> LegByes Update:");
    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + Number(data.run),
        currOverBalls : prev1.currOverBalls + 1,
        currOverTimeline : prev1.currOverTimeline + " " + "LB" + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.)
    let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        balls : prev2.balls + 1
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);

    //3.) 
    let prev3 = await schemas.extrasdetails.findOne({bowlteamName : currdata.bowlteamname});
    let update3 = {
        legbyes : prev3.legbyes + Number(data.run),
        total : prev3.total + Number(data.run)
    }
    await schemas.extrasdetails.updateOne({bowlteamName : currdata.bowlteamname} , update3);

    //4.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

    //5.)
    data.run =0;
    await update.BatsmanScore_Update(data , schemas.batsmanstats , currdata.batteamname);
}

exports.HandleCurrentBall_GoodBall_Update = async function(data ,currdata, schemas){
     /*
    // Increase in count of Balls
    1.) Need to update in currOverInningsDetails - score + balls + timeline
    2.) Need to update in BowlerStats - Balls + runs
    4.) Need to update in batInningsDetails - totalscore
    5.) Need to update in Batsman Stats - Runs + ballcount
     */
    console.log("Entered Handle Current Ball -> Good Ball Update:");

    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverScore : prev1.currOverScore + Number(data.run),
        currOverBalls : prev1.currOverBalls + 1,
        currOverTimeline : prev1.currOverTimeline + " " + data.run
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.)
    let prev2 = await schemas.bowlerstats.findOne({ bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
    let update2 = {
        balls : prev2.balls + 1,
        runs : prev2.runs + Number(data.run)
    }
    await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);

    //3.)
    let prev4 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update4 = {
        totalScore : prev4.totalScore + Number(data.run)
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update4);

    //4.)
    await update.BatsmanScore_Update(data , schemas.batsmanstats , currdata.batteamname);   
}

exports.HandleCurrentBall_Wicket_Update = async function(data , currdata , schemas){
     /*
    // Here No need to worry about Balls and Runs - they were already handled seperately
    // Need to pass wicket.ejs page and need to collect outbatsman, how out , new batsaman
    1.) Need to update in currOverInningsDetails - (score + balls)-Already handled ->Update Wicket in timeline to curr Ball
    2.) Need to update in BowlerStats - increment wickets
    3.) Need to update in batInningsDetails - increment total wickets
    4.) Need to update in Batsman Stats - out status + how out + (Add new batsman)
    5.) Update wickets fallen schema
     */
    console.log("Entered Handle Current Ball -> Wicket Update:");

    //1.)
    let prev1 = await schemas.curroverinnings.findOne({bowlteamName : currdata.bowlteamname});
    let update1 = {
        currOverTimeline : prev1.currOverTimeline + "W"
    }
    await schemas.curroverinnings.updateOne({bowlteamName : currdata.bowlteamname} , update1);

    //2.) If howout = RunOut no update for bowler else Update for Bowler
    if(Number(data.howout) != 0){
        let prev2 = await schemas.bowlerstats.findOne({bowlteamName : currdata.bowlteamname , name : currdata.bowlername});
        let update2 = {
            wickets : prev2.wickets + 1
        }
        await schemas.bowlerstats.updateOne({bowlteamName : currdata.bowlteamname, name : currdata.bowlername} , update2);    
    }
    
    //3.)
    let prev3 = await schemas.batinnings.findOne({batteamName : currdata.batteamname});
    let update3 = {
        totalWickets : prev3.totalWickets + 1
    }
    await schemas.batinnings.updateOne({batteamName : currdata.batteamname } , update3);

    //4.)
    let wayout;
    let supportfielder;
    let bowlername;
    let outstring;
    switch(data.howout){
        case '0' : 
        wayout = "RunOut"; supportfielder = data.supportfielder ; bowlername=""; 
        outstring = "run out " + "(" + data.supportfielder +")"; 
        break;

        case '1' : wayout = "Bowled"; supportfielder = ""; bowlername=currdata.bowlername;
        outstring = "b " + currdata.bowlername;
        break;

        case '2' : wayout = "LBW"; supportfielder = ""; bowlername=currdata.bowlername; 
        outstring = "lbw " + currdata.bowlername;
        break;

        case '3' : wayout = "Caught" ; supportfielder = data.supportfielder; bowlername=currdata.bowlername; 
        outstring = "c " + data.supportfielder + " b " + currdata.bowlername;
        break;

        case '4' : wayout = "Stump" ; supportfielder = data.supportfielder; bowlername=currdata.bowlername; 
        outstring = "st " + data.supportfielder + " b" + currdata.bowlername;
        break;

        default : console.log("Something is Fishyy !..");
    }
    let update4 = {
        outstatus : "OUT",
        wayOut : wayout,
        supportFielder : supportfielder,
        bowlerName : bowlername,
        outString : outstring
    }
    await schemas.batsmanstats.updateOne({batteamName : currdata.batteamname , name : data.outbatsman} , update4);

    //5.)
    let update5 = {
        batteamName : currdata.batteamname,
        batsmanName : data.outbatsman,
        overNo : prev1.currOverNo-1 + "." + prev1.currOverBalls,
        score : prev3.totalScore    
    }
    await schemas.wicketsfallen.create(update5);
}


/*
  let currdata = {
        batteamname : currBattingTeamName,
        bowlteamname : currBattingTeamName,
        batsman1 : currBatsman1Name,
        batsman2 : currBatsman2Name,
        bowlername : currBowlerName,
        overNo : currOverNo,
        overBalls : currOverBalls
    }

    let schemas = {
        matchdetails : MatchDetails,
        batinnings : batInningsDetails,
        bowlinnings : bowlInningsDetails,
        batsmanstats : BatsmanStats,
        bowlerstats : BowlerStats,
        curroverinnings : currOverInningsDetails,
        extrasdetails : ExtrasDetails,
        wicketsfallen : WicketsFallen
    }
*/






