import * as menuServices from "../services/menu_services.js";
import { responderJson } from "../helpers/http.js";

function ejecutar(res, callback, estado = 200) {
    try {
        return responderJson(res, estado, callback());
    } catch (error) {
        const mensaje = error.message.includes("UNIQUE")
            ? "Ya existe una categoría con ese nombre"
            : error.message;
        return responderJson(res, 400, { mensaje });
    }
}

export const listar = (req, res) => ejecutar(res, () => menuServices.listar(new URL(req.url, "http://localhost").searchParams.get("incluirOcultos") === "true"));

export const crearCategoria = (req, res, cuerpo) => {
    if (!cuerpo?.nombre?.trim()) return responderJson(res, 400, { mensaje: "El nombre de la categoría es obligatorio" });
    return ejecutar(res, () => menuServices.crearCategoria(cuerpo), 201);
};

export const actualizarCategoria = (req, res, cuerpo) => {
    if (!cuerpo?.nombre?.trim()) return responderJson(res, 400, { mensaje: "El nombre de la categoría es obligatorio" });
    const categoria = menuServices.actualizarCategoria(req.params.id, cuerpo);
    return categoria ? responderJson(res, 200, categoria) : responderJson(res, 404, { mensaje: "Categoría no encontrada" });
};

export const ocultarCategoria = (req, res) => menuServices.ocultarCategoria(req.params.id)
    ? responderJson(res, 200, { mensaje: "Categoría ocultada" })
    : responderJson(res, 404, { mensaje: "Categoría no encontrada" });

function validarProducto(cuerpo) {
    return cuerpo?.categoria_id && cuerpo?.nombre?.trim() && Number.isFinite(Number(cuerpo.precio)) && Number(cuerpo.precio) >= 0;
}

export const crearProducto = (req, res, cuerpo) => {
    if (!validarProducto(cuerpo)) return responderJson(res, 400, { mensaje: "Categoría, nombre y precio válido son obligatorios" });
    return ejecutar(res, () => menuServices.crearProducto(cuerpo), 201);
};

export const actualizarProducto = (req, res, cuerpo) => {
    if (!validarProducto(cuerpo)) return responderJson(res, 400, { mensaje: "Categoría, nombre y precio válido son obligatorios" });
    const producto = menuServices.actualizarProducto(req.params.id, cuerpo);
    return producto ? responderJson(res, 200, producto) : responderJson(res, 404, { mensaje: "Producto no encontrado" });
};

export const ocultarProducto = (req, res) => menuServices.ocultarProducto(req.params.id)
    ? responderJson(res, 200, { mensaje: "Producto ocultado" })
    : responderJson(res, 404, { mensaje: "Producto no encontrado" });
