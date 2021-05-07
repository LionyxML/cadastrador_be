const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');
const multer = require('multer');
const glob = require('glob');
var path = require('path');


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
  } = req.body

  if(senha !== senhaRepetida) {
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


  // TODO: esse insert feito depois da criação do model de usuário, com tempo, passar para o User.js
  // Procura por uma foto do usuário, se não houver uma, repassa o nome noone.png
  let found = glob.sync(path.join(__dirname+'../../../uploads/') + req.user.usuario + '.*');
  let profilePic = "";
  if (found.length !== 0) {
    profilePic = found[0].split("/").pop();
  } else {
    profilePic = 'noone.png'
  }

  // req.user não é trivialmente copiável, fazer um ...req.user , map ou outra ação
  // de objeto para criar a cópia de req.user + o avatar
  var passingObj = {};
  passingObj["usuario"] = req.user.usuario;
  passingObj["_id"] = req.user._id;
  passingObj["nome"] = req.user.nome;
  passingObj["sobrenome"] = req.user.sobrenome;
  passingObj["nascimento"] = req.user.nascimento;
  passingObj["telefone"] = req.user.telefone;
  passingObj["endereco"] = req.user.endereco;
  passingObj["email"] = req.user.email;
  passingObj["senha"] = req.user.senha;
  passingObj["criacao"] = req.user.criacao;
  passingObj["__v"] = req.user.__v;
  passingObj["avatar"] = profilePic;

  // Retorna o objeto procurado + o avatar encontrado
  return res.json({
     user: passingObj
  });
});

/*
  Rota planejada:
  @route POST api/users/upload
  @desc Insere o avatar do usuário na pasta uploads
  @access Privado no futuro
*/
var storage = multer.diskStorage(
    {
      destination: function (req, file, cb) {
        cb(false, './uploads')
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname )
      }
    }
);

const MAX_SIZE = 2000000;

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
  limits: {
    fileSize: MAX_SIZE
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});



module.exports = router;
