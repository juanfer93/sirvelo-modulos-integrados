import {
    listarMenu,
    crearCategoria,
    actualizarCategoria,
    ocultarCategoria,
    crearProducto,
    actualizarProducto,
    ocultarProducto
} from "../app.js";
import { crearNavbar } from "../components/Navbar.js";
import { mostrarToast } from "../components/Toast.js";

const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export async function renderMenu(contenedor) {
    const sesion = JSON.parse(localStorage.getItem("sirvelo_sesion") || "null");
    contenedor.append(crearNavbar({ usuario: sesion?.usuario }));

    const principal = document.createElement("main");
    principal.className = "dashboard menu-page";
    principal.setAttribute("aria-labelledby", "titulo-menu");

    const cabecera = document.createElement("div");
    cabecera.className = "dashboard__cabecera";
    const titulo = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.id = "titulo-menu";
    h1.className = "dashboard__titulo";
    h1.textContent = "Menú digital";
    const descripcion = document.createElement("p");
    descripcion.className = "menu-page__descripcion";
    descripcion.textContent = "Administra categorías, platos, precios e imágenes desde un solo lugar.";
    titulo.append(h1, descripcion);

    const controles = document.createElement("div");
    controles.className = "menu-page__controles";
    const volver = document.createElement("a");
    volver.className = "boton boton--claro";
    volver.href = "#/pedidos";
    volver.textContent = "Ver pedidos";
    const ocultos = document.createElement("label");
    ocultos.className = "menu-page__toggle";
    const ocultosInput = document.createElement("input");
    ocultosInput.type = "checkbox";
    ocultosInput.checked = false;
    ocultosInput.setAttribute("aria-label", "Mostrar categorías y platos ocultos");
    ocultos.append(ocultosInput, document.createTextNode("Mostrar ocultos"));
    controles.append(volver, ocultos);
    cabecera.append(titulo, controles);
    principal.append(cabecera);

    const estado = document.createElement("p");
    estado.className = "estado";
    estado.setAttribute("role", "status");
    principal.append(estado);

    const contenido = document.createElement("div");
    contenido.className = "menu-page__grid";
    principal.append(contenido);
    contenedor.append(principal);

    let datosMenu = { categorias: [], productos: [] };
    let categoriaEditando = null;
    let productoEditando = null;

    const cargar = async () => {
        estado.textContent = "Cargando menú…";
        contenido.innerHTML = "";
        try {
            datosMenu = await listarMenu(ocultosInput.checked);
            estado.textContent = "";
            renderizarContenido();
        } catch (error) {
            estado.textContent = error.message || "No fue posible cargar el menú.";
        }
    };

    const campo = (etiqueta, nombre, tipo = "text", opciones = {}) => {
        const grupo = document.createElement("div");
        grupo.className = "formulario__grupo";
        const label = document.createElement("label");
        label.className = "formulario__etiqueta";
        label.textContent = etiqueta;
        label.setAttribute("for", `menu-${nombre}`);
        const input = document.createElement(opciones.multiline ? "textarea" : opciones.select ? "select" : "input");
        input.className = "formulario__entrada";
        input.id = `menu-${nombre}`;
        input.name = nombre;
        if (!opciones.multiline && !opciones.select) input.type = tipo;
        input.placeholder = opciones.placeholder || "";
        if (opciones.required) input.required = true;
        if (opciones.min !== undefined) input.min = String(opciones.min);
        if (opciones.step !== undefined) input.step = String(opciones.step);
        grupo.append(label, input);
        return { grupo, input };
    };

    function botonAccion(texto, clase = "boton boton--claro") {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = clase;
        boton.textContent = texto;
        return boton;
    }

    function renderizarContenido() {
        contenido.innerHTML = "";
        const panelCategorias = document.createElement("section");
        panelCategorias.className = "menu-panel";
        panelCategorias.setAttribute("aria-labelledby", "titulo-categorias");
        const tituloCategorias = document.createElement("h2");
        tituloCategorias.id = "titulo-categorias";
        tituloCategorias.textContent = "Categorías";
        panelCategorias.append(tituloCategorias);

        const formularioCategoria = document.createElement("form");
        formularioCategoria.className = "menu-formulario";
        const nombreCategoria = campo("Nombre", "categoria-nombre", "text", { required: true, placeholder: "Ej: Entradas" });
        const descripcionCategoria = campo("Descripción", "categoria-descripcion", "text", { multiline: true, placeholder: "Qué incluye esta categoría" });
        const accionesCategoria = document.createElement("div");
        accionesCategoria.className = "menu-formulario__acciones";
        const guardarCategoria = botonAccion(categoriaEditando ? "Guardar cambios" : "Crear categoría", "boton boton--primario");
        guardarCategoria.type = "submit";
        const cancelarCategoria = botonAccion("Cancelar");
        cancelarCategoria.hidden = !categoriaEditando;
        accionesCategoria.append(cancelarCategoria, guardarCategoria);
        formularioCategoria.append(nombreCategoria.grupo, descripcionCategoria.grupo, accionesCategoria);
        panelCategorias.append(formularioCategoria);

        const listaCategorias = document.createElement("div");
        listaCategorias.className = "menu-lista";
        for (const categoria of datosMenu.categorias) {
            const fila = document.createElement("div");
            fila.className = `menu-fila${categoria.activa ? "" : " menu-fila--oculta"}`;
            const texto = document.createElement("div");
            const nombre = document.createElement("strong");
            nombre.textContent = categoria.nombre;
            const detalle = document.createElement("span");
            detalle.textContent = categoria.descripcion || "Sin descripción";
            texto.append(nombre, detalle);
            const acciones = document.createElement("div");
            acciones.className = "menu-fila__acciones";
            const editar = botonAccion("Editar");
            editar.addEventListener("click", () => {
                categoriaEditando = categoria;
                renderizarContenido();
                document.getElementById("menu-categoria-nombre").focus();
            });
            const alternar = botonAccion(categoria.activa ? "Ocultar" : "Mostrar", categoria.activa ? "boton boton--claro" : "boton boton--secundario");
            alternar.addEventListener("click", async () => {
                try {
                    if (categoria.activa) await ocultarCategoria(categoria.id);
                    else await actualizarCategoria(categoria.id, { nombre: categoria.nombre, descripcion: categoria.descripcion, activa: true });
                    mostrarToast(categoria.activa ? "Categoría ocultada" : "Categoría visible", "exito");
                    await cargar();
                } catch (error) { mostrarToast(error.message, "error"); }
            });
            acciones.append(editar, alternar);
            fila.append(texto, acciones);
            listaCategorias.append(fila);
        }
        panelCategorias.append(listaCategorias);

        formularioCategoria.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const cuerpo = { nombre: nombreCategoria.input.value.trim(), descripcion: descripcionCategoria.input.value.trim() };
            if (!cuerpo.nombre) return;
            try {
                if (categoriaEditando) await actualizarCategoria(categoriaEditando.id, { ...cuerpo, activa: categoriaEditando.activa });
                else await crearCategoria(cuerpo);
                categoriaEditando = null;
                mostrarToast("Categoría guardada", "exito");
                await cargar();
            } catch (error) { mostrarToast(error.message, "error"); }
        });
        cancelarCategoria.addEventListener("click", () => { categoriaEditando = null; renderizarContenido(); });
        if (categoriaEditando) {
            nombreCategoria.input.value = categoriaEditando.nombre;
            descripcionCategoria.input.value = categoriaEditando.descripcion || "";
        }

        const panelProductos = document.createElement("section");
        panelProductos.className = "menu-panel";
        panelProductos.setAttribute("aria-labelledby", "titulo-productos");
        const tituloProductos = document.createElement("h2");
        tituloProductos.id = "titulo-productos";
        tituloProductos.textContent = "Platos";
        panelProductos.append(tituloProductos);

        const formularioProducto = document.createElement("form");
        formularioProducto.className = "menu-formulario";
        const categoriaProducto = campo("Categoría", "producto-categoria", "select", { required: true, select: true });
        const selectCategoria = categoriaProducto.input;
        selectCategoria.innerHTML = "";
        for (const categoria of datosMenu.categorias.filter((item) => item.activa)) {
            const option = document.createElement("option");
            option.value = String(categoria.id);
            option.textContent = categoria.nombre;
            selectCategoria.append(option);
        }
        const nombreProducto = campo("Nombre", "producto-nombre", "text", { required: true, placeholder: "Ej: Limonada natural" });
        const precioProducto = campo("Precio", "producto-precio", "number", { required: true, min: 0, step: 100 });
        const descripcionProducto = campo("Descripción", "producto-descripcion", "text", { multiline: true, placeholder: "Ingredientes o presentación" });
        const imagenProducto = campo("Imagen (URL)", "producto-imagen", "url", { placeholder: "https://..." });
        const accionesProducto = document.createElement("div");
        accionesProducto.className = "menu-formulario__acciones";
        const guardarProducto = botonAccion(productoEditando ? "Guardar cambios" : "Crear plato", "boton boton--primario");
        guardarProducto.type = "submit";
        const cancelarProducto = botonAccion("Cancelar");
        cancelarProducto.hidden = !productoEditando;
        accionesProducto.append(cancelarProducto, guardarProducto);
        formularioProducto.append(categoriaProducto.grupo, nombreProducto.grupo, precioProducto.grupo, descripcionProducto.grupo, imagenProducto.grupo, accionesProducto);
        panelProductos.append(formularioProducto);

        const listaProductos = document.createElement("div");
        listaProductos.className = "menu-lista menu-lista--productos";
        for (const producto of datosMenu.productos) {
            const fila = document.createElement("article");
            fila.className = `menu-fila menu-producto${producto.disponible ? "" : " menu-fila--oculta"}`;
            if (producto.imagen_url) {
                const imagen = document.createElement("img");
                imagen.src = producto.imagen_url;
                imagen.alt = `Imagen de ${producto.nombre}`;
                imagen.className = "menu-producto__imagen";
                fila.append(imagen);
            }
            const texto = document.createElement("div");
            texto.className = "menu-producto__texto";
            const nombre = document.createElement("strong");
            nombre.textContent = producto.nombre;
            const descripcion = document.createElement("span");
            descripcion.textContent = `${producto.categoria_nombre} · ${producto.descripcion || "Sin descripción"}`;
            const precio = document.createElement("b");
            precio.className = "menu-producto__precio";
            precio.textContent = moneda.format(producto.precio);
            texto.append(nombre, descripcion, precio);
            const acciones = document.createElement("div");
            acciones.className = "menu-fila__acciones";
            const editar = botonAccion("Editar");
            editar.addEventListener("click", () => { productoEditando = producto; renderizarContenido(); document.getElementById("menu-producto-nombre").focus(); });
            const alternar = botonAccion(producto.disponible ? "Ocultar" : "Mostrar", producto.disponible ? "boton boton--claro" : "boton boton--secundario");
            alternar.addEventListener("click", async () => {
                try {
                    if (producto.disponible) await ocultarProducto(producto.id);
                    else await actualizarProducto(producto.id, { ...producto, disponible: true });
                    mostrarToast(producto.disponible ? "Plato ocultado" : "Plato visible", "exito");
                    await cargar();
                } catch (error) { mostrarToast(error.message, "error"); }
            });
            acciones.append(editar, alternar);
            fila.append(texto, acciones);
            listaProductos.append(fila);
        }
        panelProductos.append(listaProductos);

        formularioProducto.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const cuerpo = {
                categoria_id: Number(selectCategoria.value),
                nombre: nombreProducto.input.value.trim(),
                precio: Number(precioProducto.input.value),
                descripcion: descripcionProducto.input.value.trim(),
                imagen_url: imagenProducto.input.value.trim()
            };
            if (!cuerpo.categoria_id || !cuerpo.nombre || !Number.isFinite(cuerpo.precio)) return;
            try {
                if (productoEditando) await actualizarProducto(productoEditando.id, { ...cuerpo, disponible: productoEditando.disponible });
                else await crearProducto(cuerpo);
                productoEditando = null;
                mostrarToast("Plato guardado", "exito");
                await cargar();
            } catch (error) { mostrarToast(error.message, "error"); }
        });
        cancelarProducto.addEventListener("click", () => { productoEditando = null; renderizarContenido(); });
        if (productoEditando) {
            selectCategoria.value = String(productoEditando.categoria_id);
            nombreProducto.input.value = productoEditando.nombre;
            precioProducto.input.value = productoEditando.precio;
            descripcionProducto.input.value = productoEditando.descripcion || "";
            imagenProducto.input.value = productoEditando.imagen_url || "";
        }

        contenido.append(panelCategorias, panelProductos);
    }

    ocultosInput.addEventListener("change", cargar);
    await cargar();
}
