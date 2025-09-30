const bcryptjs = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");



const prisma = new PrismaClient();

class UsuarioController {
  // Cadastro de usuário
  static async cadastrar(req, res) {
    try {
      console.log("req.body:", req.body);
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          mensagem: "Nome, email e senha são obrigatórios!",
          erro: true,
        });
      }

      // Verifica se já existe um usuário com este email
      const existe = await prisma.usuario.findUnique({ where: { email } });
      if (existe) {
        return res.json({
          mensagem: "Já existe um usuário com este email!",
          erro: true,
        });
      }

      const hashSenha = await bcryptjs.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashSenha
        },
      });

      // Opcional: já gerar token no cadastro
      const token = jwt.sign({ id: usuario.id }, process.env.SENHA_TOKEN, {
        expiresIn: "1h",
      });

      res.json({
        mensagem: "Usuário cadastrado com sucesso!",
        erro: false,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        mensagem: "Erro interno no servidor",
        erro: true,
      });
    }
  }

  // Login de usuário
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          mensagem: "Email e senha são obrigatórios!",
          erro: true,
        });
      }

      const usuario = await prisma.usuario.findUnique({ where: { email } });

      if (!usuario) {
        return res.json({
          mensagem: "Usuário não existe!",
          erro: true,
        });
      }

      const correto = await bcryptjs.compare(senha, usuario.senha);

      if (!correto) {
        return res.json({
          mensagem: "Senha incorreta!",
          erro: true,
        });
      }

      const token = jwt.sign({ id: usuario.id }, process.env.SENHA_TOKEN, {
        expiresIn: "1h",
      });

      res.json({
        mensagem: "Autenticado com sucesso!",
        erro: false,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        mensagem: "Erro interno no servidor",
        erro: true,
      });
    }
  }

  // Middleware para verificar token
  static async verificarAutenticacao(req, res, next) {
    const auth = req.headers["authorization"];

    if (auth) {
      const token = auth.split(" ")[1];

      jwt.verify(token, process.env.SENHA_TOKEN, (err, payload) => {
        if (err) {
          return res.json({
            mensagem: "Seu login expirou!",
            erro: true,
          });
        }
        req.usuarioId = payload.id;
        next();
      });
    } else {
      res.json({
        mensagem: "Token não encontrado",
        erro: true,
      });
    }
  }

  // Middleware para verificar se é admin
  static async verificaAdmin(req, res, next) {
    if (!req.usuarioId) {
      return res.json({
        mensagem: "Você não está autenticado!",
        erro: true,
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    if (!usuario.isAdmin) {
      return res.json({
        mensagem: "Acesso negado! Você não é um administrador.",
        erro: true,
      });
    }

    next();
  }
}

module.exports = UsuarioController;
