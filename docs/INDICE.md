# Índice de Documentación - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026

---

## Resumen de la Documentación

Este documento sirve como índice centralizado de toda la documentación del proyecto PastisserieDeluxe.

---

## 📁 Estructura de la Documentación

```
docs/
├── 01-requisitos/              # Especificación de requisitos
├── 02-diagramas/              # Diagramas UML (Mermaid)
├── 03-arquitectura/           # Arquitectura de software
├── 04-manuales/               # Manuales técnicos
├── 05-pruebas/                # Informe de pruebas
├── 06-negocio/                # Reglas y glosario
├── 07-base-datos/             # Schema y diccionario
├── 08-funcionalidades/        # Documentos de flujos
├── 09-historico/              # Histórico de cambios
├── Actual/                    # Estado actual del sistema
├── Lista_de_Chequeo.md        # Lista de verificación
├── requisitos.md              # Requisitos generales
└── resumen-dominios.md        # Resumen de dominios
```

---

## 📄 Archivos por Carpeta

### 📂 01-requisitos/ (2 archivos)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `especificacion-requisitos.md` | RF, RNF, RN, RI | ~370 |
| `casos-de-uso.md` | 34 casos de uso detallados | ~500 |

### 📂 02-diagramas/ (6 archivos)

| Archivo | Descripción | Tipo |
|---------|-------------|------|
| `casos-de-uso.md` | 54 casos de uso, 3 actores | Mermaid |
| `clases.md` | 18 entidades con relaciones | Mermaid |
| `secuencia.md` | 7 flujos principales | Mermaid |
| `componentes.md` | Clean Architecture | Mermaid |
| `base-de-datos.md` | E-R diagram | Mermaid |
| `despliegue.md` | Azure + Local | Mermaid |

### 📂 03-arquitectura/ (1 archivo)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `arquitectura-software.md` | Clean Architecture, tecnologías, patrones | ~550 |

### 📂 04-manuales/ (3 archivos)

| Archivo | Descripción | Público |
|---------|-------------|---------|
| `manual-tecnico.md` | Backend, frontend, API, DB | Desarrolladores |
| `manual-usuario.md` | Guía para Cliente, Admin, Repartidor | Usuarios finales |
| `manual-instalacion.md` | Configuración y despliegue | Técnicos |

### 📂 05-pruebas/ (1 archivo)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `informe-pruebas.md` | 127 pruebas, resultados, recomendaciones | ~350 |

### 📂 06-negocio/ (2 archivos)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `reglas-negocio.md` | 15 reglas de negocio por módulo | ~400 |
| `glosario-terminos.md` | 50+ términos técnicos | ~250 |

### 📂 07-base-datos/ (3 archivos)

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `schema-actual.sql` | Schema completo (18 tablas) | ~330 |
| `diccionario-datos.md` | Detalle de cada tabla | ~450 |
| `PastisserieDB.sql` | Schema legacy (referencia) | - |
| `PastisserieDBdata.sql` | Datos de seed (referencia) | - |

### 📂 08-funcionalidades/ (15 archivos)

Documentación de flujos funcionales (histórico):
- `carrito.md`, `desconexiones.md`, `envios.md`, `flujos-principales.md`
- `mapa-sistema.md`, `notificaciones.md`, `overview.md`, `pagos.md`
- `pedidos.md`, `productos.md`, `promociones.md`, `puntos-rotos.md`
- `reclamaciones.md`, `resenas.md`, `usuarios-autenticacion.md`

### 📂 09-historico/ (12 archivos)

Auditorías e implementaciones anteriores:
- `auditorias/2026-03/` - 7 archivos de auditoría
- `implementaciones/` - 2 archivos de planes

### 📂 Actual/ (5 archivos - Actualizados v2.0)

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `bd-actual.md` | ✅ Actualizado | 18 entidades, 33 migraciones |
| `CRUD.md` | ✅ Actualizado | Estado CRUD por capa |
| `Funcionamiento-actual.md` | ✅ Actualizado | 12 flujos detallados |
| `roles.md` | ✅ Actualizado | 3 roles con permisos |
| `solucion-plan-crud.md` | ✅ Actualizado | Problemas resueltos |

---

## 📊 Resumen de Métricas

| Métrica | Valor |
|---------|-------|
| Total de archivos MD/SQL | ~45 |
| Líneas de documentación | ~8,000+ |
| Entidades documentadas | 18 |
| Casos de uso | 34 |
| Requisitos funcionales | 33 |
| Reglas de negocio | 15 |
| Términos en glosario | 50+ |
| Pruebas documentadas | 127 |

---

## 🔗 Referencias Cruzadas

### Documentos que referencian a otros:

| Documento | Referencia a |
|----------|--------------|
| especificacion-requisitos.md | casos-de-uso.md |
| manual-tecnico.md | arquitectura-software.md, diccionario-datos.md |
| manual-usuario.md | casos-de-uso.md |
| reglas-negocio.md | especificacion-requisitos.md |
| diccionario-datos.md | schema-actual.sql |
| Funcionamiento-actual.md | bd-actual.md, CRUD.md |

---

## 📋 Checklist de Documentación

### ✅ Completado

- [x] Especificación de requisitos (RF, RNF, RN, RI)
- [x] Casos de uso (34 casos)
- [x] Diagramas UML (6 diagramas Mermaid)
- [x] Arquitectura de software
- [x] Manual técnico
- [x] Manual de usuario
- [x] Manual de instalación
- [x] Informe de pruebas
- [x] Reglas de negocio
- [x] Glosario de términos
- [x] Diccionario de datos
- [x] Schema SQL actualizado
- [x] Documentos Actual actualizados
- [x] README.md completo

### ⏸ Pendiente (No bloqueante)

- [ ] Documentación en línea de Swagger (integrada en el proyecto)
- [ ] Actualización de 08-funcionalidades/ (histórico, no prioritario)

---

## 📅 Historial de Actualizaciones

| Fecha | Descripción |
|-------|-------------|
| 03/04/2026 | Actualización completa - Versión 2.0 |
| 26/03/2026 | Limpieza de tablas obsoletas |
| 02/04/2026 | Agregados StockIlimitado y GPS |
| 03/04/2026 | Integración Azure Blob Storage |

---

## 📞 Soporte

Para questions sobre la documentación:
- Ver `glosario-terminos.md` para definiciones
- Ver `arquitectura-software.md` para arquitectura
- Ver `manual-tecnico.md` para detalles técnicos

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*