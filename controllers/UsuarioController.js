const path = require("path");
const bcryptjs = require ("bcryptjs")
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();


class UsuarioController {
    static async cadastrar(req,res) {
       const { nome, email, senha } = req.body;

       const hashSenha = await bcryptjs.hash(senha, 10);

      const usuario = await prisma.usuario.create({
       
        data: {
          nome,
          email,
          senha: hashSenha,
          
      }
      });
       res.json({
         usuarioId: usuario.id,
       });
    }


    static async login (req,res) {
      try {
        const { email, senha } = req.body;

        if ( !email || !senha ) {
          return res.status(400).json({ msg: "Email e senha são obrigatórios!"});
        }
           //verifica se o usuário existe
        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if ( !usuario ){
          return res.json({ msg: "Usuário não existe! "});
        }
        //verifica se a senha esta correta 
        const correto = await bcryptjs.compare(senha, usuario.senha);
        if ( !correto ) {
          return res.json({ msg: "Senha incorreta!"});
        }
        //emite um token
        const token = jwt.sign({ id: usuario.id }, process.env.SENHA_TOKEN, {
          expiresIn: "1h",
        });

        res.json({
          msg: "Autenticado com sucesso!",
          token: token, 
        });
      } catch (error) {
        console.error(error);
        res
        .status(500)
        .json({ msg: "Erro interno no servidor", error: error.message });
      }
    }
//middleware
    static async verificarAutenticacao (req, res, next ) {
      const auth = req.headers ["authorization"];


      if (auth) {
        const token = auth.split(" ")[1];

        jwt.verify(token, process.env.SENHA_TOKEN, (err, payload) => {
          if (err) {
            return res.json({
              msg: "Seu login expirou!",
            });
          }
          req.usuarioId = payload.id;
          next();
        });
      } else {
        res.json({
          msg: "Token não encontrado",
        });
      }
    }

    static async verificaAdmin (req, res, next) {
      if( !req.usuarioId ){
        res.json({
          msg: "Você não está autenticado!",
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: {
          id: req.usuarioId,
        },
      });

      if(!usuario.isAdmin){
        return res.json({
          msg: "Acesso negado! Você não é um administrador."
        });
      }
      next();
    }
}

module.exports = UsuarioController;