import db from "../config/db.js";

export const Validacion = async (email, password) => {
    try {
        const usuario = db
            .prepare("SELECT id, email, nombre, password FROM usuarios_api WHERE email = ?")
            .get(email);

        if (!usuario) {
            return {
                exito: false,
                mensaje: "Usuario no encontrado"
            };
        }

        if (password !== usuario.password) {
            return {
                exito: false,
                mensaje: "Contraseña incorrecta"
            };
        }

        return {
            exito: true,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre
            }
        };
    } catch (error) {
        throw new Error(
            "Error en la base de datos durante la autenticacion: " + error.message
        );
    }
};