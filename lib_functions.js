hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } 
    // else {
    //     return opts.inverse(this);
    // }
});



    //var data = [ {firstName, lastName, phone, email, gender, cnic, occupation} = req.body];
    //console.log(data);
    // for(var i = 0; i < data.size();i++){
    //     req.checkBody('\''+data[i] + '\'');
    // };