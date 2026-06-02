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

## Accesos demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | admin@gymnastica.com | Admin2024 |
| Operador | operador@gymnastica.com | Op2024 |
| Padre | carlos.torres@gmail.com | Padre2024 |

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — vista previa del build
