'use strict'

const db = {};

// Connect all the models/tables in the database to a db object,
//so everything is accessible via one object

db.books = require('./models').books;
db.loans = require('./models').loans; 
db.patrons = require('./models').patrons;
db.sequelize = require("./models/index.js").sequelize;


db.books.hasMany(db.loans,{foreignKey: 'book_id'});
db.loans.belongsTo(db.books,{foreignKey: 'book_id'});

db.patrons.hasMany(db.loans,{foreignKey: 'patron_id'});
db.loans.belongsTo(db.patrons,{foreignKey: 'patron_id'}); 

module.exports = db;  
