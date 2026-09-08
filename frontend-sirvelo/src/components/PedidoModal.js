import { mostrarToast } from "./Toast.js";

export function abrirPedidoModal({ titulo = "Nuevo pedido", pedido = null, alEnviar } = {}) {
    if (typeof alEnviar !== "function") return;

    const esEdicion = pedido !== null;

    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "titulo-modal");

    const cabecera = document.createElement("div");
    cabecera.className = "modal__cabecera";

    const tituloEl = document.createElement("h2");
    tituloEl.id = "titulo-modal";
    tituloEl.className = "modal__titulo";
    tituloEl.textContent = titulo;

    const botonCerrar = document.createElement("button");
    botonCerrar.type = "button";
    botonCerrar.className = "modal__cerrar";
    botonCerrar.textContent = "×";
    botonCerrar.setAttribute("aria-label", "Cerrar");

    const cuerpo = document.createElement("div");
    cuerpo.className = "modal__cuerpo";

    const formulario = document.createElement("form");
    formulario.className = "formulario";
    formulario.noValidate = true;

    const grupoMesa = crearGrupo("Mesa", "mesa", "Ej: 1", pedido?.mesa ?? "");
    const grupoMesero = crearGrupo("Mesero", "mesero", "Nombre del mesero", pedido?.mesero ?? "");
    const grupoDetalle = crearGrupo("Detalle", "detalle", "Ej: 2 hamburguesas, papas y gaseosa", pedido?.detalle ?? "", true);

    const campoMesa = grupoMesa.entrada;
    const campoMesero = grupoMesero.entrada;
    const campoDetalle = grupoDetalle.entrada;
    campoMesa.required = true;
    campoMesero.required = true;

    const pie = document.createElement("div");
    pie.className = "modal__pie";

    const botonCancelar = document.createElement("button");
    botonCancelar.type = "button";
    botonCancelar.className = "boton boton--claro";
    botonCancelar.textContent = "Cancelar";

    const botonGuardar = document.createElement("button");
    botonGuardar.type = "submit";
    botonGuardar.className = "boton boton--primario";
    botonGuardar.textContent = esEdicion ? "Guardar cambios" : "Crear pedido";

    const cerrar = () => fondo.remove();

    botonCerrar.addEventListener("click", cerrar);
    botonCancelar.addEventListener("click", cerrar);
    fondo.addEventListener("click", (evento) => {
        if (evento.target === fondo) cerrar();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && document.body.contains(fondo)) cerrar();
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const mesa = campoMesa.value.trim();
        const mesero = campoMesero.value.trim();
        const detalle = campoDetalle.value.trim();

        if (!mesa || !mesero) {
            mostrarToast("Completa los campos obligatorios", "error");
            return;
        }

        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando…";

        try {
            await alEnviar({ mesa, mesero, detalle });
            cerrar();
        } catch (error) {
            mostrarToast(error.message || "Error al guardar el pedido", "error");
            botonGuardar.disabled = false;
            botonGuardar.textContent = esEdicion ? "Guardar cambios" : "Crear pedido";
        }
    });

    cabecera.append(tituloEl, botonCerrar);
    formulario.append(grupoMesa.elemento, grupoMesero.elemento, grupoDetalle.elemento, pie);
    pie.append(botonCancelar, botonGuardar);
    cuerpo.append(formulario);
    modal.append(cabecera, cuerpo);
    fondo.append(modal);
    document.body.appendChild(fondo);
    campoMesa.focus();
}

function crearGrupo(etiqueta, nombre, placeholder, valor = "", esTextarea = false) {
    const elemento = document.createElement("div");
    elemento.className = "formulario__grupo";

    const label = document.createElement("label");
    label.className = "formulario__etiqueta";
    label.textContent = etiqueta;
    label.setAttribute("for", `campo-${nombre}`);

    const entrada = document.createElement(esTextarea ? "textarea" : "input");
    entrada.className = "formulario__entrada";
    entrada.name = nombre;
    entrada.id = `campo-${nombre}`;
    entrada.placeholder = placeholder;
    entrada.value = valor;
    if (!esTextarea) entrada.type = "text";

    elemento.append(label, entrada);
    return { elemento, entrada };
}