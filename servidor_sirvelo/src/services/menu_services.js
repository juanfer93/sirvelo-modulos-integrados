import db from "../config/db.js";

function normalizarCategoria(categoria) {
    return { ...categoria, activa: Boolean(categoria.activa) };
}

function normalizarProducto(producto) {
    return { ...producto, disponible: Boolean(producto.disponible), precio: Number(producto.precio) };
}

export function listar(incluirOcultos = false) {
    const filtroCategoria = incluirOcultos ? "" : "WHERE c.activa = 1";
    const filtroProducto = incluirOcultos ? "" : "AND p.disponible = 1";
    const categorias = db.prepare(`SELECT c.id, c.nombre, c.descripcion, c.activa FROM categorias_menu c ${filtroCategoria} ORDER BY c.nombre`).all();
    const productos = db.prepare(`
        SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url, p.disponible,
               c.nombre AS categoria_nombre
        FROM productos_menu p
        JOIN categorias_menu c ON c.id = p.categoria_id
        ${incluirOcultos ? "WHERE 1 = 1" : "WHERE c.activa = 1"} ${filtroProducto}
        ORDER BY c.nombre, p.nombre
    `).all();
    return {
        categorias: categorias.map(normalizarCategoria),
        productos: productos.map(normalizarProducto)
    };
}

export function crearCategoria({ nombre, descripcion = "" }) {
    const resultado = db.prepare(
        "INSERT INTO categorias_menu (nombre, descripcion) VALUES (?, ?)"
    ).run(nombre.trim(), String(descripcion).trim());
    return db.prepare("SELECT id, nombre, descripcion, activa FROM categorias_menu WHERE id = ?").get(resultado.lastInsertRowid);
}

export function actualizarCategoria(id, { nombre, descripcion = "", activa = true }) {
    const resultado = db.prepare(
        "UPDATE categorias_menu SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?"
    ).run(nombre.trim(), String(descripcion).trim(), activa ? 1 : 0, id);
    if (resultado.changes === 0) return null;
    return db.prepare("SELECT id, nombre, descripcion, activa FROM categorias_menu WHERE id = ?").get(id);
}

export function ocultarCategoria(id) {
    const resultado = db.prepare("UPDATE categorias_menu SET activa = 0 WHERE id = ?").run(id);
    return resultado.changes > 0;
}

function validarCategoria(id) {
    const categoria = db.prepare("SELECT id FROM categorias_menu WHERE id = ?").get(id);
    if (!categoria) throw new Error("La categoría no existe");
}

export function crearProducto({ categoria_id, nombre, descripcion = "", precio, imagen_url = "" }) {
    validarCategoria(categoria_id);
    const resultado = db.prepare(
        "INSERT INTO productos_menu (categoria_id, nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?, ?)"
    ).run(categoria_id, nombre.trim(), String(descripcion).trim(), Number(precio), String(imagen_url).trim());
    return db.prepare("SELECT * FROM productos_menu WHERE id = ?").get(resultado.lastInsertRowid);
}

export function actualizarProducto(id, { categoria_id, nombre, descripcion = "", precio, imagen_url = "", disponible = true }) {
    validarCategoria(categoria_id);
    const resultado = db.prepare(`
        UPDATE productos_menu
        SET categoria_id = ?, nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, disponible = ?
        WHERE id = ?
    `).run(categoria_id, nombre.trim(), String(descripcion).trim(), Number(precio), String(imagen_url).trim(), disponible ? 1 : 0, id);
    if (resultado.changes === 0) return null;
    return db.prepare("SELECT * FROM productos_menu WHERE id = ?").get(id);
}

export function ocultarProducto(id) {
    const resultado = db.prepare("UPDATE productos_menu SET disponible = 0 WHERE id = ?").run(id);
    return resultado.changes > 0;
}
