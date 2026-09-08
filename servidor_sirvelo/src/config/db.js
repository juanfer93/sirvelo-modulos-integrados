import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        mesa    TEXT NOT NULL,
        mesero  TEXT NOT NULL,
        detalle TEXT
    );
`);

const { n } = db.prepare("SELECT COUNT(*) AS n FROM usuarios_api").get();
if (n === 0) {
    db.prepare(
        "INSERT INTO usuarios_api (email, nombre, password) VALUES (?, ?, ?)"
    ).run("admin@sirvelo.com", "Administrador", "admin123");
    console.log("[bd] Usuario inicial creado: admin@sirvelo.com");
}

export default db;