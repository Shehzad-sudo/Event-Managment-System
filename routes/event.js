const { json } = require("body-parser");
const { request } = require("express");
const express = require("express");
const router = express.Router();
var { body, validationResult} = require('express-validator');
var dateformat = import('dateformat');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));



const mySql = require("mysql2");
require('dotenv').config();

//connecting to server pool
const pool = mySql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    dateStrings: true
});


router.get('/ongoing', function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);
        connection.query("select event.*,(totalSeats - reservedSeats) as seatsAva,location.name as location from event inner join location where startTime < curtime() and endTime > curtime() and location.locationID = fklocation order by startTime desc", function(err,entity){
        
        connection.release();
            if(err) throw err;
            console.log(entity.length);
            res.render('event',{entity});
        });
    })
})

router.get('/passed', function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);
        connection.query("select event.*,(totalSeats - reservedSeats) as seatsAva,location.name as location from event inner join location where endTime < curtime() and location.locationID = fklocation order by startTime;", function(err,entity){
        
        connection.release();
            if(err) throw err;
            console.log(entity.length);
            res.render('event',{entity});
        });
    })
})

router.get('/upcoming', function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);
        connection.query("select event.*,(totalSeats - reservedSeats) as seatsAva,location.name as location from event inner join location where startTime > curtime() and location.locationID = fklocation order by startTime;", function(err,entity){
        
        connection.release();
            if(err) throw err;
            console.log(entity.length);
            res.render('event',{entity});
        });
    })
})






router.post('/add', function(req,res){
    const {Name, type, location, startTimeHid, endTimeHid,capacity} = req.body;
    startTime = forDT(startTimeHid);
    endTime = forDT(endTimeHid);

    console.log(Name);
    console.log(endTime);
    console.log(endTimeHid);
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);
        connection.query("Insert into event set name=?,type=?,fklocation=?,startTime=?,endTime=?,totalSeats=?",[Name,type,location,startTime,endTime,capacity], function(err,entity){
        
        connection.release();
            if(err) throw err;
            
            res.redirect('/event/ongoing');
        });
    })
})




router.get('/addlocation', function(req,res){
    pool.getConnection(function(err,connection){
        connection.release();
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);
            if(err) throw err;
            
            res.render('addEventloc');
    })        
})    



router.post('/addlocation',function(req,res){
    const {Name, Address} = req.body;
    body('Name').notEmpty();
    body('Address').notEmpty();

 

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
        
        connection.query('Insert into location set name =? , address =?',[Name, Address],function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/event/addlocation');
            
         });
    
    })
});





router.get('/addEvent',function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID"+connection.threadID);

        connection.query('Select * from location',function(err,entity){
            if (err) throw err;
            res.render('addEvent',{entity});
        })
    })

});

router.post('/addEventDated',function(req,res){
    const {startTime,endTime} = req.body;

    startTimeFor = startTime.replace('T', ' ');
    startTimeFor += ':00';
    endTimeFor = endTime.replace('T', ' ');
    endTimeFor += ':00';

    startTimeFor = new Date(startTimeFor);
    endTimeFor = new Date(endTimeFor);

    
    console.log(startTimeFor.getTime());

    // console.log(startTime);
    // console.log(typeof(startTime));
    
    // startTime_html = JSON.stringify(startTime);
    // endTime_html = JSON.stringify(endTime);


    // console.log(typeof(startTime_html));
    // console.log(startTime_html);

    // startTime_format=new Date(startTime_html);                   //.("Y-m-d H:i:s",strtotime(startTime_html));
    // endTime_format=new Date(endTime_html);                      //.("Y-m-d H:i:s",strtotime(endTime_html));

    // console.log(startTime);
    // console.log(endTime);

    var locAval = [];
    var locbool = [];
    var jsonlocAval;
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID"+connection.threadID);

        connection.query('Select * from event',function(err,entity){
            if (err) throw err;
            locAval.length =  entity.length ;
            locAval.fill(1);
            console.log(DateIt(endTimeFor));
           // console.log(entity[0].startTime);
            for(var i = 0; i < entity.length; i++){
                console.log(DateIt(entity[i].startTime));
                console.log(DateIt(entity[i].endTime));
                //if timeoverlap
                if(( DateIt(startTimeFor) > DateIt(entity[i].startTime) && DateIt(startTimeFor) < DateIt(entity[i].endTime) ) ||  ( DateIt(endTimeFor) > DateIt(entity[i].startTime) && DateIt(endTimeFor) < DateIt(entity[i].endTime))  ){
                    locAval[entity[i].fklocation - 1] = 0;
                    console.log('no');
                    
                }

                
            }

        console.log(locAval.length);
        

        
        
    })

    //connection.query('Update location set description=?' ,[jsonlocAval]);

    connection.query('Select * from location',function(err,entity){
        if (err) throw err;
        console.log(entity.length);
        for(i = 0; i < entity.length; i++){
            locbool[i] = locAval[i];
        }
        jsonlocAval = JSON.stringify(locbool);
        console.log(jsonlocAval);

        
        connection.release();
        res.render('addEventDated',{entity,data:jsonlocAval,
                                    helpers:{
                                        json: function(obj) {
                                            return JSON.stringify(obj);
                                          }
                                    }
        
        });
    })
})
});

router.patch('/setLoc',function(req,res){
    const {startTime,endTime} = req.body;
    var locAval = [];
    pool.getConnection(function(err,connection){
        if (err) throw err;
        
        console.log("Connection ID"+connection.threadID);

        connection.query('Select * from event',function(err,entity){
            if (err) throw err;
            locAval(entity.length).fill(1);
            for(var i = 0; i < entity.length; i++){
                //if timeoverlap
                if(( startTime > entity[i].startTime && startTime < entity[i].endTime) ||  ( endTime > entity[i].startTime && endTime < entity[i].endTime)  ){
                    locAval[entity[i].fklocation] = 0;
                }
            }
            res.send(locAval);
        })
    })

});


router.get('/visitor/:id', function(req,res){

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);

        connection.query(' select * from people where peopleID not in  (select fkpeople from visitor where fkevent = ?); ',[req.params.id],function(err,entity){
            connection.release();
            if(err) throw err;
            console.log(entity[0]);

            res.render('eventPeople',{entity});

        });
 

    });
    
})


router.get('/addpeopleEvent/:eventID/:peopleID' , function(req,res){

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('insert into visitor set fkpeople = ?,fkevent=? ',[req.params.peopleID ,req.params.eventID],function (err, entity){
            connection.release();

            if(err) throw err;
         })
    })
})
module.exports = router;








function forDT(date){
    if(!date) return;
    d = date.replace('T', ' ');
    d += ":00";
    return d;
}

function DateIt(date){
    dat = new Date(date);
    return dat.getTime();
}