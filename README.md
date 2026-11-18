# Plantilla Next.js + Prisma Gratuita

Una plantilla completa y moderna de [Next.js](https://nextjs.org) con [Prisma](https://www.prisma.io) pre-configurado, lista para que construyas tus proyectos.

**¡Esta plantilla es 100% gratuita para los miembros de nuestra comunidad!**

## 🤝 Únete a la Comunidad

Accede a esta plantilla y mucho más contenido gratuito:

- **Discord**: [Únete a nuestro servidor](https://discord.com) - Recibe soporte directo y acceso a recursos exclusivos
- **Web**: [www.kadev.cl](https://www.kadev.cl) - Explora más proyectos y documentación

## Getting Started

Requisitos: Node.js 20+, pnpm y Docker (o cualquier PostgreSQL 15+).

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno (DATABASE_URL apunta al Postgres de docker-compose)
cp .env.example .env
#    y completa GEMINI_API_KEY, APP_PASSWORD y AUTH_SECRET en .env

# 3. Levantar PostgreSQL en Docker
pnpm db:up

# 4. Aplicar las migraciones a la base
pnpm db:migrate

# 5. Servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000), entra con tu `APP_PASSWORD` y sube tu CV (PDF, .txt o texto pegado). La IA extrae tu perfil maestro y evalúa tu CV; revisas el resultado y lo guardas.

### Acceso privado

Toda la app (páginas y API) exige iniciar sesión con la contraseña de `APP_PASSWORD` (mínimo 12 caracteres).

- [`proxy.ts`](proxy.ts) redirige a `/login` sin sesión y responde 401 en `/api`; cada Server Action y ruta API vuelve a comprobar la sesión.
- La sesión es una cookie `httpOnly` firmada con HMAC que dura 30 días. Cambiar `APP_PASSWORD` o `AUTH_SECRET` cierra todas las sesiones.
- Tras 5 intentos fallidos desde la misma IP, el login se bloquea 15 minutos.

### Backend de JustWork

| Archivo | Qué hace |
|---|---|
| [`lib/repository.ts`](lib/repository.ts) | Acceso a datos: perfil maestro (con el análisis del CV) y postulaciones |
| [`lib/auth.ts`](lib/auth.ts) · [`app/login/`](app/login) | Contraseña, sesión firmada y límite de intentos |
| [`app/cv-actions.ts`](app/cv-actions.ts) | Server Actions para analizar y guardar tu CV |
| [`lib/ai.ts`](lib/ai.ts) | Prompts y esquemas de Gemini: analizar CV (PDF o texto), evaluar vacante, adaptar CV, responder preguntas |
| [`lib/gemini.ts`](lib/gemini.ts) | Cliente de Gemini con reintentos y modelo de respaldo si el principal está saturado |
| [`lib/scraper.ts`](lib/scraper.ts) | Extrae el texto de una vacante desde una URL (Jina Reader + fetch directo) |
| [`lib/app-context.tsx`](lib/app-context.tsx) | Estado de cliente (`AppProvider` / `useApp`) con mutaciones optimistas contra `/api` |
| [`lib/types.ts`](lib/types.ts) | Tipos de dominio |
| [`app/api/`](app/api) | Rutas REST: `profile`, `applications`, `scrape-job` y `gemini/*` |

### Base de datos (Prisma 8)

- El contrato de datos vive en [`src/prisma/contract.ts`](src/prisma/contract.ts) y el cliente en [`src/prisma/db.ts`](src/prisma/db.ts).

Flujo para cambiar el modelo:

```bash
pnpm contract:emit                       # regenera contract.json / contract.d.ts
pnpm migration:plan --name <descripcion> # crea la migración en migrations/app
pnpm db:migrate                          # la aplica
pnpm db:verify                           # comprueba que la base coincide con el contrato
```

### UI (shadcn/ui)

Los componentes están en [`components/ui`](components/ui) (estilo `base-nova`, Base UI + Tailwind v4). Para agregar más:

```bash
pnpm dlx shadcn@latest add dialog
```

### Características

- ⚡ **Next.js 16.3.4+** - Framework React moderno y rápido
- 🗄️ **Prisma 8 + PostgreSQL** - Contrato de datos tipado, migraciones y Docker Compose listo
- 🧩 **shadcn/ui** - Componentes accesibles con modo claro/oscuro
- 🎨 **Optimización de fuentes** - Usando [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) con [Geist](https://vercel.com/font)
- 📱 **Totalmente responsive** - Listo para cualquier dispositivo

## 📦 Stack Incluido

```json
{
  "Next.js": "16+",
  "Prisma": "v8",
  "PostgreSQL": "17 (Docker)",
  "shadcn/ui": "base-nova",
  "Biome": "latest",
  "Node.js": "20+",
  "Package Manager": "npm/yarn/pnpm/bun"
}
```

## 🛠️ Biome - Linting y Formateo

Este proyecto utiliza **[Biome](https://biomejs.dev)** para linting, formateo y organización de imports de forma rápida y eficiente.

### Comandos Disponibles

```bash
# Formatear todos los archivos
pnpx @biomejs/biome format --write

# Formatear archivos específicos
pnpx @biomejs/biome format --write <files>

# Lint y aplicar correcciones seguras a todos los archivos
pnpx @biomejs/biome lint --write

# Lint y aplicar correcciones seguras a archivos específicos
pnpx @biomejs/biome lint --write <files>

# Formatear, lint y organizar imports de todos los archivos
pnpx @biomejs/biome check --write

# Formatear, lint y organizar imports de archivos específicos
pnpx @biomejs/biome check --write <files>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Licencia

Esta plantilla es **completamente gratuita** para los miembros de la comunidad de [kadev.cl](https://www.kadev.cl). Puedes usarla, modificarla y compartirla libremente.

---

**¿Preguntas o necesitas ayuda?** Únete a nuestro [Discord](https://discord.com) o visita [www.kadev.cl](https://www.kadev.cl)
