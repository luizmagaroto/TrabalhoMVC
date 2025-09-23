const express = require("express");
const app = express();

const usuarioRoutes = require("./routes/usuarioRoutes.js");
app.use("/usuarios", usuarioRoutes);

app.listen(8000, (err) => {
    console.log("Aplicação rodando em localhost:8000");
});