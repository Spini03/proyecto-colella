# GPSF PolicyHub — Contexto para asistentes de código

## ¿Qué es este proyecto?
Sistema SaaS de gestión de pólizas de seguros para productores/brokers argentinos.
Desarrollado por GPSF (Gachet Ponzellini Software Factory).

El sistema extrae automáticamente los datos de pólizas en PDF usando IA (Claude Opus),
con fallback OCR vía Gemini Vision si el PDF es escaneado.

Los datos se guardan en Google Sheets (por ahora) y en el futuro en PostgreSQL.

## Stack actual

| Capa | Tecnología |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Extracción IA | Claude Opus (`claude-opus-4-6`) vía Anthropic API |
| OCR fallback | Gemini 1.5 Flash (Google) |
| PDF parsing | `pdfplumber` + PyMuPDF |
| Storage actual | Google Sheets (`gspread`) + `users.json` |
| Frontend | HTML/CSS/JS puro — un solo archivo (`frontend/src/app.html`) |
| Auth | Simulada (`localStorage`) — pendiente OAuth real |
| Notificaciones | Telegram Bot directo + n8n para triggers Gmail/Telegram |
| Deploy | Docker + docker-compose en VPS |

## Estructura esperada del repo (GPSF PolicyHub)

```text
gpsf-policyhub/
├── backend/
│   └── main.py              ← API, extracción, Sheets, Telegram
├── frontend/
│   └── src/
│       └── app.html         ← app web completa
├── n8n/
│   └── triggers.json        ← workflow n8n (triggers, delega al backend)
├── Dockerfile
├── docker-compose.yml
└── CLAUDE.md
```

## Endpoints actuales del backend

- `GET /health` → Healthcheck
- `POST /extraer` → Recibe PDF, extrae campos con IA, devuelve JSON
- `POST /confirmar` → Guarda datos confirmados en Google Sheets
- `POST /webhook/n8n` → Recibe PDF base64 desde n8n, procesa y guarda
- `POST /webhook/telegram` → Webhook directo del bot de Telegram
- `POST /configurar-usuario` → Guarda config de usuario (Sheets URL, Telegram chat id)
- `GET /usuario/{key}` → Obtiene config de un usuario

## Campos que se extraen de cada póliza

```python
razon_social, compania, ramo, poliza_nro, endoso_nro,
fecha_inicio, fecha_vencimiento, suma_asegurada,
ubicacion_riesgo, tareas_a_desarrollar,
prima_tecnica, impuestos, rec_admin, rec_financ,
tasas_y_derechos, sellados, iibb, iva, premio,
comision_productor_pct, moneda, observaciones
```

## Variables de entorno necesarias

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
TELEGRAM_BOT_TOKEN=123456:ABC...
GOOGLE_SA_JSON=service_account.json
```

## Contexto de negocio

- Los productores son brokers de seguros que gestionan pólizas de múltiples clientes.
- Cada cliente puede tener N pólizas de distintas compañías.
- Cada compañía tiene formatos de póliza distintos, por eso se usa IA en lugar de parsers fijos.
- Ramos principales: Automotores, Incendio, ART, Accidentes Personales, RC, Vida, Hogar, Caución.
- Las pólizas tienen vigencia (fecha inicio → fecha vencimiento), clave para alertas de renovación.
- El premio es el monto total que paga el asegurado.
- La comisión es lo que cobra el productor (% sobre la prima).

## Roadmap priorizado

### Fase 1 — Base de datos PostgreSQL (próximo)

Reemplazar `users.json` y Google Sheets por PostgreSQL real.

Modelos necesarios:

```text
User
  id, email, name, google_id, telegram_chat_id, created_at

Compania
  id, nombre, activa

Cliente
  id, razon_social, dni_cuit, email, telefono, direccion, user_id

Poliza
  id, user_id, cliente_id, compania_id
  ramo, poliza_nro, endoso_nro
  fecha_inicio, fecha_vencimiento
  suma_asegurada, prima_tecnica, impuestos, rec_admin, rec_financ
  tasas_y_derechos, sellados, iibb, iva, premio
  comision_productor_pct, moneda
  ubicacion_riesgo, tareas_a_desarrollar, observaciones
  fuente_carga (web/telegram/email)
  metodo_extraccion (pdfplumber/gemini_ocr)
  created_at, updated_at
```

Tasks de esta fase:

- Instalar SQLAlchemy + Alembic + psycopg2-binary.
- Crear modelos con relaciones.
- Configurar migraciones con Alembic.
- Reemplazar `users.json` → tabla `users`.
- Reemplazar `write_to_sheets()` → insert en tabla `polizas` (Sheets como export opcional).
- Actualizar endpoints para usar DB.

### Fase 2 — Gestión de pólizas

- CRUD completo de pólizas.
- Vista de pólizas por cliente.
- Filtros por compañía, ramo, vigencia, estado.

### Fase 3 — Alertas de vencimiento

- Job diario con APScheduler.
- Detectar pólizas que vencen en 30, 15 y 7 días.
- Notificar al productor por Telegram y email.
- Marcar pólizas como `renovada`, `cancelada`, `en gestión`.

### Fase 4 — Auth real

- Google OAuth con FastAPI-Users o Authlib.
- JWT tokens.
- Multi-tenancy por productor.

### Fase 5 — SaaS

- Planes (free/pro).
- Onboarding de nuevos productores.
- Dashboard con métricas.

## Decisiones de diseño tomadas

- n8n solo para triggers (Gmail/Telegram), sin lógica de negocio.
- Frontend en un único archivo (`app.html`) para simplificar deploy.
- Claude Opus para máxima precisión de extracción.
- Gemini como fallback OCR por costo.
- Google Sheets se mantiene como export aun cuando se agregue PostgreSQL.


## Plan de ejecución (operativo)

Para pasar de contexto a implementación concreta, revisar:

- `docs/PLAN_EJECUCION_GPSF_POLICYHUB.md`

Este playbook detalla fases, checklist técnico, DoD, riesgos y proceso end-to-end.

## Desarrollo local

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Frontend: abrir frontend/src/app.html
# o python -m http.server 3000 desde frontend/src/
```

## Deploy

```bash
docker compose up -d
# App en puerto 8000
# Configurar Nginx como reverse proxy
```
