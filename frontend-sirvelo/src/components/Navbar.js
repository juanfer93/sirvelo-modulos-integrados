import { cerrarSesion } from "../app.js";

export function crearNavbar({ usuario }) {
    const navbar = document.createElement("header");
    navbar.className = "navbar";

    const marca = document.createElement("div");
    marca.className = "navbar__marca";

    const logo = document.createElement("img");
    logo.className = "navbar__logo";
    logo.src = "./src/assets/img/sirvelologo.jpg";
    logo.alt = "Logo Sírvelo";

    const titulo = document.createElement("span");
    titulo.className = "navbar__titulo";
    titulo.textContent = "Sírvelo";

    const derecha = document.createElement("div");
    derecha.className = "navbar__derecha";

    const nombreUsuario = document.createElement("span");
    nombreUsuario.className = "navbar__usuario";
    nombreUsuario.textContent = usuario?.nombre || usuario?.email || "Empleado";

    const botonSalir = document.createElement("button");
    botonSalir.type = "button";
    botonSalir.className = "boton boton--claro boton--pequeno";
    botonSalir.textContent = "Cerrar sesión";
    botonSalir.addEventListener("click", () => {
        cerrarSesion();
        window.location.hash = "#/login";
    });

    marca.append(logo, titulo);
    derecha.append(nombreUsuario, botonSalir);
    navbar.append(marca, derecha);
    return navbar;
}