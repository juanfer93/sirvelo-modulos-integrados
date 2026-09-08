import { mostrarToast } from "./Toast.js";

export function confirmarEliminacion({ mensaje = "¿Confirmas esta acción?", onConfirmar } = {}) {
    if (typeof onConfirmar !== "function") return;

    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "alertdialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "titulo-confirmacion");

    const cabecera = document.createElement("div");
    cabecera.className = "modal__cabecera";

    const titulo = document.createElement("h2");
    titulo.id = "titulo-confirmacion";
    titulo.className = "modal__titulo";
    titulo.textContent = "Confirmar eliminación";

    const botonCerrar = document.createElement("button");
    botonCerrar.type = "button";
    botonCerrar.className = "modal__cerrar";
    botonCerrar.textContent = "×";
    botonCerrar.setAttribute("aria-label", "Cerrar");

    const cuerpo = document.createElement("div");
    cuerpo.className = "modal__cuerpo";

    const texto = document.createElement("p");
    texto.className = "modal__mensaje";
    texto.textContent = mensaje;

    const pie = document.createElement("div");
    pie.className = "modal__pie";

    const botonCancelar = document.createElement("button");
    botonCancelar.type = "button";
    botonCancelar.className = "boton boton--claro";
    botonCancelar.textContent = "Cancelar";

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton boton--peligro";
    botonEliminar.textContent = "Sí, eliminar";

    const cerrar = () => fondo.remove();

    const finalizarEliminacion = async () => {
        botonEliminar.disabled = true;
        botonEliminar.textContent = "Eliminando…";
        try {
            await onConfirmar();
            cerrar();
        } catch (error) {
            mostrarToast(error.message || "Error al eliminar el pedido", "error");
            botonEliminar.disabled = false;
            botonEliminar.textContent = "Sí, eliminar";
        }
    };

    botonCerrar.addEventListener("click", cerrar);
    botonCancelar.addEventListener("click", cerrar);
    botonEliminar.addEventListener("click", finalizarEliminacion);
    fondo.addEventListener("click", (evento) => {
        if (evento.target === fondo) cerrar();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && document.body.contains(fondo)) cerrar();
    });

    cabecera.append(titulo, botonCerrar);
    pie.append(botonCancelar, botonEliminar);
    cuerpo.append(texto, pie);
    modal.append(cabecera, cuerpo);
    fondo.append(modal);
    document.body.appendChild(fondo);
    botonCancelar.focus();
}