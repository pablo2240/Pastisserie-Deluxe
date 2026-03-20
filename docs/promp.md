**PROTOCOLO DE TRABAJO — ENFOQUE FUNCIONAL Y EXPERIENCIA DE USUARIO**

El objetivo principal es lograr que el sistema funcione de forma usable y coherente para el usuario final, priorizando la experiencia sobre la perfección técnica. No importa si actualmente existen partes rotas, incompletas o mal implementadas; se trabajará sobre lo existente para llevarlo rápidamente a un estado funcional.

Este proyecto tiene limitaciones de tiempo, por lo tanto, el enfoque será práctico: resolver lo necesario para que el flujo del usuario funcione correctamente de principio a fin.

---

### **Forma de trabajo**

Cada vez que se proponga una idea o cambio (por ejemplo: “corrige esto” o “mejora esto”):

---

### **1. Análisis práctico del sistema**

* Analizar el estado actual relacionado con la idea.
* Entender cómo funciona hoy (aunque esté mal).
* Identificar qué partes afectan directamente la experiencia del usuario.

---

### **2. Enfoque en funcionalidad**

* Priorizar que el flujo funcione de extremo a extremo.
* No bloquearse por errores estructurales actuales.
* No rehacer todo, sino ajustar lo necesario para que funcione.

---

### **3. Generación de preguntas clave**

Antes de implementar, se deben generar preguntas claras que ayuden a definir correctamente la solución.

Estas preguntas deben:

* Aclarar reglas del negocio
* Definir comportamiento esperado
* Evitar ambigüedades

---

### **4. Definición en formato de reglas de negocio**

Con base en el análisis y las respuestas, se debe estructurar la solución como reglas de negocio claras.

Ejemplo de formato:

* El usuario invitado puede ver productos pero no comprar.
* Si el usuario intenta comprar sin sesión, se muestra mensaje, no redirección.
* El pago debe validar todos los campos antes de procesarse.

---

### **5. Validación de la idea antes de implementar**

* Confirmar que las reglas tienen sentido.
* Asegurar que el flujo es usable para el usuario.
* Evitar soluciones complejas innecesarias.

---

### **6. Enfoque clave**

* Primero que funcione.
* Luego que sea correcto.
* La experiencia del usuario manda sobre la perfección técnica.

---

### **Objetivo final**

* Que el usuario pueda usar el sistema sin fricciones.
* Que los flujos principales (navegar, ver productos, comprar, pagar) funcionen.
* Que cada cambio tenga sentido práctico dentro del sistema actual.

---

Aquí no se trata de hacerlo perfecto.
Se trata de hacerlo funcionar bien para el usuario.
---

cuando estas en modo build verifique que no haya errores del codigo en la parte backend y frontend: 
- verificar de que no haya errores en el back con dotnet build 
- verifiacr de que no haya errores en el front con npm run build
- y si es necesario has migracion y luego vuelve a verificar de que no haya errores en el back con dotnet build y en el front con npm run build 
- si hay errores en el back con dotnet build, solucionalos y vuelve a verificar de que no haya errores en el back con dotnet build y en el front con npm run build
- si hay errores en el front con npm run build, solucionalos y vuelve a verificar de que no haya errores en el back con dotnet build y en el front con npm run build