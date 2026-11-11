# BioConecta 🌿

**Todos los eventos por la biodiversidad, en un solo lugar.**

🌐 **Demo:** https://bioconecta-henna.vercel.app

Prototipo funcional (MVP) de una plataforma web para encontrar, publicar e inscribirse en actividades
ambientales en Barranquilla y su área metropolitana. Proyecto final de la asignatura
**Biodiversidad y Sociedad** — Universidad del Norte, 2026.

| Integrante | Carrera | Rol |
| --- | --- | --- |
| Camilo Andrés de la Rosa Movilla | Ing. de Sistemas | Frontend e integración del diseño |
| Andrés Felipe Pérez Ariza | Ing. de Sistemas | Backend, base de datos y despliegue |
| Jorge Narváez | Diseño Gráfico | Identidad visual y UX/UI |
| Jesús David Miranda | Ing. Mecánica | Gestión del proyecto y modelo de huella de carbono |

Docente: Yolanda Celis Pacheco.

---

## Funcionalidades

**Participantes**
- Buscar eventos y filtrarlos por texto, fecha (hoy, fin de semana, 7 días, mes o rango), ciudad, tipo
  (charla, taller, voluntariado, salida de campo, siembra, limpieza), modalidad y gratuidad.
- Ver los eventos en lista o en un **mapa** (Leaflet + OpenStreetMap).
- Ver el detalle, la ubicación y los cupos disponibles, e **inscribirse** (control de cupos atómico en la base de datos).
- **Recordatorio**: al inscribirse se puede añadir el evento a Google Calendar o descargar un `.ics` con alarma
  1 día antes; en *Mis inscripciones* aparece un aviso para los eventos de las próximas 48 h.

**Organizadores** (fundaciones, universidades, colectivos, entidades)
- Crear cuenta como organizador y **publicar eventos** (con selector de ubicación en el mapa).
- Ver y **exportar a CSV la lista de inscritos**; editar, cancelar o eliminar sus eventos.

**Ficha de sostenibilidad** (elemento diferenciador)
- Cada evento presencial muestra una estimación de su **huella de carbono** (transporte de asistentes,
  energía y materiales), su nivel (bajo/medio/alto), equivalencias y recomendaciones para reducirla.
- El organizador ve una vista previa en vivo mientras llena el formulario.

## Arquitectura

```
Next.js (App Router, React, TypeScript, Tailwind, shadcn/ui)  ← UI generada con v0 y adaptada
   │  Server Components / Server Actions (backend de la app)
   ▼
Supabase
   ├─ Auth (correo y contraseña)
   ├─ Postgres: profiles · events · registrations  (RLS en todas las tablas)
   └─ Storage: bucket event-images (portadas)
Mapas: Leaflet + OpenStreetMap (sin API keys)
Despliegue: Vercel (plan gratuito)
```

### Modelo de datos

- `profiles` — un perfil por usuario (`participante` u `organizador`), creado por un trigger al registrarse.
- `events` — eventos con fecha, lugar, coordenadas, cupo, requisitos, fuente y `sustainability` (insumos de la huella).
- `registrations` — inscripciones (`confirmada` / `cancelada`), únicas por evento y usuario.

Reglas clave en la base de datos (`supabase/migrations/`):
- **RLS**: cualquiera ve eventos publicados; solo organizadores crean eventos y solo editan los suyos;
  cada participante ve sus inscripciones y el organizador ve las de sus eventos.
- **Cupos**: un trigger bloquea la fila del evento, valida el cupo y mantiene `registered_count`
  (no se puede sobrepasar el cupo aunque dos personas se inscriban al mismo tiempo).
- Privilegios por columna: el cliente no puede modificar contadores ni identificadores.

## Modelo de huella de carbono

Implementado en [`lib/footprint.ts`](lib/footprint.ts) (todos los factores en un solo objeto `EMISSION_FACTORS`).

```
Huella total = Transporte + Energía + Materiales
Transporte  = asistentes × distancia de ida × 2 × Σ (participación del modo × kg CO₂ por pasajero-km)
              kg CO₂ por pasajero-km = factor del combustible ÷ rendimiento ÷ ocupación
Energía     = kW de equipos × horas × 0,220 kg CO₂e/kWh
Materiales  = Σ cantidad × factor del material
```

| Parámetro | Valor | Fuente |
| --- | --- | --- |
| Gasolina E10 | 7,6181 kg CO₂/gal | UPME, FECOC 2016 |
| Diésel B10 | 10,2765 kg CO₂/gal | UPME, FECOC 2016 |
| Red eléctrica (SIN 2024) | 0,220 kg CO₂e/kWh | UPME, Resolución 000085 de 2026 |
| Rendimiento / ocupación | carro 40 km/gal · 1,5 p; moto 100 km/gal · 1,2 p; bus 8 km/gal · 30 p | Supuestos ajustables |
| Materiales | hoja 0,005 · botella PET 0,08 · kit desechable 0,07 · camiseta 2,6 kg CO₂e | Valores de referencia, por validar |
| Equivalencia | 335 mangles ≈ 7,0 t CO₂/año | Universidad del Norte (2026) |

Recomendaciones basadas en ISO 20121:2024 (gestión sostenible de eventos).

## Datos del demo

`supabase/seed.sql` carga **16 eventos de referencia** basados en organizadores, programas y lugares reales
(Barranquilla Verde, Universidad del Norte, Ecoparque Ciénaga de Mallorquín, SOA, CRA, Fundación Usiacurí Verde,
EcoFest, Zoológico de Barranquilla…), cada uno con su fuente (`source_url`).

> ⚠️ Las agendas futuras de estos organizadores no están publicadas en un solo lugar (es justamente el problema
> que BioConecta busca resolver), por lo que **las fechas y los cupos de estos eventos son ilustrativos**
> (`is_demo = true`) y la aplicación lo indica en cada ficha. Antes de la exposición, reemplácenlos por los
> eventos confirmados en la Fase 2 (directorio de organizadores) desde el panel de organizador o editando el seed.

## Desarrollo local

Requisitos: Node.js 20+ y npm.

```bash
npm install
cp .env.example .env.local   # y completa los valores de Supabase
npm run dev                   # http://localhost:3000
```

Base de datos: aplica `supabase/migrations/*.sql` y luego `supabase/seed.sql` en tu proyecto
(SQL Editor del dashboard o `supabase db push`).

### Configuración de Auth en Supabase (importante para el demo)

En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email** para que los usuarios de
las pruebas de usabilidad puedan entrar sin verificar el correo (el servidor de correo por defecto de Supabase
solo envía a miembros del equipo). En **Authentication → URL Configuration**, agrega la URL de producción.

## Despliegue

El demo está en Vercel (proyecto `blpx/bioconecta`), con las variables `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `NEXT_PUBLIC_SITE_URL` configuradas.

```bash
vercel deploy --prod --scope blpx   # publicar una nueva versión desde la carpeta local
```

Para que cada `git push` a `main` despliegue automáticamente, agrega GitHub como método de inicio de sesión
en Vercel (Account Settings → Authentication) y ejecuta `vercel git connect`.
Recuerda poner la URL de producción en Supabase → Authentication → URL Configuration (Site URL).

## Accesibilidad

Se siguieron las pautas WCAG 2.2 AA: contraste ≥ 4,5:1, foco visible, enlace "Saltar al contenido",
etiquetas en todos los campos, objetivos táctiles ≥ 24 px, navegación por teclado, `prefers-reduced-motion`
y el mapa siempre acompañado de la dirección en texto.

## Declaración de uso de IA

La interfaz se generó inicialmente con **v0** (Vercel) a partir de una especificación del equipo, y la base de
datos, la integración con Supabase, el modelo de huella y la investigación de eventos se desarrollaron con
**Claude** (Anthropic). El equipo revisa, ajusta y asume la responsabilidad del contenido.
