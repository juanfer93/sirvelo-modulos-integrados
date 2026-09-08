export function crearPedidoCard({ pedido, onEditar, onEliminar }) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "pedido-card";

    const cabecera = document.createElement("div");
    cabecera.className = "pedido-card__cabecera";

    const badge = document.createElement("span");
    badge.className = "pedido-card__badge";
    badge.textContent = `Mesa ${String(pedido.mesa).padStart(2, "0")}`;

    const mesero = document.createElement("h3");
    mesero.className = "pedido-card__mesero";
    mesero.textContent = pedido.mesero;

    const detalle = document.createElement("p");
    detalle.className = "pedido-card__detalle";
    detalle.textContent = pedido.detalle || "Sin detalle";

    const acciones = document.createElement("div");
    acciones.className = "pedido-card__acciones";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "boton boton--secundario boton--pequeno";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => onEditar(pedido));

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton boton--peligro boton--pequeno";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => onEliminar(pedido));

    acciones.append(botonEditar, botonEliminar);
    cabecera.append(badge, mesero);
    tarjeta.append(cabecera, detalle, acciones);
    return tarjeta;
}