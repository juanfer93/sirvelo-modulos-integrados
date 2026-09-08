import crypto from "node:crypto";

const SECRETO = process.env.JWT_SECRET || "sirvelo_secreto_desarrollo";
const DURACION_MILIS = 2 * 60 * 60 * 1000;

function base64url(texto) {
    return Buffer.from(texto).toString("base64url");
}

export function crearToken(usuario) {
    const payload = base64url(
        JSON.stringify({
            id: usuario.id,
            email: usuario.email,
            exp: Date.now() + DURACION_MILIS
        })
    );
    const firma = crypto
        .createHmac("sha256", SECRETO)
        .update(payload)
        .digest("base64url");
    return `${payload}.${firma}`;
}

export function verificarToken(token) {
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
        return null;
    }

    const [payload, firma] = token.split(".");

    const esperada = crypto
        .createHmac("sha256", SECRETO)
        .update(payload)
        .digest("base64url");
    if (firma !== esperada) {
        return null;
    }

    try {
        const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (!datos || typeof datos.exp !== "number") {
            return null;
        }
        if (Date.now() > datos.exp) {
            return { expirado: true };
        }
        return { usuario: { id: datos.id, email: datos.email } };
    } catch {
        return null;
    }
}