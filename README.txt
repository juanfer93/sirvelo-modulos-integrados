=============================
  SIRVELO · GESTION DE PEDIDOS
=============================

REQUISITOS
----------
- Windows
- Node.js version 22.13 o superior
  (se necesita el modulo integrado node:sqlite)
  Descargalo en: https://nodejs.org

NO hace falta instalar ninguna libreria ni modificar nada.

COMO INICIARLO
--------------
1. Doble clic en "iniciar.bat".
2. Se abren dos ventanas de consola:
   - "Sirvelo API"      -> http://localhost:4000
   - "Sirvelo Frontend" -> http://localhost:5500
3. Se abre automaticamente el navegador en la interfaz.
4. Inicia sesion con las credenciales de ejemplo.

CREDENCIALES DE EJEMPLO
-----------------------
   Email:    admin@sirvelo.com
   Password: admin123

COMO DETENERLO
--------------
- Cerrar las dos ventanas de consola.

DATOS
-----
- La base de datos se crea sola en:
  servidor_sirvelo/data/sirvelo.db
- Si borras ese archivo, al volver a iniciar se recrea
  con las tablas y el usuario de ejemplo.

QUE INCLUYE EL PROYECTO
-----------------------
- servidor_sirvelo/   -> API 100% nativa (Node, sin librerias)
- frontend-sirvelo/   -> Interfaz de login y dashboard (Vanilla JS)
- servidor_statico.js -> Servidor de archivos del frontend
- iniciar.bat         -> Lanzador de un clic