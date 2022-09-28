

create database visitorDirect;
use visitordirect;

create table location(
		locationID int auto_increment, name varchar(20), address varchar(50),
        primary key(locationID)
);
        
        
create table people(
		peopleID int primary key not null auto_increment,firstName varchar(20),
        lastName varchar(20), phoneNumber varchar(32), email varchar(40), description varchar(50),
        gender enum('M','F','Others'), cnic varchar(20), occupation varchar(20)
		);
        
create table event(
	eventID int primary key auto_increment, name varchar(20), 
	type enum('Award Ceremony','Meeting', 'Seminar', 'Party', 'Other'),
	startTime datetime, endTime datetime, Description varchar(40), totalSeats int default 0,
	reservedSeats int default 0,
	fklocation int,
	foreign key (fklocation) references location(locationID)
);
        
create table visitor(
		visitorID int primary key auto_increment,
		fkpeople int,foreign key(fkpeople) references people(peopleID),
        fkevent int,foreign key(fkevent) references event(eventID),
        invStatus enum('present','leave','rejected','waiting arrival','not come','other'),
        checkIn datetime, checkOut datetime
        );

create table employee(
		employeeID int not null auto_increment,firstName varchar(20),
        lastName varchar(20), phoneNumber varchar(32), email varchar(40), description varchar(50),
        gender enum('M','F','Others'), cnic varchar(20), work varchar(20), salary varchar(20),
        dateOfBirth datetime, primary key(employeeID)
);

create table employeeWork(
		fkemployee int, foreign key(fkemployee) references employee(employeeID),
        fkevent int, foreign key(fkevent) references event(eventID),
        primary key(fkemployee, fkevent),
        checkIn datetime, checkOut datetime
        );
        
        
delimiter //
create trigger aval_seats after insert on 
	visitor for each row 
    begin
    update event set reservedSeats = reservedSeats+ 1
    where  event.eventID = (select fkevent from visitor order by visitorID desc Limit 1) ;
    End //

delimiter ;


        