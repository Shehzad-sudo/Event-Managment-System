const express = require("express");
const router = express.Router();
var { body, validationResult} = require('express-validator');


const mySql = require("mysql2");
require('dotenv').config();

//connecting to server pool
const pool = mySql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
});


// /people already stated in app.js
router.get('/',function(req,res){

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);

        connection.query('Select * from people',function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.render('people',{entity});


        });
    })
})


router.post('/add',function(req,res){
    const {firstName, lastName, phone, email, gender, cnic, occupation} = req.body;
    body('firstName').notEmpty();
    body('lastName').notEmpty();
    body('phone').notEmpty();
    body('email').notEmpty();
    body('gender').notEmpty();
    body('cnic').notEmpty();
    body('occupation').notEmpty();

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
        
        connection.query('Insert into people set firstName =? , lastName =?, phoneNumber=?, email=?, gender=?, cnic=?,occupation=?',[firstName, lastName, set_phone(phone), email, gen(gender), cnic, occupation],function (err, entity){
            connection.release();

            if(err) throw err;

            res.redirect('/people/add');
         });
    })
});

router.get('/add',function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);

            if(err) throw err;
            
            res.render('addPeople');
         });
    
});



router.get('/edit/:id' , function(req,res){
    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('Select * from people where PeopleID = ?',[req.params.id],function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.render('editPeople',{entity,
                
                    helpers: {
                        if_eq: function(a, b, opts) {
                            if (a == b)
                                return opts.fn(this);
                         }   
                    }      
            })
         })
    })
})


router.post('/edit/:id' , function(req,res){
    const {firstName, lastName, phone, email, gender, cnic, occupation} = req.body;
    body('firstName').notEmpty();
    body('lastName').notEmpty();
    body('phone').notEmpty();
    body('email').notEmpty();
    body('gender').notEmpty();
    body('cnic').notEmpty();
    body('occupation').notEmpty();

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('update people set firstName =? , lastName =?, phoneNumber=?, email=?, gender=?, cnic=?,occupation=? where peopleID=?',[firstName, lastName, phone, email, gen(gender), cnic, occupation, req.params.id],function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/people');
         })
    })
})



router.get('/delete' , function(req,res){
    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('delete from people where peopleID=?',[req.body.deleteID],function (err,entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/people');
         })
    })
})


module.exports = router;

function set_phone(phone_num){
    return '+92'+phone_num;
}

function gen(gender){
    if(gender === 'Male') return 1;
    if(gender === 'Female') return 2;
    if(gender === 'Other') return 3;
}


