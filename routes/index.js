/* 
Auteur: Charles Leroux
Date: 23/10/2024
Fichier: index.js
Description: Fichier serveur du labo7
             Gestion de la base de donnée et des utilisateur
*/

var express = require('express');
var router = express.Router();
var session = require('cookie-session');
var mysql = require('mysql');
const { render } = require('../app');
var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'labo7'
});

connection.connect(function (err) {
  if (err) throw err;
  console.log('Vous êtes connecté à votre BDD...');
});

router.use(session({ secret: 'toDoTopSecret' }))
  .use(function (req, res, next) {
    if (typeof (req.session.user) == 'undefined') {
      req.session.user = {
        id: 0,
        login: '',
        droit: 0,
        message: "",
        password: ""
      }
    }
    next();
  })

  /* GET home page. */
  .get('/', function (req, res, next) {

    if (req.session.user.droit == 3) {
      var queryString = 'Select * From user';
      connection.query(queryString, function (err, rows, fields) {
        if (!err)
          res.render('pageUser', { database: rows, user: req.session.user });
      })
    }

    else if (req.session.user.id > 0) {
      res.render('pageUser', { user: req.session.user })
    }

    else {
      res.render('index', { title: 'Express' });
    }
  })

  .post('/', function (req, res) {
    console.log(req.session.user);
    var login = req.body.login
    var password = req.body.password
    console.log(login);
    console.log(password);
    var queryString = 'Select * From user Where Login = ? AND Password = ?';

    connection.query(queryString, [login, password], function (err, rows, fields) {

      if (!err) {

        if (rows.length) {
          console.table(rows);
          req.session.user.id = rows[0].Id;
          req.session.user.login = rows[0].Login;
          req.session.user.droit = rows[0].Droit;
          req.session.user.message = rows[0].Texte;
          req.session.user.password = rows[0].Password

          res.redirect('/');
          return;
        }
        else
          res.render('index', { title: 'username or password invalid' });
      }
    })
  })
  .post('/logout', function (req, res) {
    console.log("bye bye");
    req.session.user = {
      id: 0,
      login: '',
      droit: 0,
      message: ""
    }
    res.redirect('/');

  })
  .post('/changerMessage', function (req, res) {
    var queryString = "Update user Set Texte = ? Where Id = ?"

    connection.query(queryString, [req.body.texteChanger, req.session.user.id], function (err, rows, fields) {
      if (!err) {
        req.session.user.message = req.body.texteChanger;
        res.redirect('/');
      }
    })
  })

  .post('/changerPassword', function (req, res) {
    var queryString = "Update user Set Password = ? Where Id = ?"

    connection.query(queryString, [req.body.passwordChange, req.session.user.id], function (err, rows, fields) {
      if (!err) {
        req.session.user.password = req.body.passwordChange;
        res.redirect('/');
      }
    })
  })
module.exports = router;
