# Mi Recetario

Una aplicación web moderna para organizar recetas y subirlas mediante un flujo automatizado (n8n).

## Tecnologías
- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: Supabase (cliente JS directo)
- **Automatización**: Webhook de n8n para la ingesta de recetas

## Configuración y Entorno

1. Copia el archivo `.env.example` a `.env` y configura tus variables de Supabase:
   ```bash
   cp .env.example .env
   ```
   
   Variables necesarias:
   - `VITE_SUPABASE_URL`: Tu URL del proyecto de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave pública (anon) de Supabase.

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Levanta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

## Compilación y Despliegue en Nginx

La aplicación está diseñada para ser una Single Page Application (SPA) estática. Para desplegar en tu servidor Nginx doméstico, sigue estos pasos:

1. Genera los archivos de producción:
   ```bash
   npm run build
   ```

2. Esto creará una carpeta `/dist`.

3. Copia el contenido de `/dist` al directorio root de Nginx (usualmente `/var/www/html` o `/usr/share/nginx/html`).

4. Asegúrate de configurar Nginx para redirigir todas las rutas al `index.html` (comportamiento de SPA):
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.local;
       root /var/www/html/recetario;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Módulos
- **Catálogo:** Visor estilo "masonry" de recetas almacenadas en Supabase con buscador por ingredientes.
- **Añadir Receta:** Formulario simple para enviar PDFs de recetas a tu flujo automatizado de n8n.
