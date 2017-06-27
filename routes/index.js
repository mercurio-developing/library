const express = require('express'),   ///declare all modules
	 router = express.Router(),
	 Book   = require('../models').books,
	 Patron = require('../models').patrons,
	 Loan   = require('../models').loans,
	 moment = require('moment');

router.get("/",function(req,res){             //route home render index
    res.render("index");
}); 

module.exports = router;