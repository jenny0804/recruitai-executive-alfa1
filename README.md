# RecruitAI Executive - Guía de Configuración Local

RecruitAI Executive es una plataforma inteligente para la gestión de talento, reclutamiento y preparación de candidatos, impulsada por IA (Gemini 2.5 Flash Lite).

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (v18 o superior)
- **NPM** (incluido con Node.js)
- Una cuenta en **Supabase** (para la base de datos y autenticación)
- Una API Key de **Google Gemini** (desde [Google AI Studio](https://aistudio.google.com/))

---

## 🛠️ Pasos para la Instalación

### 1. Clonar o Descargar el Proyecto
Descarga el código fuente en tu máquina local y entra en la carpeta raíz.

### 2. Instalar Dependencias
Ejecuta el siguiente comando en tu terminal:
```bash
npm install
```

### 3. Configurar la Base de Datos (Supabase)
1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ve a la sección **SQL Editor** y ejecuta el contenido del archivo:
   `Documentacion/supabase_schema.sql`
   *Esto creará las tablas de perfiles, reclutadores, candidatos y las funciones de trigger necesarias.*
3. Activa el proveedor de autenticación por Correo Electrónico (Email) en **Authentication > Providers**. Desactiva "Confirm Email" si deseas pruebas rápidas.

### 4. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto. **Para que Vite las reconozca en el cliente, deben empezar con `VITE_`**:

```env
# Supabase (Obtenlas en Project Settings > API)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-key

# Gemini AI (Obtenla en Google AI Studio)
VITE_GEMINI_API_KEY=tu_clave_de_gemini
```

> **Nota Crítica:** En el entorno de AI Studio se usa `process.env.GEMINI_API_KEY`, pero para tu despliegue local o en Netlify/Vercel con Vite, debes usar `import.meta.env.VITE_GEMINI_API_KEY` en el archivo `src/services/gemini.ts`.

### 5. Ejecutar en Desarrollo
Inicia el servidor local:
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

---

## 🏗️ Despliegue (Netlify / Vercel)

Si deseas subirlo a producción:
1. Sube tu código a GitHub.
2. Conecta el repositorio a Netlify.
3. En la configuración de **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. El comando de build es `npm run build` y la carpeta de salida es `dist`.

---

## 📂 Estructura Principal
- `src/components/`: Componentes de UI y Dashboards (Reclutador/Candidato).
- `src/services/gemini.ts`: Lógica de integración con la IA.
- `src/lib/supabase.ts`: Configuración del cliente de base de datos.
- `Documentacion/`: Esquemas de SQL y guías.

---

## 🔐 Seguridad
No incluyas tu archivo `.env` en repositorios públicos (GitHub). El archivo `.gitignore` ya está configurado para protegerlo.
