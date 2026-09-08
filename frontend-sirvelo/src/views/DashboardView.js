import {
    listarPedidos,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    obtenerSesion
} from "../app.js";
import { crearNavbar } from "../components/Navbar.js";
import { crearPedidoCard } from "../components/PedidoCard.js";
import { abrirPedidoModal } from "../components/PedidoModal.js";
import { confirmarEliminacion } from "../components/ConfirmDialog.js";
import { mostrarToast } from "../components/Toast.js";

export async function renderDashboard(contenedor) {
    const sesion = obtenerSesion();
    const navbar = crearNavbar({ usuario: sesion?.usuario });
    contenedor.append(navbar);

    const principal = document.createElement("main");
    principal.className = "dashboard";

    const cabecera = document.createElement("div");
    cabecera.className = "dashboard__cabecera";

    const titulo = document.createElement("h1");
    titulo.className = "dashboard__titulo";
    titulo.textContent = "Pedidos";

    const botonNuevo = document.createElement("button");
    botonNuevo.type = "button";
    botonNuevo.className = "boton boton--primario";
    botonNuevo.textContent = "Nuevo pedido";
    botonNuevo.addEventListener("click", () => {
        abrirPedidoModal({
            titulo: "Nuevo pedido",
            pedido: null,
            alEnviar: async (datos) => {
                await crearPedido(datos);
                mostrarToast("Pedido creado correctamente", "exito");
                await cargarPedidos();
            }
        });
    });

    const estado = document.createElement("div");
    estado.className = "estado";

    const grilla = document.createElement("div");
    grilla.className = "pedidos-grid";

    cabecera.append(titulo, botonNuevo);
    principal.append(cabecera, estado, grilla);
    contenedor.append(principal);

    async function cargarPedidos() {
        estado.textContent = "Cargando pedidos…";
        estado.classList.remove("estado--oculto");
        grilla.innerHTML = "";

        try {
            const pedidos = await listarPedidos();
            if (pedidos.length === 0) {
                estado.textContent = "No hay pedidos registrados todavía.";
                return;
            }

            estado.textContent = "";
            estado.classList.add("estado--oculto");

            pedidos.forEach((pedido) => {
                const tarjeta = crearPedidoCard({
                    pedido,
                    onEditar: () =>
                        abrirPedidoModal({
                            titulo: "Editar pedido",
                            pedido,
                            alEnviar: async (datos) => {
                                await actualizarPedido(pedido.id, datos);
                                mostrarToast("Pedido actualizado correctamente", "exito");
                                await cargarPedidos();
                            }
                        }),
                    onEliminar: () =>
                        confirmarEliminacion({
                            mensaje:
                                `¿Eliminar el pedido del mesero ${pedido.mesero} ` +
                                `de la mesa ${pedido.mesa}? Esta acción no se puede deshacer.`,
                            onConfirmar: async () => {
                                await eliminarPedido(pedido.id);
                                mostrarToast("Pedido eliminado de Sírvelo", "exito");
                                await cargarPedidos();
                            }
                        })
                });
                grilla.append(tarjeta);
            });
        } catch (error) {
            estado.textContent = error.message || "Error al cargar los pedidos.";
        }
    }

    await cargarPedidos();
}