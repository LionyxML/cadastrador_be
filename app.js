const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');


// Inicialização do app
const app = express();


// Configurações dos middlewares
app.use(bodyParser.urlencoded({
  extended : false
}));

app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));


// Configuração da conexão ao bando de dados
const db = require('./config/keys').mongoURI;
mongoose.connect(db, { useNewUrlParser: true }).then( () => {
  console.log(`Banco de dados conectado com sucesso: ${db}`)
}).catch( err => {
  console.log(`Não foi possível conectar ao banco: ${err}`)
});


// Rota de teste para debug inicial
app.get('/', (req, res) => {
  return res.send("<h1>Servidor inicializado com sucesso! </h1>");
})

// Configuração da porta de serviço da aplicação e start
const PORT = process.env.PORT || 5000;

app.listen (PORT, () => {
  console.log(`Servidor inicializado na porta ${PORT}`);
})
