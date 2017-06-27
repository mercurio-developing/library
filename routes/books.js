const express = require('express'), //declare all variables
	     router = express.Router(),
         Book = require("../db.js").books,
         Loan = require("../db.js").loans,
       Patron = require("../db.js").patrons,
       moment = require('moment');


router.get('/all_books', function(req, res, next) { //request of data in Book 
        Book.findAll().then(function (books) { //find all in Book
            res.render("all_books", { //render directive all books
                books: books  
            });
        });
      });

router.get('/overdue', function(req, res, next) { 
          var date = moment(); //set date with moment
          Loan.findAll({  //find all in Loan and include the model book 
            include: [
              {
                model: Book,
              }],
              where: {     //where return by is < of date now
              return_by: {
                  $lt: date
                },
              returned_on: { //and return on is null
                $eq: null
              }
            }
          }).then(function(loans) { //render in directive overdue
              res.render('overdue_books', {loans: loans})
          });
        });

router.get('/checked_out', function(req, res, next) {
          Loan.findAll({  //find all in  Loan and include model Book
              include: [                       
              {
                model: Book, 
              }],
              where: {             //where return = Null
                returned_on: {
                  $eq: null}
                }
              }).then(function(loans) {  //render in checked books
              res.render('checked_books', {loans: loans}) 
          });
         });



router.route('/new_book') //in this route the user can create a book
      
      .get(function(req, res,next) {  
          res.render("new_book",{ 
            book:{
              book: Book.build() //generate instance method
            }
          });
        })
      .post(function(req, res, next) { 
        Book.create(req.body).then(function(book) {  //use req.body and create in the table books
            res.redirect('/books/all_books')   //redirect to list of books
        }).catch(function(err){
            if(err.name === "SequelizeValidationError") {   //catch validation before render
                res.render("new_book", {                    
                book: Book.build(req.body),         //book build with the req body 
                errors: err.errors    
              })
            } else {
              throw err;
            }
        }).catch(function(err){
            res.send(500, err);
         })
      ;});

router.route('/book_detail/:id')
    
     .get(function(req, res){
        Book.findById(req.params.id).then(function(book){   //find by id in Book with req.params   
            Loan.findAll({
              include: [
                { 
                  model: Book    //include models
                },
                {
                  model: Patron
                }
                ],
                where: {                //condition
                  book_id: book.id
                }
                }).then(function(loans){
                  if(loans){
                    res.render('book_detail', {  //render
                      book: book, 
                      loans: loans
                    });
                  } else {
                    res.sendStatus(404);
                  }
                }).catch(function(err) {
                    res.sendStatus(500);
                 }); 
                })
              })

            .post(function(req, res, next) {
               Book.findById(req.params.id).then(function(book,error) {  //find by ID with req.params
                       if(book){ 
                       return book.update(req.body);   //update book with req.body
                       } else {
                       res.sendStatus(404);
                      }
                    }).then(function() {
                      res.redirect('/books/all_books');        //redirect               
                    }).catch(function(err) {
                      if(err.name === "SequelizeValidationError") {
                        Loan.findAll({
                          include: [
                            {model: Book},         //include models
                            {model: Patron}
                          ],
                          where: {
                            book_id: book.id      //condition
                          }
                        }).then(function(loans) {
                          if(loans){               
                          req.body.id = req.params.id;
                          res.render('book_detail', {       //render
                            book : book, 
                            loans: loans,
                            errors: err.errors
                          });
                          } else {
                           res.sendStatus(404);           //cat errors
                         }
                        }).catch(function(err) {
                            res.sendStatus(500);
                          }); 
                      }else {
                        throw err;
                      } 
                    });
                  });       


router.route('/return_book/:id')
      
       .get(function(req, res){                                     
          Book.findById(req.params.id).then(function(book){       //find by ID
              Loan.findOne({
                include: [
                  {model: Book},
                  {model: Patron}],            //include models
                  where: { 
                    book_id: book.id         //condition
                    }
                  }).then(function(loan){
                    if(loan){
                  res.render('return_book', {
                      returned_on: moment().format('YYYY-MM-DD'),        //set with moment and render
                      loan: loan,
                      book:book
                    });
                  } else {
                    res.send(404);
                  }
                 }).catch(function(err) {                  
                    res.sendStatus(500);
                 }); 
               });
             })

      .post(function(req, res, next) {                           
        Loan.update({                                
          returned_on: req.body.returned_on,         //update return on with de req.body of returned on 
        }, {
          where: {
            book_id: req.params.id     //condition 
          }
        }).then(function(loan) {
          res.redirect('/loans/all_loans');      //redirect
        }).catch(function(err) {
          if (err.name === 'SequelizeValidationError') {
            Loan.findAll({
              include: [{
                model: Book,        //include model Book
                where: {
                  id: req.params.id
                },
              }, {
                model: Patron
              }]
            }).then(function(loan) {
              res.render('return_book', {       //render with moment
                loan: loan,
                returned_on: moment().format('YYYY-MM-DD'),
                errors: err.errors
              });
            });
          } else {
            res.send(500, err);
          }
        });
      });

module.exports = router;