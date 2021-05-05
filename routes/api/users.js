const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');


/*
  Rota planejada:
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

/*
  Rota planejada:
  @route POST api/users/login
  @desc Logando o usuário
  @access Público
*/
router.post('/login', (req, res) => {
    User.findOne({
      usuario: req.body.usuario
    }).then(user => {
      if(!user) {
        return res.status(404).json({
          msg : "Usuário não encontrado",
          success : false
        });
      }
        // Se o usuário existir, comparamos a senha
        bcrypt.compare(req.body.senha, user.senha).then(isMatch => {
          if (isMatch) {
            // Senha está correta, enviar o token jason para o user
            const payload = {
              _id : user._id,
              usuario : user.usuario,
              nome : user.nome,
              email : user.email
            }
            jwt.sign(payload, key, {
              expiresIn: 604800
            }, (err, token) => {
              res.status(200).json({
                success: true,
                usuario: user,
                token: `BEARER ${token}`,
                msg: "Você está logado!"
              })
            })

          } else {
            return res.status(404).json({
              msg : "Senha incorreta!",
              success : false
            });
          }
        })
    });
});

/*
  Rota planejada:
  @route POST api/users/profile
  @desc Retorna os dados do usuário
  @access Privado
*/
router.get('/profile', passport.authenticate('jwt', {
  session : false
}), (req, res) => {
  return res.json({
     user: req.user
  });
});

module.exports = router;
