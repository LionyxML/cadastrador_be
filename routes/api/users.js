const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');


/*
  Rotas planejadas:
  @route POST api/users/register
  @desc Registra o usuário
  @access Público
*/
router.post('/register', (req, res) => {
  let {
    nome,
    sobrenome,
    nascimento,
    telefone,
    endereco,
    email,
    usuario,
    senha,
    senhaRepetida
  } = req.body;

  if(senha != senhaRepetida) {
    return res.status(400).json({
      msg : "Senhas não conferem"
    });
  }

  // Verifica se o usuário é único no Banco
  User.findOne({
    usuario : usuario
  }).then(user => {
    if (user) {
      return res.status(400).json({
        msg : "Nome de usuário já está opcupado"
      });
    }
  });

  // Verifica se o e-mail é único no Banco
  User.findOne({
    email : email
  }).then(user => {
    if (user) {
      return res.status(400).json({
        msg : "Email já está registrado. Esqueceu sua senha?"
      });
    }
  });

  // Os dados são válidos e podemos registrar o usuário
  let newUser = new User({
    nome,
    sobrenome,
    nascimento,
    telefone,
    endereco,
    email,
    usuario,
    senha
  });

  // Hash na senha
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.senha, salt, (err, hash) => {
      if(err) throw err;
      newUser.senha = hash;
      newUser.save().then(user => {
        return res.status(201).json({
          success: true,
          msg: "O usuário foi registrado com sucesso!"
        });
      });
    });
  });

});




module.exports = router;
