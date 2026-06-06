# Gymnastica

Sistema de gestión deportivo para gimnasios (estudiantes, pagos, asistencia, competencias y portal de padres).

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (opcional, para sincronización en la nube)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por ejemplo `http://localhost:5173`).

## Supabase (opcional)

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Usuarios iniciales (cámbialos al desplegar)

Tras la primera carga, los usuarios viven en `localStorage` (`gymnastica_users_v1`). En desarrollo local (`localhost`) aparece el acceso rápido de prueba.

| Rol | Correo | Contraseña inicial |
|-----|--------|-------------------|
| Admin | admin@gymnastica.app | Admin2024 |
| Operador | operador@gymnastica.app | Op2024 |
| Padre | carlos.torres@gmail.com | Padre2024 |

Los padres ven solo alumnos cuyo **correo del tutor** coincide con su cuenta. Las contraseñas no se suben a Supabase (solo perfil sin `pass`).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — vista previa del build

## Despliegue en Vercel

**Producción:** [gymnastica.vercel.app](https://gymnastica.vercel.app) — conectado a [GitHub](https://github.com/aperezavilez-ai/gymnastica) (despliegue automático en cada push a `main`).

**CLI local** (opcional, ya vinculado al proyecto `gymnastica`):

```bash
npm run vercel:whoami   # cuenta: aperezavilez-4333
npm run vercel:ls       # últimos despliegues
npm run vercel:deploy   # despliegue manual a producción
```

1. Sube el repositorio a GitHub y conéctalo en [vercel.com](https://vercel.com).
2. Vercel detecta Vite automáticamente (`vercel.json` incluido).
3. En **Settings → Environment Variables** (entorno Production y Preview), añade:
   - `VITE_SUPABASE_URL` — URL del proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY` — clave anónima pública
4. Despliega. La app queda en una URL `*.vercel.app`.
5. Ejecuta `supabase/schema.sql` en Supabase para la tabla `gymnastica_store`.

Sin variables de Supabase la app funciona igual con `localStorage` en el navegador del usuario.

```bash
npm run build   # comprobar build local antes de desplegar
```
