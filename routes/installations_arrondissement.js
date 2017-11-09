var express = require('express');
var db_pat = require('./db_patinoires.js');
var router = express.Router();

/* GET  */
router.get('/', function(req, res, next) {
  var nomArr = req.param('arrondissement');
  console.log(nomArr.toString());
  db_pat.getConnection(function(err, db){
    if(err){
      console.log("erreur");
    }else{
      db.collection('patinoires', function (err, patinoires){
        patinoires.find({nom_arr:nomArr.toString()}).toArray(function (err, patArr){
          console.log(patArr);
          console.log("typePatArr : " + typeof patArr);
          res.json(patArr);
        });
      });
      db.close();
    }
  });
});

module.exports = router;
