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


router.get('/',function(req,res){

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);

        connection.query('Select * from employee',function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.render('employee',{entity});


        });

    })

})


router.post('/add',function(req,res){
    const {firstName, lastName, phone, email, gender, cnic, salary,work} = req.body;
    body('firstName').notEmpty();
    body('lastName').notEmpty();
    body('phone').notEmpty();
    body('email').notEmpty();
    body('gender').notEmpty();
    body('cnic').notEmpty();
    body('salary').notEmpty();
    body('work').notEmpty();

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
        
        connection.query('Insert into employee set firstName =? , lastName =?, phoneNumber=?, email=?, gender=?, cnic=?,salary=?,work=?',[firstName, lastName, set_phone(phone), email, gen(gender), cnic, salary ,work],function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/employee/add');
            
         });
    
    })
});

router.get('/add',function(req,res){
    pool.getConnection(function(err,connection){
        if (err) throw err;
        console.log("Connection ID " + connection.threadId);

            if(err) throw err;
            
            res.render('addEmployee');
         });
    
});



router.get('/edit/:id' , function(req,res){
    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('Select * from employee where employeeID = ?',[req.params.id],function (err, entity){
            connection.release();

            if(err) throw err;
            console.log(entity[0].email);
            
            res.render('editEmployee',{entity,
                
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
    const {firstName, lastName, phone, email, gender, cnic, salary,work} = req.body;
    body('firstName').notEmpty();
    body('lastName').notEmpty();
    body('phone').notEmpty();
    body('email').notEmpty();
    body('gender').notEmpty();
    body('cnic').notEmpty();
    body('salary').notEmpty();
    body('work').notEmpty();

    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);
 
        connection.query('update employee set firstName =? , lastName =?, phoneNumber=?, email=?, gender=?, cnic=?,salary=? ,work=? where employeeID=?',[firstName, lastName, phone, email, gen(gender), cnic, salary, work, req.params.id],function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/employee');
         })
    })
})




router.post('/delete' , function(req,res){
    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);

            res.render('addPeople');
            connection.query('delete from employee where employeeID=?',req.body.deleteID,function (err,entity){
                connection.release();

                if(err) throw err;
                
                res.redirect('/employee');
            })
        
    })
})


module.exports = router;




function gen(gender){
    if(gender === 'Male') return 1;
    if(gender === 'Female') return 2;
    if(gender === 'Other') return 3;
}

function set_phone(phone_num){
    return '+92'+phone_num;
}