// fix-env.js
import fs from "fs";

// 1. Lee tu archivo serviceAccount.json
const serviceAccount = JSON.parse(
  fs.readFileSync("./new-prototype-rmkd6-firebase-adminsdk-fbsvc-f17e4e3695.json", "utf8")
);

// 2. Formatea la private key para .env (escapando los saltos de línea)
const formattedKey = serviceAccount.private_key.replace(/\n/g, "\\n");

// 3. Carga el contenido actual del .env.local (si existe)
let envContent = "";
const envPath = "./.env.local";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

// 4. Reemplaza o añade las variables
function upsertEnv(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

envContent = upsertEnv(envContent, "FIREBASE_PROJECT_ID", serviceAccount.project_id);
envContent = upsertEnv(envContent, "FIREBASE_CLIENT_EMAIL", serviceAccount.client_email);
envContent = upsertEnv(envContent, "FIREBASE_PRIVATE_KEY", formattedKey);

// 5. Guarda el archivo corregido
fs.writeFileSync(envPath, envContent, "utf8");

console.log("✅ .env.local actualizado correctamente con las credenciales de Firebase Admin.");
