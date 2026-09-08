import { verificarToken } from "../helpers/token.js";

export function autorizarPeticion(req) {
    const headerAuth = req.headers["authorization"];

    if (!headerAuth) {
        return {
            ok: false,
            estado: 401,
            mensaje: "Acceso denegado: falta el header 'Authorization' con esquema Bearer"
        };
    }

    if (!/^Bearer\s+\S+$/.test(headerAuth)) {
        return {
            ok: false,
            estado: 400,
            mensaje: "Formato invalido: se espera el esquema 'Bearer <token>'"
        };
    }

    const partes = headerAuth.split(" ");
    const esquema = partes[0];
    const token = partes[1];

    if (esquema !== "Bearer" || !token) {
        return {
            ok: false,
            estado: 400,
            mensaje: "No fue posible extraer el token del header 'Authorization'"
        };
    }

    const resultado = verificarToken(token);

    if (!resultado) {
        return {
            ok: false,
            estado: 401,
            mensaje: "Token invalido: fallo la verificacion criptografica"
        };
    }

    if (resultado.expirado) {
        return {
            ok: false,
            estado: 401,
            mensaje: "El token ha expirado, inicie sesion nuevamente"
        };
    }

    return {
        ok: true,
        usuario: resultado.usuario
    };
}