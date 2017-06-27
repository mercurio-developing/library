'use strict';
module.exports = function(sequelize, DataTypes) {
  var books = sequelize.define('books', {
    id: {
         type: DataTypes.INTEGER,
         primaryKey: true
       },
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Author is required"
        }
      }
    },
    genre: {
   type: DataTypes.STRING,
   validate: {
     notEmpty: {
       msg: "Genre is required"
     }
   }
 },
    first_published: DataTypes.INTEGER
  }, 
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
      timestamps: false
  });
  return books;
};