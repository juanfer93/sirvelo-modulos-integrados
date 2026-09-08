import { Validacion } from "../services/auth_services.js";
import { crearToken } from "../helpers/token.js";
import { responderJson } from "../helpers/http.js";

export const login = async (req, res, cuerpo) => {
    try {
        const { email, password } = cuerpo || {};

        if (!email || !password) {
            return responderJson(res, 400, {
                mensaje: "Email y contraseña son obligatorios"
            });
        }

        const resultado = await Validacion(email, password);

        if (!resultado.exito) {
            return responderJson(res, 401, {
                mensaje: resultado.mensaje
            });
        }

        const token = crearToken(resultado.usuario);

        return responderJson(res, 200, {
            mensaje: "Autenticación exitosa",
            token: token,
            usuario: resultado.usuario
        });
    } catch (error) {
        console.error("Error en login:", error);
        return responderJson(res, 500, {
            mensaje: "Error interno del servidor"
        });
    }
};