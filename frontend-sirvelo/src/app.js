const API_BASE = "http://localhost:4000";
const CLAVE_SESION = "sirvelo_sesion";

export class ApiError extends Error {}

export function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_SESION)) || null;
    } catch {
        return null;
    }
}

export function guardarSesion(sesion) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

async function peticion(ruta, { metodo = "GET", cuerpo } = {}) {
    const sesion = obtenerSesion();
    const cabeceras = { "Content-Type": "application/json" };
    if (sesion && sesion.token) {
        cabeceras.Authorization = `Bearer ${sesion.token}`;
    }

    const opciones = { method: metodo, headers: cabeceras };
    if (cuerpo !== undefined) {
        opciones.body = JSON.stringify(cuerpo);
    }

    let respuesta;
    try {
        respuesta = await fetch(`${API_BASE}${ruta}`, opciones);
    } catch {
        throw new ApiError("No se pudo conectar con el servidor");
    }

    const texto = await respuesta.text();
    let datos = null;
    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            datos = null;
        }
    }

    if (respuesta.status === 401 && !ruta.startsWith("/api/auth")) {
        cerrarSesion();
        window.location.hash = "#/login";
    }

    if (!respuesta.ok) {
        throw new ApiError((datos && datos.mensaje) || `Error ${respuesta.status}`);
    }

    return datos;
}

export async function iniciarSesion(email, password) {
    const datos = await peticion("/api/auth/login", {
        metodo: "POST",
        cuerpo: { email, password }
    });
    guardarSesion({ token: datos.token, usuario: datos.usuario });
    return datos;
}

export async function listarPedidos() {
    const datos = await peticion("/api/pedidos");
    return Array.isArray(datos) ? datos : [];
}

export async function crearPedido(datos) {
    return peticion("/api/pedidos", { metodo: "POST", cuerpo: datos });
}

export async function actualizarPedido(id, datos) {
    return peticion(`/api/pedidos/${id}`, { metodo: "PUT", cuerpo: datos });
}

export async function eliminarPedido(id) {
    return peticion(`/api/pedidos/${id}`, { metodo: "DELETE" });
}

async function renderizarRuta() {
    const contenedor = document.getElementById("app");
    if (!contenedor) return;

    const ruta = window.location.hash || "";

    if (ruta === "#/login" || ruta === "") {
        if (obtenerSesion()) {
            window.location.hash = "#/pedidos";
            return;
        }
        contenedor.innerHTML = "";
        const { renderLogin } = await import("./views/LoginView.js");
        renderLogin(contenedor);
        return;
    }

    if (ruta === "#/pedidos") {
        if (!obtenerSesion()) {
            window.location.hash = "#/login";
            return;
        }
        contenedor.innerHTML = "";
        const { renderDashboard } = await import("./views/DashboardView.js");
        renderDashboard(contenedor);
        return;
    }

    window.location.hash = "#/login";
}

export function iniciarApp() {
    if (!window.location.hash) {
        window.location.hash = obtenerSesion() ? "#/pedidos" : "#/login";
    }
    window.addEventListener("hashchange", renderizarRuta);
    renderizarRuta();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarApp);
} else {
    iniciarApp();
}