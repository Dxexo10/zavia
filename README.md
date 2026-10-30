# Zavia

Aplicación web de finanzas personales construida por fases y con TDD.

## Versiones fijadas

- Node.js `>=24.0.0 <25`
- pnpm `11.25.0`
- Next.js `16.4.1`
- React y React DOM `19.3.1`
- TypeScript `5.9.3`
- Vitest y `@vitest/coverage-v8` `5.0.5`
- Playwright `1.64.1`
- axe para Playwright `4.14.0`
- Supabase CLI `2.121.0`
- fast-check `4.10.2`
- Testing Library React `16.3.3`
- jest-dom `7.0.1`
- jsdom `30.1.3`
- Impeccable `4.8.0` (motor `0.1.18`, licencia Apache-2.0)

## Desarrollo local

```sh
pnpm db:start
pnpm test
```

Comandos de calidad: `pnpm lint`, `pnpm typecheck`, `pnpm check:layers`,
`pnpm check:traceability`, `pnpm detect:design` y `pnpm format:check`.
`pnpm db:reset` recrea la base local; úsalo solo con datos locales prescindibles.

Los scripts de instalación de dependencias están bloqueados por defecto mediante `.npmrc`.
La única instalación posterior permitida en esta fase es la de los navegadores de Playwright,
cuando una prueba E2E lo necesite: `pnpm exec playwright install`.

Supabase local inicia exclusivamente base de datos, Auth, API gateway y REST. El correo de Auth
queda habilitado solo en local para `loginAs` de pruebas; staging y producción deben deshabilitarlo
según `SEG-AUT-02`. La documentación vigente menciona `inbucket.enabled`, mientras que el archivo
generado por Supabase CLI `2.121.0` usa `[local_smtp]` con `enabled = false`; se sigue la clave
generada por el CLI.
