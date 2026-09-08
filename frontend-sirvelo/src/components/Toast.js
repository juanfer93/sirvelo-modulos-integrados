export function mostrarToast(mensaje, tipo = "exito") {
    let contenedor = document.getElementById("contenedor-toasts");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-toasts";
        contenedor.className = "toasts";
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.setAttribute("role", "status");
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast--oculto");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}