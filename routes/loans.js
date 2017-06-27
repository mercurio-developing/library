const express = require('express');
	     router = express.Router(),
 	       Book = require("../db.js").books,
         Loan = require("../db.js").loans,
       Patron = require("../db.js").patrons,
       moment = require('moment');

router.get('/all_loans', function(req, res, next) {        
        Loan.findAll({
                include: [
                    {
                        model: Book                       //include  models  
                    },
                    {
                        model: Patron
                    }
                ]
            }).then(function (loans) {
                res.render("all_loans", {     //render
                    loans: loans
                });
            });
        });

router.get('/checked_out', function(req, res, next) {     
        Loan.findAll({                               //find all return on = null
            where: {returned_on: {$eq: null}},
            include: [
                        {model: Book}, 
                        {model: Patron}
                    ]
        }).then(function(loans) {
            res.render('checked_loans', {loans:loans}); //render
        }).catch(function(err) {
            res.sendStatus(500);
        });
    }); 

router.get('/overdue', function(req, res, next) {    //find all return on = null and returnby <  date now
        Loan.findAll({
            where: {returned_on: {$eq: null}, return_by: {$lt: new Date()}},
            include: [
                        {model: Book},       
                        {model: Patron}
                    ]
        }).then(function(loans) {
            res.render('overdue_loans', {loans: loans});  //render
        }).catch(function(err) {
            res.sendStatus(500);
        });
      });   


router.route('/new_loan')                           
      

      .get(function(req, res, next) {             
        Book.findAll().then(function(books) {            //find all the books
            Patron.findAll().then(function(patrons) {   //find all the patrons
                res.render('new_loan',                 //render
                {
                    books : books, 
                    patrons: patrons, 
                    loaned_on: moment().format('YYYY-MM-DD'),
                    return_by: moment().add('7', 'days').format('YYYY-MM-DD')
                });

            }).catch(function(err) {
                res.sendStatus(500);
            });
          });
        })

        .post(function(req, res, next) {                 
          Loan.create(req.body).then(function(loan) {    //create loan with req.body
              res.redirect('/loans/all_loans')
          }).catch(function(err){                         //redirect
              if(err.name === "SequelizeValidationError") {  
                  res.render("new_loan", {                    //render 
                  loan: Loan.build(req.body),                  
                  loaned_on: moment().format('YYYY-MM-DD'),
                  return_by: moment().add('7', 'days').format('YYYY-MM-DD'),
                  errors: err.errors
                })
              } else {
                throw err;
              }
          }).catch(function(err){
              res.send(500, err);
           })
        ;});


module.exports = router;