import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../helpers/passwords.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rutaDatos = join(__dirname, "..", "..", "data");
mkdirSync(rutaDatos, { recursive: true });

const db = new DatabaseSync(join(rutaDatos, "sirvelo.db"));
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios_api (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        email    TEXT NOT NULL UNIQUE,
        nombre   TEXT NOT NULL,
        password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        mesa    TEXT NOT NULL,
        mesero  TEXT NOT NULL,
        detalle TEXT
    );

    CREATE TABLE IF NOT EXISTS categorias_menu (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre   TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        activa   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS productos_menu (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL,
        nombre      TEXT NOT NULL,
        descripcion TEXT,
        precio      REAL NOT NULL CHECK (precio >= 0),
        imagen_url  TEXT,
        disponible  INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (categoria_id) REFERENCES categorias_menu(id)
    );
`);

const columnasUsuario = db.prepare("PRAGMA table_info(usuarios_api)").all().map((columna) => columna.name);
if (columnasUsuario.includes("password") && !columnasUsuario.includes("password_hash")) {
    db.exec("BEGIN");
    try {
        db.exec(`
            CREATE TABLE usuarios_api_nueva (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                email    TEXT NOT NULL UNIQUE,
                nombre   TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )
        `);
        const usuarios = db.prepare("SELECT id, email, nombre, password FROM usuarios_api").all();
        const insertarUsuario = db.prepare(
            "INSERT INTO usuarios_api_nueva (id, email, nombre, password_hash) VALUES (?, ?, ?, ?)"
        );
        for (const usuario of usuarios) {
            insertarUsuario.run(
                usuario.id,
                usuario.email,
                usuario.nombre,
                hashPassword(usuario.password, usuario.email)
            );
        }
        db.exec("DROP TABLE usuarios_api; ALTER TABLE usuarios_api_nueva RENAME TO usuarios_api;");
        db.exec("COMMIT");
        console.log("[bd] Migración de contraseñas a hash completada");
    } catch (error) {
        db.exec("ROLLBACK");
        throw error;
    }
}

const { n } = db.prepare("SELECT COUNT(*) AS n FROM usuarios_api").get();
if (n === 0) {
    db.prepare(
        "INSERT INTO usuarios_api (email, nombre, password_hash) VALUES (?, ?, ?)"
    ).run("admin@sirvelo.com", "Administrador", hashPassword("admin123", "admin@sirvelo.com"));
    console.log("[bd] Usuario inicial creado: admin@sirvelo.com");
}

const { n: categorias } = db.prepare("SELECT COUNT(*) AS n FROM categorias_menu").get();
if (categorias === 0) {
    const categoria = db.prepare(
        "INSERT INTO categorias_menu (nombre, descripcion) VALUES (?, ?)"
    ).run("Platos", "Preparaciones principales de Sírvelo");
    db.prepare(
        "INSERT INTO productos_menu (categoria_id, nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?, ?)"
    ).run(categoria.lastInsertRowid, "Hamburguesa clásica", "Carne, queso y vegetales", 25000, "");
    console.log("[bd] Menú inicial creado");
}

export default db;
