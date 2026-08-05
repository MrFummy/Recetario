# Mi Recetario

Una aplicación web moderna para organizar recetas y subirlas mediante un flujo automatizado (n8n).

## Tecnologías
- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: Supabase (cliente JS directo)
- **Automatización**: Webhooks de n8n para ingesta, borrado y envío por email de recetas

## Configuración y Entorno

1. Copia el archivo `.env.example` a `.env` y configura tus variables de Supabase y n8n:
   ```bash
   cp .env.example .env
   ```
   
   Variables necesarias:
   - `VITE_SUPABASE_URL`: Tu URL del proyecto de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave pública (anon) de Supabase.
   - `VITE_N8N_WEBHOOK_BASE`: URL base de los webhooks de tu instancia de n8n (sin barra final), por ejemplo `https://n8n.ejemplo.com/webhook`. La app deriva de ella las tres rutas: `/nueva-receta`, `/eliminar-receta` y `/compartir-receta`.

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Levanta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

## Compilación y Despliegue

La aplicación es una SPA estática: el resultado del build son ficheros que
cualquier servidor web sirve tal cual, sin Node en producción.

### 1. Generar el build

```bash
npm run build
```

Vite **incrusta las variables `VITE_*` dentro del bundle en tiempo de compilación**.
Compila siempre en la máquina que tiene el `.env` bueno; un build hecho sin `.env`
genera una app que falla al arrancar. Para comprobar que salió bien:

```bash
grep -c "supabase.co" dist/assets/index-*.js
```

### 2. Desplegar en el Synology

El zip de despliegue lleva el **contenido** de `dist/` en su raíz (`index.html`,
`assets/`, `favicon.svg`, `icons.svg`), listo para extraer directamente en la
carpeta web.

**Opción A — Web Station (la más simple)**

1. Instala *Web Station* desde el Centro de paquetes.
2. Crea la carpeta destino en File Station, por ejemplo `/web/recetario`.
3. Sube el zip, botón derecho → *Extraer aquí*. El `index.html` debe quedar en
   `/web/recetario/index.html`, no dentro de otra subcarpeta.
4. En Web Station → *Portal web* → crear portal:
   - Servidor HTTP: **Nginx**
   - Raíz del documento: `web/recetario`
   - Puerto propio, o un nombre de host si usas dominio.

**Opción B — Container Manager (si prefieres que sea reproducible)**

```bash
docker run -d --name recetario --restart unless-stopped \
  -p 8080:80 \
  -v /volume1/web/recetario:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 3. Fallback de SPA

La app **no usa router**: todo ocurre en `/` con pestañas en estado de React, así
que no hay rutas profundas que arreglar y la configuración por defecto sirve. Si
en el futuro se añade `react-router`, hará falta esto en Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. HTTPS (recomendado, no opcional del todo)

Sirve la app por HTTPS, con el proxy inverso del DSM (*Panel de control → Portal
de inicio de sesión → Avanzado → Proxy inverso*) y un certificado Let's Encrypt,
igual que ya haces con n8n.

Motivo concreto además del obvio: por HTTP plano el navegador no considera la
página un *contexto seguro* y `crypto.randomUUID()` no existe. El código tiene un
respaldo para ese caso, pero los tokens de sesión de Supabase viajarían en claro
por la red local.

### 5. Comprobación tras desplegar

Con sesión de admin iniciada, prueba las cuatro acciones que tocan n8n o las
policies de Supabase:

| Acción | Qué valida |
|---|---|
| Ver el catálogo sin sesión | lectura pública de `recetas` |
| Votar una receta (como afan) | RLS de `valoraciones` + trigger de la media |
| Editar notas / fecha / foto | policy de UPDATE restringida a admin + subida a Storage |
| Añadir receta | webhook `nueva-receta` + validación de JWT y de admin |
| Compartir por email | webhook `compartir-receta` + lectura del `pdf_url` real |
| Borrar receta | webhook `eliminar-receta`, la cascada completa |

Si algo falla, mira la ejecución concreta en n8n (*Executions*): el nodo donde se
detiene indica si fue el gate de sesión, el de admin o un paso posterior.

## Módulos
- **Catálogo:** Visor estilo "masonry" de recetas almacenadas en Supabase con buscador por ingredientes.
- **Añadir Receta:** Formulario simple para enviar PDFs de recetas a tu flujo automatizado de n8n.
