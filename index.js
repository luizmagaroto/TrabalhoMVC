const express = require("express");
const path = require("path");
const app = express();

// rotas da API
const usuarioRoutes = require("./routes/usuarioRoutes");
app.use(express.json());
app.use("/", usuarioRoutes);

// servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "frontend")));

// rota principal para abrir o index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = 8000; 
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
