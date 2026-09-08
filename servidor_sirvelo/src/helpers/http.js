export function responderJson(res, estado, datos) {
    const texto = JSON.stringify(datos);
    res.writeHead(estado, { "Content-Type": "application/json; charset=utf-8" });
    res.end(texto);
}

export function configurarCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function leerCuerpo(req) {
    return new Promise((resolve) => {
        const trozos = [];
        req.on("data", (trozo) => trozos.push(trozo));
        req.on("end", () => {
            const texto = Buffer.concat(trozos).toString("utf8").trim();
            if (!texto) return resolve({});
            try {
                resolve(JSON.parse(texto));
            } catch {
                resolve(null);
            }
        });
        req.on("error", () => resolve({}));
    });
}