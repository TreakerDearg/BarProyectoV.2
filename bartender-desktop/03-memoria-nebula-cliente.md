# NEBULA FOOD & BEVERAGE — MEMORIA DEL PROYECTO CLIENTE

## Propósito del archivo

Este archivo funciona como memoria de diseño y producto.

Debe mantenerse actualizado durante la evolución de la aplicación cliente.

Su objetivo es evitar que futuras iteraciones pierdan decisiones importantes ya tomadas.

---

# 1. IDENTIDAD

Nombre:

**Nebula Food & Beverage**

Producto:

**Aplicación Cliente Nebula**

Tipo:

Aplicación móvil gastronómica orientada al consumidor.

Concepto:

Restaurante/bar moderno con una experiencia digital integrada.

---

# 2. DIRECCIÓN VISUAL ACTUAL

La aplicación utiliza una estética:

- Dark
- Premium
- Gastronómica
- Nocturna
- Moderna
- Tecnológica de manera sutil

La identidad utiliza principalmente:

- Fondos oscuros
- Superficies escalonadas
- Dorado como color de marca
- Fotografía gastronómica
- Tipografía Outfit + Inter
- Iconografía geométrica

---

# 3. PALETA ACTUAL

Background:

`#08090C`

Secondary:

`#0D0F14`

Surface:

`#12151C`

Elevated:

`#171B24`

Strong:

`#1E232E`

Gold:

`#D4A340`

Gold Highlight:

`#E8BC5A`

Gold Dark:

`#A87C28`

Success:

`#34B964`

Warning:

`#E07828`

Error:

`#C83228`

Text:

`#F5F0E8`

Secondary Text:

`#B8B5AE`

Muted:

`#777872`

---

# 4. TIPOGRAFÍA

Headings:

**Outfit**

Body:

**Inter**

No cambiar la tipografía sin una decisión explícita de rediseño.

---

# 5. NAVEGACIÓN

La navegación principal está definida como:

1. Inicio
2. Carta
3. Pedidos
4. Reservas
5. Cuenta

Se utiliza navegación inferior mobile-first.

No reemplazar por sidebar.

---

# 6. MÓDULOS

La aplicación contempla:

- Home
- Carta
- Producto
- Carrito
- Pedidos
- Reservas
- Estado de mesa
- Promociones
- Cuenta
- Perfil
- Historial
- Configuración
- Notificaciones
- Estados vacíos
- Estados de error
- Loading/Skeleton

---

# 7. FUNCIONALIDADES CLAVE

## Carta

Permite descubrir y seleccionar productos.

## Pedidos

Permite realizar y seguir pedidos.

## Reservas

Permite buscar disponibilidad y reservar.

## Mesa

Permite conocer el estado de la mesa asociada.

## Promociones

Permite descubrir beneficios y ofertas del restaurante.

## Cuenta

Permite gestionar identidad e historial.

---

# 8. REFERENCIAS DE UX

Las referencias de experiencia son aplicaciones gastronómicas como:

- McDonald's
- KFC
- Burger King
- Starbucks

Estas referencias sirven únicamente para estudiar:

- patrones de navegación
- organización de contenido
- promociones
- pedidos
- carrito
- cuenta
- interacción móvil

No copiar sus diseños.

Nebula debe mantener una identidad propia.

---

# 9. PRINCIPIOS QUE NO DEBEN ROMPERSE

### Mobile-first

El teléfono es el dispositivo principal.

### Cliente primero

La aplicación debe hablarle al consumidor, no al empleado.

### Claridad

Una acción debe ser comprensible sin explicación adicional.

### Gastronomía

La comida, bebida y experiencia del restaurante deben ser protagonistas.

### Premium

El sistema debe verse cuidado sin convertirse en una interfaz inaccesible.

### Tecnología sutil

La tecnología debe mejorar la experiencia, no dominarla.

### Consistencia

Una pantalla nueva debe reutilizar los patrones visuales existentes.

---

# 10. COSAS QUE NO QUEREMOS

No convertir la aplicación en:

- Dashboard
- POS
- ERP
- Panel administrativo
- Sistema empresarial
- App gamer
- App cyberpunk
- Interfaz excesivamente futurista
- Interfaz llena de neón
- Interfaz excesivamente roja
- Interfaz basada en emojis
- Interfaz sobrecargada

---

# 11. COMPONENTES REUTILIZABLES

Mantener un lenguaje visual consistente para:

- Buttons
- Inputs
- Cards
- Product Cards
- Promotion Cards
- Reservation Cards
- Order Cards
- Table Status
- Tabs
- Chips
- Badges
- Bottom Navigation
- Bottom Sheets
- Modals
- Toasts
- Skeletons
- Empty States
- Error States

Antes de crear un componente nuevo, comprobar si puede reutilizarse o extenderse uno existente.

---

# 12. REGLAS PARA NUEVAS PANTALLAS

Cuando se diseñe una nueva pantalla:

1. Definir su propósito.
2. Determinar si pertenece a un módulo existente.
3. Reutilizar componentes.
4. Mantener la paleta.
5. Mantener la tipografía.
6. Mantener la navegación.
7. Mantener la jerarquía.
8. Diseñar primero para móvil.
9. Contemplar estados Loading/Empty/Error/Success.
10. Evitar agregar elementos decorativos sin función.

---

# 13. ESTADOS DINÁMICOS

La interfaz debe considerar que el usuario puede encontrarse en diferentes situaciones.

Ejemplos:

- Sin sesión
- Sesión iniciada
- Sin mesa
- Mesa asignada
- Reserva activa
- Sin reserva
- Pedido activo
- Sin pedido
- Pedido en preparación
- Pedido listo
- Pedido entregado
- Promoción disponible
- Sin promociones

La Home debe cambiar según el contexto del usuario.

---

# 14. ESTADO ACTUAL DEL DISEÑO

El diseño conceptual se encuentra en fase de definición visual.

Prioridad actual:

1. Identidad visual
2. Sistema de colores
3. Tipografía
4. Navegación
5. Arquitectura de pantallas
6. Componentes
7. Estados
8. Microinteracciones
9. Implementación

No saltar directamente a implementación sin consolidar primero el sistema visual.

---

# 15. DECISIONES PENDIENTES

Registrar aquí cualquier decisión futura antes de modificar elementos centrales.

Ejemplos:

- Cambios de paleta
- Cambio de tipografía
- Nuevas secciones
- Cambios de navegación
- Nuevas reglas de tarjetas
- Nuevos estados
- Nuevos módulos

Formato recomendado:

## [FECHA] — [DECISIÓN]

### Cambio

Descripción.

### Motivo

Por qué se realizó.

### Impacto

Qué partes del sistema afecta.

---

# 16. REGLA DE ACTUALIZACIÓN

Este archivo no debe convertirse en una lista de ideas aleatorias.

Solo almacenar decisiones que realmente formen parte del sistema.

Cuando una decisión sea reemplazada:

- No borrar silenciosamente la decisión anterior.
- Registrar el cambio.
- Indicar qué decisión la reemplaza.
- Mantener una memoria clara del estado actual.

---

# 17. OBJETIVO FINAL

La aplicación debe evolucionar como un producto real.

Cada nueva funcionalidad debe integrarse con lo existente.

La pregunta principal antes de diseñar cualquier cosa nueva debe ser:

> ¿Esto parece una nueva pieza de Nebula o parece una aplicación diferente?

Si parece una aplicación diferente, debe rediseñarse hasta integrarse con el sistema visual existente.
