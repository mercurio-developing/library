const express = require('express');
  	   router = express.Router(),
    		 Book = require("../db.js").books,
         Loan = require("../db.js").loans,
       Patron = require("../db.js").patrons,
       moment = require('moment');


router.get('/all_patrons', function(req, res, next) {
  Patron.findAll().then(function(patrons){             //find all patrons
    res.render("all_patrons",
     {
    	patrons: patrons         //render
    });
  }).catch(function(err){
      res.send(500, err);
   });
});

router.route("/new_patron")              
     
      .get(function(req, res,next) {         
      		res.render("new_patron",{
      			patron: Patron.build()  //instance method to build a object
      		});
      	})
      .post(function(req, res,next) {
        Patron.create(req.body).then(function(patron) { //patron create with req.body
          res.redirect("/patrons/all_patrons");
        }).catch(function(err){
            if(err.name === "SequelizeValidationError") {
              res.render("new_patron", {             //render
              	patron: Patron.build(req.body),    
                errors: err.errors
              });
            } else {
              throw err;
            }
        }).catch(function(err){
            res.send(500, err);
         });
      });

router.route('/patron_detail/:id')
      
      .get(function(req, res,next){
          Patron.findById(req.params.id).then(function(patron){  //Find all patrons by ID
          Loan.findAll({           //Find all loans 
            include: [
              {
                model: Book        //include models
              },
              {
                model: Patron
              }
              ],
              where: {              // condition
                patron_id: patron.id
              }
              }).then(function(loans){
                  res.render('patron_detail', {      //render
                    patron: patron, 
                    loans: loans
                  })
              });
            })
          })

      .post(function(req, res, next) {                          
          Patron.findById(req.params.id).then(function(patron) {       //Patron find by ID with req.params
            return patron.update(req.body);
          }).then(function() {
            res.redirect('/patrons/all_patrons');     //redirect
          }).catch(function(err) {
            if(err.name === "SequelizeValidationError") {  //validation
              Loan.findAll({        //find all Loans
                include: [
                  {model: Book},     //include models
                  {model: Patron}
                ],
                where: {
                  patron_id: patron.id    //condition
                }
              }).then(function(loans) {
                res.render('patron_detail', {
                  patron: patron, 
                  loans: loans,            //render
                  errors: err.errors
                });
              }).catch(function(err) {
                  res.sendStatus(500);
                }); 
            } else {
              throw err;
            }
          });
        });


module.exports = router;