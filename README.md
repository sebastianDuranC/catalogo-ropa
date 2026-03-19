# Catálogo de Ropa

Gestor y catálogo web de ropa construido con Next.js 15, Neon Postgres y Cloudinary.

## Variables de entorno requeridas

Copia `.env.local.example` a `.env.local` y completa los valores:

```
DATABASE_URL=       # Connection string de Neon Tech
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue

La app está lista para desplegar en Vercel. Conecta el repositorio GitHub y configura las variables de entorno en el panel de Vercel.
