const express = require("express");
const {engine} = require("express-handlebars");
const { helpers } = require("handlebars");
const mySql = require("mysql2");

var { body, validationResult} = require('express-validator');
require('dotenv').config();
const port = 1000;
// const bodyParser = ("body-parser"); express works instead of it

const app = express();
console.log(__dirname + 'view');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(express.static('public'));
app.use(express.static('views'));
//setting handlebars
app.engine('hbs',engine({extname: '.hbs'}));
app.set('view engine', '.hbs')

//broadcasting a port
app.listen(port,function(){
    console.log(`Connected to Server ${port}`);
})

//connecting to server pool
const pool = mySql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
});

app.use('/people',require('./routes/people.js'));
app.use('/employee',require('./routes/employee.js'));
app.use('/event',require('./routes/event.js'));




app.get('/',function(req,res){
    pool.getConnection(function(error,connection){
        if (error) throw error;
        console.log("Connection ID " + connection.threadId);

        connection.query('Select * from people',function (err, entity){
            connection.release();

            if(err) throw err;
            
            res.redirect('/people');


        });

    })

})
