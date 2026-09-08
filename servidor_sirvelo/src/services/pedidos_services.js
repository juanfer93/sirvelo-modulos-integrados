import db from "../config/db.js";

export const listar = async () => {
    try {
        return db.prepare("SELECT * FROM pedidos ORDER BY id").all();
    } catch (error) {
        throw new Error("Error al obtener los pedidos: " + error.message);
    }
};

export const crear = async (datos) => {
    const { mesa, mesero, detalle } = datos;
    try {
        const resultado = db
            .prepare("INSERT INTO pedidos (mesa, mesero, detalle) VALUES (?, ?, ?)")
            .run(mesa, mesero, detalle ?? null);
        return db
            .prepare("SELECT * FROM pedidos WHERE id = ?")
            .get(resultado.lastInsertRowid);
    } catch (error) {
        throw new Error("Error al crear el pedido: " + error.message);
    }
};

export const actualizar = async (id, datos) => {
    const { mesa, mesero, detalle } = datos;
    try {
        const resultado = db
            .prepare("UPDATE pedidos SET mesa = ?, mesero = ?, detalle = ? WHERE id = ?")
            .run(mesa, mesero, detalle ?? null, id);
        if (resultado.changes === 0) {
            return null;
        }
        return db.prepare("SELECT * FROM pedidos WHERE id = ?").get(id);
    } catch (error) {
        throw new Error("Error al actualizar el pedido: " + error.message);
    }
};

export const eliminar = async (id) => {
    try {
        const pedido = db.prepare("SELECT * FROM pedidos WHERE id = ?").get(id);
        if (!pedido) {
            return null;
        }
        db.prepare("DELETE FROM pedidos WHERE id = ?").run(id);
        return pedido;
    } catch (error) {
        throw new Error("Error al eliminar el pedido: " + error.message);
    }
};