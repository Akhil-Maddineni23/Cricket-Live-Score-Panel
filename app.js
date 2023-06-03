const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("lodash");
const update = require(__dirname + "/dataUpdate.js")
const currentball = require(__dirname + "/currentball.js");


const mongoose = require("mongoose");
//mongoose.connect("mongodb://localhost:27017/CricketDB" , {useNewUrlParser : true});

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine' , 'ejs');

// ********************************  DATABASE SCHEMAS ******************************
const newMatchDetailsSchema = {
    matchId : String,
    team1Name : String,
    team2Name : String,
    noofOvers : Number,
    tossWonBy : String,
    tossResult : String
}
const MatchDetails = mongoose.model("MatchDetails" , newMatchDetailsSchema);

const batInningsDetailsSchema = {
    batteamName : String,
    inningsNo : Number,
    totalScore : Number,
    totalWickets : Number,
    oversPlayed : Number,
    totalOvers : Number
};
const batInningsDetails = mongoose.model("batInningsDetails" , batInningsDetailsSchema);

const wicketsFallenSechma = {
    batteamName : String,
    batsmanName : String,
    overNo : String,
    score : Number
}
const WicketsFallen = mongoose.model("WicketsFallen" , wicketsFallenSechma);

const currOverInningsDetailsSchema = {
    bowlteamName : String,
    currBowlerName : String,
    currOverNo : Number,
    currOverBalls : Number,
    currOverScore : Number,
    currOverTimeline : String,
};
const currOverInningsDetails = mongoose.model("currOverInningsDetails" , currOverInningsDetailsSchema);

const bowlInningsDetailsSchema = {
    bowlteamName : String,
    overNo : Number,
    bowlerName : String,
    overScore : Number,
    overTimeline : String
};
const bowlInningsDetails = mongoose.model("bowlInningsDetails" , bowlInningsDetailsSchema);

const batsmanStatsSchema = {
    batteamName : String,
    name : String,
    runs : Number,
    balls : Number,
    fours : Number,
    sixes : Number,
    outstatus : String,
    wayOut : String,
    supportFielder : String,
    bowlerName : String,
    outString : String,
    scoreTimeline :String,
    strikeRate : Number
};
const BatsmanStats = mongoose.model("BatsmanStats" , batsmanStatsSchema);

const bowlerStatsSchema = {
    bowlteamName : String,
    name : String,
    overs : Number,
    balls : Number,
    maidens : Number,
    runs : Number,
    wickets : Number,
    noballs : Number,
    wides : Number,
    economy : Number
};
const BowlerStats =  mongoose.model("BowlerStats" ,bowlerStatsSchema );

const extrasSchema = {
    bowlteamName : String,
    wides : Number,
    noballs : Number,
    byes  : Number,
    legbyes : Number,
    total : Number
}
const ExtrasDetails = mongoose.model("ExtrasDetails" , extrasSchema );

const inningsCompletedSchema = {
    inningsNo : Number,
    batteamName : String,
    bowlteamName : String,
    target : Number,
    stillRequired : Number,
    wicketsleft : Number,
    ballsleft : Number
}
const inningsCompleted =  mongoose.model("inningsCompleted" , inningsCompletedSchema);

const chaseTeamWinSchema = {
    teamWon : String,
    wicketsleft : Number,
    ballsleft : Number
}
const chaseTeamWin =  mongoose.model("chaseTeamWin" , chaseTeamWinSchema);

const defendTeamWinSchema = {
    teamWon : String,
    wonbyruns : Number
}
const defendTeamWin =  mongoose.model("defendTeamWin" , defendTeamWinSchema);

const matchDrawSchema = {
    matchResult : String
}
const matchDraw = mongoose.model("matchDraw" , matchDrawSchema);


// ********************************  DATABASE SCHEMAS ******************************

//********************************* GLOBAL VARIABLES ********************************/
let currBattingTeamName;
let currBowlingTeamName;
let currInningsNo;
let totalInningsOvers;
let currOverNo;
let currOverBalls;
let currBatsman1Name;
let currBatsman2Name;
let currBowlerName;
let Target=0;
let newMatchData;

//1 = Chase team Win 2 = Defend Team win 3 = Draw Match
let MatchResult; 
//********************************* GLOBAL VARIABLES ********************************/

app.get("/" , function(req , res){
    res.render("home", {title : "Score Panel"});

});

app.get("/new_match" , function(req , res){
    res.render("new_match", {title : "New Match"});

});

app.get("/start_innings" , function(req , res){
    res.render("start_innings" , {title : "Start Innings"});

});

app.get("/second_innings" , function(req , res){
    res.render("second_innings" , {title : "Second Innings"});
});

app.get("/match_completed" , function(req , res){
    res.render("match_completed" , {title : "Match Completed"});
});

async function Create_Innings1Completed_Schema(){
    const prev = await batInningsDetails.findOne({batteamName : currBattingTeamName});
    const prev1 = await MatchDetails.find();
    const data = {
        inningsNo : 1,
        batteamName : currBattingTeamName,
        bowlteamName : currBowlingTeamName,
        target : prev.totalScore + 1,
        stillRequired : prev.totalScore + 1,
        wicketsleft : 10,
        ballsleft : Number(prev1[0].noofOvers)*6
    }
    await inningsCompleted.create(data);
    Target = prev.totalScore + 1;
}

async function Innings1_NecessaryChecks_AndUpdates(res){
    //Innings 1 Completed or Not -> 1.) Overs Completed 2.) Wickets = 10
    // Over Completed or Not - If completed get New Bowler
    const currOver = await currOverInningsDetails.findOne({bowlteamName : currBowlingTeamName});
    const batinnings = await batInningsDetails.findOne({batteamName : currBattingTeamName});
    //Over Done
    if(currOver.currOverBalls == 6){

        // These Updates are Done Only Once Over is Completed or Innings Completed:
        await update.OverDone_AllStatsUpdate(currOverInningsDetails, bowlInningsDetails, BowlerStats, 
            currBowlerName, currBowlingTeamName , batInningsDetails , currBattingTeamName);
        
        //1.) Overs Completed
        if(totalInningsOvers == currOverNo){
            //Reset curr over details - It won't be any problem if we don't reset also
            //New to create Innings Completed Schema and set need to set Target , stillRequired, BallsLeft - for chesing purpose

            await Create_Innings1Completed_Schema();
            return res.redirect("/innings_scoreboard");
        }
        else{
            //Overs are Not completed - Innings need to be continued:
            // Get new bowler
            console.log("Over Done: - Get New Bowler :");
            return res.redirect("/new_bowler");

            //Here in the new Bolwer post request - we handled 
            //Reset of currover details
            //currOverNo - imcrement
            //New Bowler insert
        }
    }
    else if( batinnings.totalWickets == 10){
        //All wickets are Fallen - Innings1 Completed
        await update.InningsDone_AllStatsUpdate(currOverInningsDetails, currBowlingTeamName , bowlInningsDetails , batInningsDetails , currBattingTeamName);
        await Create_Innings1Completed_Schema();
        return res.redirect("/innings_scoreboard");
    }
    else{
        //Over Not Completed 
        //All wickets Not Fallen
        //Continue to proceed with the Next Ball

        const batsman1stats = await BatsmanStats.findOne({batteamName: currBattingTeamName, name : currBatsman1Name});
        const batsman2stats = await BatsmanStats.findOne({batteamName: currBattingTeamName, name : currBatsman2Name});
        const bowlerstats = await BowlerStats.findOne({bowlteamName : currBowlingTeamName , name : currBowlerName});
        const batinningsScore = await batInningsDetails.findOne({batteamName : currBattingTeamName});
        const currOverInningsScore = await currOverInningsDetails.findOne({bowlteamName : currBowlingTeamName});
        const extrasdetails = await ExtrasDetails.findOne({bowlteamName :currBowlingTeamName});
        const wicketsfallen = await WicketsFallen.find({batteamName : currBattingTeamName});
        const matchdetails = await MatchDetails.find();

        return res.render("live_score" , 
            {
                title : "Live-Score" , 
                batsman1 : batsman1stats,
                batsman2 : batsman2stats,
                bowler : bowlerstats,
                batinningsScore : batinningsScore,
                curroverinningsscore : currOverInningsScore,
                extras : extrasdetails ,
                wicketsfallen : wicketsfallen,
                matchdetails : matchdetails[0],
            });
    }
}

async function Innings2_NecessaryChecks_AndUpdates(res){

    // Update Our Still Required Runs Schema
    await update.InningsCompleted_SchemaUpdate(batInningsDetails,inningsCompleted,
        currOverInningsDetails, currBattingTeamName, currBowlingTeamName, MatchDetails);

    // Match Complted or Not - 1.) Overs Completed 2.) Chased with Balls left
    // Over Completed or Not - If Completed get New Bowler

    const currOver = await currOverInningsDetails.findOne({bowlteamName : currBowlingTeamName});
    let prev = await inningsCompleted.findOne({inningsNo : 1});
    //Over Done
    if(currOver.currOverBalls == 6){

        // These Updates are Done Only Once Over is Completed or Innings Completed:
        await update.OverDone_AllStatsUpdate(currOverInningsDetails, bowlInningsDetails, BowlerStats, 
            currBowlerName, currBowlingTeamName , batInningsDetails , currBattingTeamName);
        
        //1.) Overs Completed - Still Required <=0
        //2.) Overs Completed - Still Required >=0 but wickest Left =0
        //3.) Overs Completed - Still Required = 1 - Draw Match
        
        //Overs Completed - Match Completed - Who Won ??
        if(totalInningsOvers == currOverNo){
            if(prev.stillRequired <= 0){
                // Match Completed - Chasing Team won the Match
                MatchResult =1;
                const data = {
                    teamWon : currBattingTeamName,
                    wicketsleft : prev.wicketsleft,
                    ballsleft : prev.ballsleft
                }
                await chaseTeamWin.create(data);
                return res.redirect("/match_summary");
            }
            else if(prev.stillRequired > 1){
                // Match Completed - Defending Team won the Match
                MatchResult = 2;
                const data = {
                    teamWon : currBowlingTeamName,
                    wonbyruns : prev.stillRequired-1
                }
                await defendTeamWin.create(data);
                return res.redirect("/match_summary");
            }
            else if(prev.stillRequired == 1){
                // Match Completed - Draw Match
                const data = {
                    matchResult : "Draw Match"
                }
                await matchDraw.create(data);
                console.log("*************Match Draw*****************");
                MatchResult = 3;
                return res.redirect("/match_summary");
            }
            else{
                console.log("Something is Fishy in Innings2_Necessary Checks and Updates:");
            }
        }
        else{
            //Overs are Not completed - Innings need to be continued:
            // Get new bowler
            console.log("Over Done: - Get New Bowler :");
            return res.redirect("/new_bowler");

            //Here in the new Bolwer post request - we handled 
            //Reset of currover details
            //currOverNo - imcrement
            //New Bowler insert

        }
    }
    else if(prev.stillRequired <=0 ){
        // Match Completed - Chasing Team Won the Match

        await update.InningsDone_AllStatsUpdate(currOverInningsDetails, currBowlingTeamName , bowlInningsDetails , batInningsDetails , currBattingTeamName);
        MatchResult =1;
        const data = {
            teamWon : currBattingTeamName,
            wicketsleft : prev.wicketsleft,
            ballsleft : prev.ballsleft
        }
        await chaseTeamWin.create(data);
        return res.redirect("/match_summary");
    }
    else if(prev.stillRequired > 1 & prev.wicketsleft == 0){
        // Match Completed - All Out - Defending team won the Match
        await update.InningsDone_AllStatsUpdate(currOverInningsDetails, currBowlingTeamName , bowlInningsDetails , batInningsDetails , currBattingTeamName);
        MatchResult = 2;
        const data = {
            teamWon : currBowlingTeamName,
            wonbyruns : prev.stillRequired-1
        }
        await defendTeamWin.create(data);
        return res.redirect("/match_summary");
    }
    else if(prev.stillRequired == 1 & prev.wicketsleft == 0){
        // Match Completed - Draw Match
        const data = {
            matchResult : "Draw Match"
        }
        await matchDraw.create(data);
        
        MatchResult = 3;
        await update.InningsDone_AllStatsUpdate(currOverInningsDetails, currBowlingTeamName , bowlInningsDetails , batInningsDetails , currBattingTeamName);
        return res.redirect("/match_summary");
    }
    else{
        //Over Not Completed
        //Match Not Completed
        //Continue to proceed with the Next Ball
        const batsman1stats = await BatsmanStats.findOne({batteamName: currBattingTeamName, name : currBatsman1Name});
        const batsman2stats = await BatsmanStats.findOne({batteamName: currBattingTeamName, name : currBatsman2Name});
        const bowlerstats = await BowlerStats.findOne({bowlteamName : currBowlingTeamName , name : currBowlerName});
        const batinningsScore = await batInningsDetails.findOne({batteamName : currBattingTeamName});
        const currOverInningsScore = await currOverInningsDetails.findOne({bowlteamName : currBowlingTeamName});
        const extrasdetails = await ExtrasDetails.findOne({bowlteamName :currBowlingTeamName});
        const wicketsfallen = await WicketsFallen.find({batteamName : currBattingTeamName});
        const matchdetails = await MatchDetails.find();

        return res.render("live_score" , 
                {
                    title : "Live-Score" , 
                    batsman1 : batsman1stats,
                    batsman2 : batsman2stats,
                    bowler : bowlerstats,
                    batinningsScore : batinningsScore,
                    curroverinningsscore : currOverInningsScore,
                    extras : extrasdetails ,
                    wicketsfallen : wicketsfallen,
                    matchdetails : matchdetails[0],
                    target : Target
                });

    }
}

app.get("/live_score" , async function(req , res){

    switch(currInningsNo){
        case 1 : 
            Innings1_NecessaryChecks_AndUpdates(res);
            break;

        case 2 :
            Innings2_NecessaryChecks_AndUpdates(res);
            break;
        
        default : console.log("Something is Fish in Get Livescore switch:");
    }
});

app.get("/scoreboard" , async function(req , res){
    const batsmanstats = await BatsmanStats.find({batteamName: currBattingTeamName});
    const bowlerstats = await BowlerStats.find({bowlteamName : currBowlingTeamName});
    const wicketsfallen = await WicketsFallen.find({batteamName : currBattingTeamName});
    const matchdetails = await MatchDetails.find();
    const extrasdetails = await ExtrasDetails.findOne({bowlteamName :currBowlingTeamName});
    const batinningsScore = await batInningsDetails.findOne({batteamName : currBattingTeamName});
    const currOverInningsScore = await currOverInningsDetails.findOne({currBowlerName : currBowlerName});

    res.render("scoreboard" , 
    {
        title : "ScoreBoard" , 
        batsmans : batsmanstats,
        bowlers : bowlerstats,
        batinningsScore : batinningsScore,
        curroverinningsscore : currOverInningsScore,
        extras : extrasdetails ,
        wicketsfallen : wicketsfallen,
        matchdetails : matchdetails[0],
        target : Target
    });
});

app.get("/match_summary" , async function(req , res){

    const matchdetails = await MatchDetails.find();

    const batsmanstats1 = await BatsmanStats.find({batteamName: currBattingTeamName});
    const bowlerstats1 = await BowlerStats.find({bowlteamName : currBowlingTeamName});
    const extrasdetails1 = await ExtrasDetails.findOne({bowlteamName :currBowlingTeamName});
    const wicketsfallen1 = await WicketsFallen.find({batteamName : currBattingTeamName});
    const bowlinnings1 = await bowlInningsDetails.find({bowlteamName :currBowlingTeamName});
    const batinnings1 =  await batInningsDetails.findOne({batteamName : currBattingTeamName});


    const batsmanstats2 = await BatsmanStats.find({batteamName: currBowlingTeamName});
    const bowlerstats2 = await BowlerStats.find({bowlteamName : currBattingTeamName});
    const bowlinnings2 = await bowlInningsDetails.find({bowlteamName :currBattingTeamName});
    const extrasdetails2 = await ExtrasDetails.findOne({bowlteamName :currBattingTeamName});
    const wicketsfallen2 = await WicketsFallen.find({batteamName : currBowlingTeamName});
    const batinnings2 =  await batInningsDetails.findOne({batteamName : currBowlingTeamName});

    const chaseWin = await chaseTeamWin.find();
    const defendWin = await defendTeamWin.find();



    res.render("match_summary", {
        title : "Match Summary",
        matchdetails : matchdetails[0],
        team1batsmans : batsmanstats1,
        team2batsmans : batsmanstats2,
        team1bowlers : bowlerstats1,
        team2bowlers : bowlerstats2,
        team1bowlinnings : bowlinnings1,
        team2bowlinnings : bowlinnings2,
        extras1 : extrasdetails1,
        extras2 : extrasdetails2,
        wicketsfallen1 :wicketsfallen1,
        wicketsfallen2 :wicketsfallen2,
        batteamName : currBattingTeamName,
        bowlteamName : currBowlingTeamName,
        batinnings1 : batinnings1,
        batinnings2 : batinnings2,

        matchresult : MatchResult,
        chasewin : chaseWin[0],
        defendwin : defendWin[0]
    });
})

app.get("/innings_scoreboard" , async function(req , res){
    const batsmanstats = await BatsmanStats.find({batteamName: currBattingTeamName});
    const bowlerstats = await BowlerStats.find({bowlteamName : currBowlingTeamName});
    const wicketsfallen = await WicketsFallen.find({batteamName : currBattingTeamName});
    const matchdetails = await MatchDetails.find();
    const extrasdetails = await ExtrasDetails.findOne({bowlteamName :currBowlingTeamName});
    const batinningsScore = await batInningsDetails.findOne({batteamName : currBattingTeamName});
    const currOverInningsScore = await currOverInningsDetails.findOne({currBowlerName : currBowlerName});

    const bowlinnings = await bowlInningsDetails.find({bowlteamName :currBowlingTeamName });

    res.render("innings_scoreboard" , 
    {
        title : "Innings ScoreBoard" , 
        batsmans : batsmanstats,
        bowlers : bowlerstats,
        batinningsScore : batinningsScore,
        curroverinningsscore : currOverInningsScore,
        extras : extrasdetails ,
        wicketsfallen : wicketsfallen,
        matchdetails : matchdetails[0],
        target : Target,
        bowlinnings : bowlinnings
    });

});

app.get("/new_bowler" , function(req , res){
    res.render("new_bowler" , {title : "New Bowler"});
});

app.get("/wicket" , function(req , res){
    res.render("wicket" , {
        title : "Wicket",
        batsman1 : currBatsman1Name,
        batsman2 : currBatsman2Name
    })
});
app.get("/toss" , function(req , res){
    res.render("Toss" , {
        title : "Toss",
        team1 : newMatchData.team1Name,
        team2 : newMatchData.team2Name
    })
});

app.post("/new_match" , async function(req , res){
    
    // ********************** Creating DataBase ******************************************
    const dbName = req.body.team1Name + "Vs" + req.body.team2Name;
    //const path1 = "mongodb://localhost:27017/" + dbName

    const path = "mongodb+srv://Akhil23:Akhil2311@cluster0.veppp3h.mongodb.net/" + dbName + "?retryWrites=true&w=majority";
    mongoose.connect( path , {useNewUrlParser : true});
    // ********************** Creating DataBase ******************************************

    newMatchData = {
        team1Name : req.body.team1Name,
        team2Name : req.body.team2Name,
        noofOvers : req.body.noofOvers,
    }
    res.redirect("/toss");
});

app.post("/toss" , async function(req , res){

    //******************Initialization of Match Global Variables:**************************
    if(newMatchData.team1Name == req.body.tossWon){
        if(req.body.tossResult == "Bat"){
            currBattingTeamName = newMatchData.team1Name;
            currBowlingTeamName = newMatchData.team2Name;
        }
    }
    if(newMatchData.team2Name == req.body.tossWon){
        if(req.body.tossResult == "Ball"){
            currBattingTeamName = newMatchData.team2Name;
            currBowlingTeamName = newMatchData.team1Name;
        }
    }
    totalInningsOvers = Number(newMatchData.noofOvers);
    //******************Initialization of Match Global Variables:**************************
    newMatchData.tossWonBy = req.body.tossWon;
    newMatchData.tossResult = req.body.tossResult;

    await update.Create_NewMatch(newMatchData , MatchDetails);

    res.redirect("/start_innings");
});

app.post("/start_innings" , async function(req , res){

    //******************Initialization of First Innnings Global Variables:**************************
    currBatsman1Name = req.body.batsman1Name;
    currBatsman2Name = req.body.batsman2Name;
    currBowlerName = req.body.bowlerName;
    currInningsNo = 1;
    currOverNo = 1;
    currOverBalls = 0;
    //******************Initialization of First Innnings Global Variables:**************************


    //******************* Initialization of Default Schemas ****************************************
    await update.BatsmanName_Insert(currBatsman1Name , BatsmanStats , currBattingTeamName);
    await update.BatsmanName_Insert(currBatsman2Name , BatsmanStats , currBattingTeamName);
    await update.BowlerName_Insert(currBowlerName , BowlerStats , currBowlingTeamName);
    await update.BatInningsScore_Start(currBattingTeamName, batInningsDetails , currInningsNo , totalInningsOvers);
    await update.CurrentOverInningsScore_Start(currBowlerName , currOverInningsDetails , currBowlingTeamName);
    await update.ExtrasDetails_Start(currBowlingTeamName , ExtrasDetails);
    //******************* Initialization of Default Schemas ****************************************

    res.redirect("/live_score");
});

app.post("/second_innings" , async function(req , res){
    //******************Initialization of Match 2nd Innnings Global Variables:**************************
    
    let temp = currBattingTeamName;
    currBattingTeamName = currBowlingTeamName;
    currBowlingTeamName = temp;
    currInningsNo = 2;
    currOverNo = 1;
    currOverBalls = 0;
    currBatsman1Name = req.body.batsman1Name;
    currBatsman2Name = req.body.batsman2Name;
    currBowlerName = req.body.bowlerName;

    //******************Initialization of Match 2nd Innnings Global Variables:**************************

    //******************* Initialization of Default Schemas ****************************************
    console.log(" Inilization of 2nd Innings Default Schemas :");
    await update.BatsmanName_Insert(currBatsman1Name , BatsmanStats , currBattingTeamName);
    await update.BatsmanName_Insert(currBatsman2Name , BatsmanStats , currBattingTeamName);
    await update.BowlerName_Insert(currBowlerName , BowlerStats , currBowlingTeamName);
    await update.BatInningsScore_Start(currBattingTeamName, batInningsDetails , currInningsNo ,  totalInningsOvers);
    await update.CurrentOverInningsScore_Start(currBowlerName , currOverInningsDetails , currBowlingTeamName);
    await update.ExtrasDetails_Start(currBowlingTeamName , ExtrasDetails);
    console.log(" Inilization of 2nd Innings Default Schemas -  Done");
    //******************* Initialization of Default Schemas ****************************************

    res.redirect("/live_score");
});

app.post("/live_score" , async function(req , res){

    console.log(req.body);
    await Handle_CurrentBall(req.body , res);
});

app.post("/new_bowler" , async function(req , res){
    let nextBowlerName = req.body.nextbowler;

    await update.BowlerName_Insert(nextBowlerName , BowlerStats , currBowlingTeamName);
    await update.CurrentOver_Update(nextBowlerName, currOverInningsDetails, currBowlingTeamName);

    currOverNo +=1;
    currBowlerName = nextBowlerName;
    res.redirect("/live_score");
});

app.post("/wicket" , async function(req , res){
    console.log(req.body);
    let currdata = {
        batteamname : currBattingTeamName,
        bowlteamname : currBowlingTeamName,
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
    await currentball.HandleCurrentBall_Wicket_Update(req.body , currdata , schemas);
    
    //Wicket details Updated - Now Insert New batsman
    if(currBatsman1Name == req.body.outbatsman){
        currBatsman1Name = req.body.nextbatsman;
    }
    else{
        currBatsman2Name = req.body.nextbatsman;
    }
    //Enter New batsman name in the Batsman Stats table
    await update.BatsmanName_Insert(req.body.nextbatsman , BatsmanStats , currBattingTeamName);
    res.redirect("/live_score");
});

app.post("/innings_scoreboard" , async function(req , res){
    return res.redirect("/second_innings");
})

async function Handle_CurrentBall(data , res){

    console.log("Entered Handle Current Ball function:");

    let currdata = {
        batteamname : currBattingTeamName,
        bowlteamname : currBowlingTeamName,
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

    let ballstatus = ""
    if(typeof(data.mycheckbox) == "object"){
        ballstatus = data.mycheckbox.join("")
    }
    else{

        if(Object.keys(data).length == 2){
            ballstatus = "0";
        }
        else if(typeof(data.mycheckbox) == "string" & data.mycheckbox == '5'){
            //Good Ball and Wicket
            ballstatus = "05";
        }
        else if(typeof(data.mycheckbox) == "string"){
            ballstatus = data.mycheckbox;
        }
        else{
            console.log("Something is Fishy !.. Entered in Ball Status !..");
        }
    }
    
    console.log("Current Ball Status = " , ballstatus);

    switch(ballstatus){
        case "0" : console.log("Good Ball");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_GoodBall_Update(data ,currdata, schemas);
        return res.redirect("/live_score");

        case "05" : console.log("Good Ball + Wicket");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_GoodBall_Update(data ,currdata, schemas);
        return res.redirect("/wicket");
        
        
        case "1" : console.log("wide");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_Wide_Update(data ,currdata, schemas);
        return res.redirect("/live_score");

        case "13" : console.log("wide + byes"); 
        //No increase in count of Balls
        await currentball.HandleCurrentBall_WideByes_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "15" : console.log("wide + Wicket");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_Wide_Update(data ,currdata, schemas);
        return res.redirect("/wicket");

        case "135" : console.log("wide + byes + wicket");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_WideByes_Update(data , currdata , schemas);
        return res.redirect("/wicket");


        case "2" : console.log("Noball");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBall_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "23" : console.log("Noball + byes"); 
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBallByes_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "24" : console.log("Noball + legbyes");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBallLegbyes_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "25" : console.log("Noball + wicket");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBall_Update(data , currdata , schemas);
        return res.redirect("/wicket");

        case "235" : console.log("Noball + byes + wicket"); 
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBallByes_Update(data , currdata , schemas);
        return res.redirect("/wicket");

        case "245" : console.log("Noball + legbyes + wicket");
        //No increase in count of Balls
        await currentball.HandleCurrentBall_NoBallLegbyes_Update(data , currdata , schemas);
        return res.redirect("/wicket");


        case "3" : console.log("byes");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_Byes_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "35" : console.log("byes + wicket");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_Byes_Update(data , currdata , schemas);
        return res.redirect("/wicket");


        case "4" : console.log("legbyes");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_Legbyes_Update(data , currdata , schemas);
        return res.redirect("/live_score");

        case "45" : console.log("legbyes + wicket");
        //Increase in count of Balls
        await currentball.HandleCurrentBall_Legbyes_Update(data , currdata , schemas);
        return res.redirect("/wicket");


        case "6" : console.log("retire") ; break;

        default : console.log("Something is Fishyy!.. Entered Default case in Handle Current Ball"); break;
    }     
}

app.listen(3000 , function(){
    console.log("Server is listening on Port 3000 :")
});

