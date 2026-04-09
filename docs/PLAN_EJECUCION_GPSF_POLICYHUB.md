# Plan de ejecución integral — GPSF PolicyHub

Este documento traduce el contexto de producto a un **plan operativo** con pasos concretos,
orden recomendado, validaciones y definición de terminado para cada fase.

## 1) Objetivo operativo

Pasar de un MVP con extracción IA + Google Sheets a una plataforma SaaS multi-tenant
con PostgreSQL, gestión de pólizas, alertas de vencimiento y autenticación real.

## 2) Alcance por fases

### Fase 1 — Persistencia en PostgreSQL (prioridad máxima)

**Resultado esperado:**
- Datos de usuarios, clientes, compañías y pólizas en DB relacional.
- Endpoints existentes operando contra DB.
- Google Sheets como export opcional (no como storage principal).

**Entregables técnicos:**
1. SQLAlchemy + Alembic + psycopg2-binary instalados.
2. `database.py` (engine/session) + modelos relacionales.
3. Migración inicial creada y aplicada.
4. Reemplazo de `users.json` por tabla `users`.
5. Reemplazo de `write_to_sheets()` por inserciones en `polizas`.
6. Endpoints `POST /confirmar`, `POST /webhook/n8n`, `POST /webhook/telegram` actualizados.

**Definición de terminado (DoD):**
- Se crea una póliza completa desde web y webhook.
- El registro aparece en DB y se consulta correctamente.
- Healthcheck DB OK.
- Tests de integración mínimos pasando.

---

### Fase 2 — Gestión de pólizas

**Resultado esperado:**
- CRUD completo de pólizas y filtros de consulta.

**Entregables técnicos:**
1. `GET /polizas` con filtros (`compania`, `ramo`, `vigencia`, `estado`).
2. `GET /polizas/{id}`.
3. `PUT/PATCH /polizas/{id}`.
4. `DELETE /polizas/{id}` (soft delete recomendado).
5. Vistas por cliente en frontend.

**DoD:**
- Búsqueda y edición funcionando en UI.
- Validaciones de negocio aplicadas.
- Cobertura de tests para casos felices + errores comunes.

---

### Fase 3 — Alertas de vencimiento

**Resultado esperado:**
- Detección diaria de pólizas próximas a vencer + notificación.

**Entregables técnicos:**
1. APScheduler configurado.
2. Job diario para ventanas de 30/15/7 días.
3. Envío de notificación por Telegram y/o email.
4. Estados operativos: `en_gestion`, `renovada`, `cancelada`.

**DoD:**
- Job corre automáticamente.
- Queda trazabilidad de alertas enviadas.
- Reintentos y manejo de errores mínimos implementados.

---

### Fase 4 — Auth real y multi-tenancy

**Resultado esperado:**
- Login Google OAuth + JWT.
- Aislamiento por productor (tenant).

**Entregables técnicos:**
1. OAuth integrado (Authlib/FastAPI-Users).
2. Emisión y validación de JWT.
3. Filtros de seguridad por `user_id` en todos los endpoints.

**DoD:**
- Un productor no puede leer ni modificar datos de otro.
- Flujos login/logout y refresh operativos.

---

### Fase 5 — SaaS

**Resultado esperado:**
- Producto operable comercialmente con onboarding y métricas.

**Entregables técnicos:**
1. Planes (free/pro) y límites por plan.
2. Onboarding inicial.
3. Dashboard comercial (cartera, comisiones, vencimientos).

**DoD:**
- Alta de nuevo productor end-to-end sin intervención manual.

## 3) Proceso de trabajo recomendado (ejecución)

1. **Diseño corto:** confirmar modelos, campos y reglas de negocio.
2. **Implementación backend:** migraciones + repositorios + servicios.
3. **Integración IA/OCR:** conservar contratos actuales de extracción.
4. **Integración canales:** web, n8n, telegram.
5. **QA técnico:** tests unitarios + integración + casos reales.
6. **Pilot interno:** 1 productor, lote real de pólizas.
7. **Release controlado:** feature flags y monitoreo.

## 4) Checklist técnico de Fase 1 (paso a paso)

- [ ] Crear módulo de configuración (`settings.py`) con `DATABASE_URL`.
- [ ] Crear `engine`, `SessionLocal`, `Base`.
- [ ] Definir modelos `User`, `Compania`, `Cliente`, `Poliza`.
- [ ] Definir relaciones y constraints (FK, índices por búsqueda).
- [ ] Inicializar Alembic.
- [ ] Generar migración inicial.
- [ ] Ejecutar migración en entorno dev.
- [ ] Reemplazar lecturas/escrituras a `users.json`.
- [ ] Implementar persistencia de `Poliza` en DB.
- [ ] Mantener export a Sheets como operación secundaria/opcional.
- [ ] Agregar endpoint de health DB (o ampliar `/health`).
- [ ] Testear alta desde `POST /confirmar`.
- [ ] Testear webhook `n8n` con payload base64.
- [ ] Testear webhook `telegram` con adjunto real.

## 5) Matriz de riesgos y mitigación

- **Riesgo:** PDFs escaneados con baja calidad.
  - **Mitigación:** fallback OCR + validaciones de campos críticos.
- **Riesgo:** diferencias de formato por compañía.
  - **Mitigación:** prompts por compañía + normalización posterior.
- **Riesgo:** inconsistencias monetarias/fechas.
  - **Mitigación:** parser de montos/fechas con normalizador central.
- **Riesgo:** costos de IA.
  - **Mitigación:** caché de resultados + política de reintentos limitada.

## 6) Criterios de calidad

- Logging estructurado por request y por póliza.
- Trazabilidad de fuente (`web`, `telegram`, `email`) y método (`pdfplumber`, `gemini_ocr`).
- Manejo de errores con códigos HTTP consistentes.
- Validación de esquemas (Pydantic) antes de persistir.

## 7) Comandos guía (desarrollo)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Migraciones (cuando esté integrado Alembic)
alembic revision --autogenerate -m "init schema"
alembic upgrade head
```

## 8) Entregable mínimo recomendado para el próximo sprint

- Fase 1 completa + pruebas de integración básicas.
- Export opcional a Google Sheets activo.
- Documento de decisiones ADR para modelo de datos.

