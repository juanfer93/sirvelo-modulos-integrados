import * as pedidos_services from "../services/pedidos_services.js";
import { responderJson } from "../helpers/http.js";

export const listar = async (req, res) => {
    try {
        const pedido = await pedidos_services.listar();
        responderJson(res, 200, pedido);
    } catch (error) {
        console.error(error);
        responderJson(res, 500, { mensaje: error.message });
    }
};

export const crear = async (req, res, cuerpo) => {
    try {
        if (!cuerpo.mesa || !cuerpo.mesero) {
            return responderJson(res, 400, {
                mensaje: "Error de validación: 'mesa' y 'mesero' son requeridos."
            });
        }
        const pedido = await pedidos_services.crear(cuerpo);
        responderJson(res, 201, { mensaje: "Pedido creado", pedido });
    } catch (error) {
        console.error(error);
        responderJson(res, 500, { mensaje: error.message });
    }
};

export const actualizar = async (req, res, cuerpo) => {
    try {
        const pedido = await pedidos_services.actualizar(req.params.id, cuerpo);
        if (!pedido) {
            return responderJson(res, 404, { mensaje: "Pedido no encontrado" });
        }
        responderJson(res, 200, { mensaje: "Pedido actualizado exitosamente", pedido });
    } catch (error) {
        console.error(error);
        responderJson(res, 500, { mensaje: error.message });
    }
};

export const eliminar = async (req, res) => {
    try {
        const pedido = await pedidos_services.eliminar(req.params.id);
        if (!pedido) {
            return responderJson(res, 404, { mensaje: "Pedido no encontrado" });
        }
        responderJson(res, 200, { mensaje: "Pedido eliminado de Sirvelo", pedido });
    } catch (error) {
        console.error(error);
        responderJson(res, 500, { mensaje: error.message });
    }
};