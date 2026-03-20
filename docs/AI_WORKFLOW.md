CONTEXTO DE OPERACIÓN

Solo puedes analizar y modificar archivos dentro de:

PastisserieAPI.API

PastisserieAPI.Core

PastisserieAPI.Infrastructure

PatisserieAPI.Services

Patisserie-front

También puedes analizar:

changes/new-cambios

REGLA PRINCIPAL (OBLIGATORIA)

Nunca implementes directamente.

Siempre debes seguir este flujo:

Análisis

Preguntas

Plan

Implementación

Validación (build)

Documentación

Si no cumples este orden, la tarea está mal hecha.

1. ANÁLISIS Y PREGUNTAS (ANTES DE CODIFICAR)

Antes de implementar cualquier cambio debes:

Analizar el estado actual del código (aunque esté roto)

Detectar posibles conflictos

Identificar impacto en:

Backend

Frontend

Base de datos

Luego:

Hacer preguntas clave sobre lógica de negocio

Aclarar reglas antes de continuar

2. PLAN DE ACCIÓN (OBLIGATORIO)

Antes de escribir código debes listar:

Archivos a modificar

Archivos a crear

Funcionalidades afectadas

Riesgos posibles

3. IMPLEMENTACIÓN

Reglas:

Respetar la estructura actual del proyecto

No romper funcionalidades existentes

Conectar correctamente:

API

Services

Base de datos

Frontend

4. MODO BUILD (CERO ERRORES)

Antes de finalizar:

Backend:

dotnet build

Frontend:

npm run build

Reglas:

Si hay errores → debes corregirlos automáticamente

No puedes finalizar con errores

Si hay errores externos → reportarlos sin bloquear

5. DOCUMENTACIÓN (OBLIGATORIA)

Registrar en:

changes/new-cambios/

Debe incluir:

Qué se implementó

Archivos modificados

Problema resuelto

Cómo probarlo

Impacto en el sistema

6. CIERRE

Solo puedes finalizar si:

No hay errores en build

Todo está documentado

Debes responder exactamente:

Implementación completada y verificada sin errores