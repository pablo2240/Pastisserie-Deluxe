PROTOCOL0 DE TRABAJO — IMPLEMENTACIÓN COMPLETA Y FUNCIONAL

Este proyecto debe evolucionar mediante cambios pequeños, controlados y bien documentados. Cada solicitud de cambio debe corregir problemas reales y mejorar la calidad del sistema, respetando la estructura existente y los requisitos definidos en requisitos.md (especialmente la sección seis).

El objetivo principal es que todo lo implementado sea funcional de extremo a extremo. No se aceptan soluciones parciales, simulaciones evidentes o implementaciones incompletas. Todo debe comportarse como un sistema real, tanto en backend como en frontend.

Forma de trabajo obligatoria

Cada vez que se solicite un cambio:

1. Análisis previo

Analizar el impacto del cambio en todo el sistema.

Identificar los archivos que se van a modificar.

Evaluar cómo afecta la funcionalidad existente.

Detectar posibles riesgos o efectos secundarios.

2. Implementación

Escribir el código necesario para cumplir el objetivo.

Conectar correctamente todos los componentes:

API

Services

Base de datos

Frontend (si aplica)

Asegurar que la funcionalidad sea completa, no simulada de forma evidente para el usuario.

3. Validación técnica

Antes de dar por finalizada cualquier tarea:

Ejecutar:

dotnet build → debe compilar sin errores.

npm run dev → frontend sin errores.

Validar adicionalmente:

No duplicar configuraciones en MappingProfile.

No romper endpoints existentes.

Crear migraciones si son necesarias.

Si hay errores:

Corregirlos automáticamente.

No finalizar hasta que todo funcione correctamente.

4. Control de calidad (QA)

Verificar que la implementación funciona correctamente.

Corregir cualquier error generado por los cambios.

Si se detectan errores fuera del alcance de esta tarea:

Reportarlos claramente sin intervenirlos.

5. Confirmación obligatoria

Al finalizar, debes indicar explícitamente:

“Implementación completada y verificada sin errores”

6. Documentación obligatoria

Después de cada implementación, se debe sugerir la creación o actualización de un archivo en:

changes/new-cambios/

Formato:

[número]-descripcion.md

Contenido obligatorio:

Qué se implementó

Archivos modificados

Problema que se resolvió

Cómo probarlo

Impacto en el sistema

7. Flujo interno de trabajo

Documentar la tarea según la estructura del proyecto.

Planificar los archivos a modificar o crear (lista clara).

Implementar cada cambio según el plan.

Verificar y corregir errores.

Validar funcionamiento completo.

Actualizar documentación.

Objetivo final

Cada cambio debe:

Ser claro, estructurado y bien documentado.

Resolver problemas reales del sistema.

Mantener coherencia con la arquitectura.

Integrar correctamente backend y frontend.

Ofrecer una experiencia realista al usuario.

Aquí no se trata solo de que funcione, sino de que esté bien hecho.