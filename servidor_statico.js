import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const RAIZ = join(import.meta.dirname, "frontend-sirvelo");
const PUERTO = process.env.FRONT_PORT || 5500;

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8"
};

const servidor = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, "http://localhost");
        let ruta = decodeURIComponent(url.pathname);

        if (ruta === "/" || ruta === "") {
            ruta = "/index.html";
        }

        const rutaNormalizada = normalize(ruta).replace(/^(\.\.[\\/])+/, "");
        const archivo = join(RAIZ, rutaNormalizada);

        const info = await stat(archivo);
        if (info.isDirectory()) {
            return enviar(join(archivo, "index.html"));
        }
        return enviar(archivo);

        async function enviar(rutaReal) {
            const contenido = await readFile(rutaReal);
            const tipo = TIPOS[extname(rutaReal).toLowerCase()] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": tipo });
            res.end(contenido);
        }
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 - No encontrado");
    }
});

servidor.listen(PUERTO, () => {
    console.log(`Sírvelo frontend en http://localhost:${PUERTO}`);
});