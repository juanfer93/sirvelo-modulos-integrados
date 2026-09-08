import { login } from "./controllers/auth_controller.js";
import * as pedidosController from "./controllers/pedidos_controller.js";
import { autorizarPeticion } from "./middleware/auth_middleware.js";
import { responderJson, configurarCors, leerCuerpo } from "./helpers/http.js";

const METODOS_CON_BODY = ["POST", "PUT", "PATCH"];
const RUTA_LOGIN = { metodo: "POST", ruta: "/api/auth/login" };

export async function manejarSolicitud(req, res) {
    const url = new URL(req.url, "http://localhost");
    const ruta = url.pathname;
    const metodo = req.method;

    configurarCors(res);

    if (metodo === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (
        METODOS_CON_BODY.includes(metodo) &&
        !String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")
    ) {
        return responderJson(res, 415, {
            mensaje: "Formato no soportado: el Content-Type debe ser application/json"
        });
    }

    const cuerpo = await leerCuerpo(req);
    if (cuerpo === null) {
        return responderJson(res, 400, {
            mensaje: "JSON invalido en el cuerpo de la solicitud"
        });
    }

    if (metodo === RUTA_LOGIN.metodo && ruta === RUTA_LOGIN.ruta) {
        return login(req, res, cuerpo);
    }

    const autorizacion = autorizarPeticion(req);
    if (!autorizacion.ok) {
        return responderJson(res, autorizacion.estado, {
            mensaje: autorizacion.mensaje
        });
    }
    req.usuario = autorizacion.usuario;

    if (!ruta.startsWith("/api/pedidos")) {
        return responderJson(res, 404, { mensaje: "Ruta no encontrada" });
    }

    const coincidenciaId = ruta.match(/^\/api\/pedidos\/(\d+)$/);
    if (coincidenciaId) {
        req.params = { id: Number(coincidenciaId[1]) };
        if (metodo === "PUT") {
            return pedidosController.actualizar(req, res, cuerpo);
        }
        if (metodo === "DELETE") {
            return pedidosController.eliminar(req, res);
        }
        return responderJson(res, 405, { mensaje: "Método no permitido para este pedido" });
    }

    if (ruta === "/api/pedidos" || ruta === "/api/pedidos/") {
        if (metodo === "GET") {
            return pedidosController.listar(req, res);
        }
        if (metodo === "POST") {
            return pedidosController.crear(req, res, cuerpo);
        }
        return responderJson(res, 405, { mensaje: "Método no permitido" });
    }

    return responderJson(res, 404, { mensaje: "Ruta no encontrada" });
}