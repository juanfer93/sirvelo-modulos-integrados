import http from "node:http";
import { manejarSolicitud } from "./src/app.js";

const PORT = process.env.PORT || 4000;

const servidor = http.createServer((req, res) => {
    manejarSolicitud(req, res).catch((error) => {
        console.error("Error interno:", error);
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ mensaje: "Error interno del servidor" }));
    });
});

servidor.listen(PORT, () => {
    console.log(`Sírvelo API corriendo en http://localhost:${PORT}`);
});