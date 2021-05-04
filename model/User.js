const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema do banco de dados, tabela de usuário
const UserSchema = new Schema({
  nome: {
    type: String,
    required: true
  },
  sobrenome: {
    type: String,
    required: true
  },
  nascimento: {
    type: String,
    required: true
  },
  sexo: {
    type: String,
    required: true
  },
  endereco: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  senha: {
    type: String,
    required: true
  },
  criacao: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.export('users', UserSchema);
