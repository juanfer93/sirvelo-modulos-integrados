import { iniciarSesion, obtenerSesion } from "../app.js";

export function renderLogin(contenedor) {
    if (obtenerSesion()) {
        window.location.hash = "#/pedidos";
        return;
    }

    const seccion = document.createElement("section");
    seccion.className = "login";

    const tarjeta = document.createElement("div");
    tarjeta.className = "login__tarjeta";

    const marca = document.createElement("div");
    marca.className = "login__marca";

    const logo = document.createElement("img");
    logo.className = "login__logo";
    logo.src = "./src/assets/img/sirvelologo.jpg";
    logo.alt = "Logo Sírvelo";

    const titulo = document.createElement("h1");
    titulo.className = "login__titulo";
    titulo.textContent = "Sírvelo";

    const subtitulo = document.createElement("p");
    subtitulo.className = "login__subtitulo";
    subtitulo.textContent = "Acceso para empleados";

    const error = document.createElement("div");
    error.className = "login__error";
    error.setAttribute("role", "alert");

    const formulario = document.createElement("form");
    formulario.className = "formulario";
    formulario.noValidate = true;

    const cuerpo = document.createElement("div");
    cuerpo.className = "formulario__grupo";

    const etiquetaEmail = document.createElement("label");
    etiquetaEmail.className = "formulario__etiqueta";
    etiquetaEmail.textContent = "Correo electrónico";
    etiquetaEmail.setAttribute("for", "campo-email");

    const campoEmail = document.createElement("input");
    campoEmail.className = "formulario__entrada";
    campoEmail.type = "email";
    campoEmail.id = "campo-email";
    campoEmail.name = "email";
    campoEmail.autocomplete = "email";
    campoEmail.placeholder = "correo@ejemplo.com";
    campoEmail.required = true;

    const cuerpoPass = document.createElement("div");
    cuerpoPass.className = "formulario__grupo";

    const etiquetaPass = document.createElement("label");
    etiquetaPass.className = "formulario__etiqueta";
    etiquetaPass.textContent = "Contraseña";
    etiquetaPass.setAttribute("for", "campo-password");

    const campoPass = document.createElement("input");
    campoPass.className = "formulario__entrada";
    campoPass.type = "password";
    campoPass.id = "campo-password";
    campoPass.name = "password";
    campoPass.autocomplete = "current-password";
    campoPass.placeholder = "••••••••";
    campoPass.required = true;

    const boton = document.createElement("button");
    boton.type = "submit";
    boton.className = "boton boton--primario boton--bloque";
    boton.textContent = "Iniciar sesión";

    const mostrarError = (mensaje) => {
        error.textContent = mensaje;
        error.classList.add("login__error--visible");
    };

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        error.classList.remove("login__error--visible");

        const email = campoEmail.value.trim();
        const password = campoPass.value;

        if (!email || !password) {
            mostrarError("Ingresa tu correo y contraseña.");
            return;
        }

        boton.disabled = true;
        boton.innerHTML = '<span class="spinner"></span> Validando…';

        try {
            await iniciarSesion(email, password);
            window.location.hash = "#/pedidos";
        } catch (errorCapturado) {
            mostrarError(errorCapturado.message || "No fue posible iniciar sesión.");
            boton.disabled = false;
            boton.textContent = "Iniciar sesión";
        }
    });

    cuerpo.append(etiquetaEmail, campoEmail);
    cuerpoPass.append(etiquetaPass, campoPass);
    formulario.append(cuerpo, cuerpoPass, boton);
    marca.append(logo, titulo);
    tarjeta.append(marca, subtitulo, error, formulario);
    seccion.append(tarjeta);
    contenedor.append(seccion);
    campoEmail.focus();
}