# NEBULA FOOD & BEVERAGE — CONTEXTO GENERAL DEL SISTEMA CLIENTE

## 1. Propósito

Nebula Food & Beverage es un sistema gastronómico integral compuesto por diferentes aplicaciones y módulos.

Este documento define el contexto general de la **aplicación cliente**, cuya función es ofrecer al consumidor una experiencia digital completa para interactuar con el restaurante/bar.

La aplicación cliente NO es un sistema administrativo.

Su objetivo es permitir que el cliente:

- Explore la carta
- Consulte promociones
- Realice pedidos
- Consulte el estado de sus pedidos
- Reserve mesas
- Consulte el estado de su mesa
- Gestione su cuenta
- Consulte su historial
- Administre su perfil

---

# 2. Concepto

La aplicación debe sentirse como una app móvil gastronómica de uso cotidiano.

La referencia funcional son aplicaciones como:

- McDonald's
- KFC
- Burger King
- Starbucks
- Aplicaciones modernas de restaurantes y delivery

Estas referencias se utilizan solamente para patrones de UX:

- Navegación inferior
- Categorías
- Promociones
- Carrito
- Pedidos
- Cuenta
- Tracking
- Experiencia táctil

Nebula debe conservar una identidad propia.

---

# 3. Modelo de experiencia

La experiencia principal debe ser:

ABRIR APP
↓
VER ESTADO PERSONAL
↓
EXPLORAR PROMOCIONES
↓
EXPLORAR CARTA
↓
SELECCIONAR PRODUCTO
↓
AGREGAR AL PEDIDO
↓
CONFIRMAR
↓
SEGUIR PEDIDO

La aplicación también debe permitir:

RESERVAR MESA
↓
CONSULTAR RESERVA
↓
LLEGAR AL RESTAURANTE
↓
CONSULTAR ESTADO DE MESA
↓
REALIZAR PEDIDOS

---

# 4. Módulos principales

## Home

Es el centro de la aplicación.

Debe mostrar contenido relevante según el estado del usuario:

- Saludo
- Estado de mesa
- Reserva activa
- Promoción destacada
- Categorías
- Productos destacados
- Promociones
- Pedido activo

La Home debe ser dinámica.

No mostrar información innecesaria.

---

## Carta

La carta es uno de los módulos principales.

Debe permitir:

- Ver categorías
- Buscar productos
- Filtrar
- Ver productos
- Ver detalle
- Agregar productos

Categorías posibles:

- Cocktails
- Cervezas
- Vinos
- Comida
- Entradas
- Postres
- Sin alcohol
- Combos

Las categorías reales dependerán de los datos del backend.

---

## Producto

Cada producto puede contener:

- Imagen
- Nombre
- Descripción
- Precio
- Ingredientes
- Opciones
- Cantidad
- Notas
- Disponibilidad

Debe existir una acción clara:

**Agregar al pedido**

---

# 5. Carrito

El carrito debe ser una experiencia móvil.

Debe permitir:

- Ver productos
- Cambiar cantidades
- Eliminar
- Agregar notas
- Aplicar promociones cuando corresponda
- Ver subtotal
- Ver total
- Continuar pedido

Puede implementarse visualmente como:

- Bottom sheet
- Pantalla completa

dependiendo del contexto.

---

# 6. Pedidos

El sistema de pedidos debe permitir conocer el estado de una orden.

Estados visuales posibles:

1. Pedido recibido
2. Confirmado
3. En preparación
4. Listo
5. Entregado
6. Cancelado

El seguimiento debe utilizar una timeline clara.

Ejemplo:

✓ Pedido recibido

✓ Confirmado

● En preparación

○ Listo

○ Entregado

La información debe ser comprensible para un cliente, no para un empleado.

---

# 7. Reservas

El cliente debe poder:

- Elegir fecha
- Elegir hora
- Elegir cantidad de personas
- Consultar disponibilidad
- Seleccionar mesa/zona cuando corresponda
- Confirmar reserva
- Consultar reserva
- Cancelar cuando esté permitido

La reserva activa debe aparecer claramente en la aplicación.

---

# 8. Sistema de mesas

El cliente necesita conocer si tiene una mesa asociada.

Estados:

- Sin mesa
- Mesa disponible
- Mesa reservada
- Mesa asignada
- Mesa ocupada
- Mesa en mantenimiento

El estado debe expresarse de forma simple.

Ejemplo:

**Mesa 12**

Tu mesa está activa.

La información de mesa debe tener presencia en la parte superior de la experiencia cuando sea relevante.

---

# 9. Promociones

Las promociones deben ser una parte importante de la experiencia.

Tipos posibles:

- 2x1
- Combos
- Descuentos
- Promociones temporales
- Beneficios
- Promociones por día
- Promociones de determinados productos

Cada promoción debe poder mostrar:

- Imagen
- Título
- Descripción
- Validez
- Condiciones relevantes
- CTA

---

# 10. Cuenta

La sección Cuenta concentra la información personal.

Debe incluir:

- Perfil
- Pedidos
- Reservas
- Favoritos
- Promociones/beneficios
- Métodos de pago si el sistema los incorpora
- Notificaciones
- Configuración
- Ayuda
- Cerrar sesión

---

# 11. Perfil

Datos potenciales:

- Nombre
- Email
- Teléfono
- Avatar
- Preferencias

El usuario debe poder editar la información permitida.

---

# 12. Historial

## Pedidos

Mostrar:

- Número
- Fecha
- Productos
- Total
- Estado
- Acceso al detalle

## Reservas

Mostrar:

- Fecha
- Hora
- Mesa/zona
- Personas
- Estado
- Acciones disponibles

---

# 13. Navegación

La aplicación utiliza navegación inferior.

Secciones:

- Inicio
- Carta
- Pedidos
- Reservas
- Cuenta

Debe ser persistente en las principales pantallas de navegación.

No convertir la aplicación en un dashboard con sidebar.

---

# 14. Usuario autenticado

Cuando existe sesión:

La Home puede personalizarse con:

- Nombre
- Reserva activa
- Mesa activa
- Pedido activo
- Historial
- Preferencias

Cuando no existe sesión:

Mostrar contenido público y acciones que conduzcan al login cuando sean necesarias.

---

# 15. Estados importantes

El diseño debe contemplar:

### Usuario sin reserva

Mostrar acceso claro a reservar.

### Usuario con reserva

Mostrar reserva activa.

### Usuario con mesa

Mostrar estado de mesa.

### Usuario con pedido

Mostrar seguimiento.

### Usuario sin pedidos

Mostrar Empty State con acceso a carta.

### Usuario sin reservas

Mostrar Empty State con acceso a reservas.

---

# 16. Relación con otros sistemas

La aplicación cliente forma parte de un ecosistema mayor de Nebula.

Existen sistemas internos para el personal, incluyendo el entorno Bartender Desktop.

La aplicación cliente debe comunicarse con los servicios del backend para:

- Autenticación
- Productos
- Categorías
- Promociones
- Pedidos
- Reservas
- Mesas
- Cuenta del usuario

La aplicación cliente no debe replicar interfaces administrativas.

---

# 17. Principio de arquitectura de experiencia

Cada módulo debe sentirse como una pieza del mismo sistema.

No crear pantallas aisladas.

Las acciones deben conectarse:

Carta
→ Producto
→ Carrito
→ Pedido
→ Seguimiento

Reservas
→ Reserva activa
→ Mesa

Cuenta
→ Pedidos
→ Reservas
→ Perfil

Home
→ Acceso rápido a todos los estados importantes.

---

# 18. Datos reales

La interfaz final debe diseñarse pensando en datos reales.

Evitar depender permanentemente de:

- Datos hardcodeados
- Productos falsos
- Pedidos simulados
- Reservas simuladas
- Estados inventados

Los mockups pueden utilizar contenido de ejemplo exclusivamente para representar visualmente la interfaz, pero la arquitectura conceptual debe asumir que la información proviene del sistema real.

---

# 19. Mobile-first

El diseño debe priorizar smartphone.

Resoluciones de referencia:

- 360 × 800
- 390 × 844
- 393 × 852

La interfaz debe adaptarse posteriormente a otras resoluciones sin perder la experiencia móvil.

---

# 20. Objetivo final

Construir una aplicación cliente que se sienta como:

> Una aplicación gastronómica moderna de Nebula donde el cliente puede descubrir, reservar, pedir y seguir su experiencia dentro del restaurante desde un solo lugar.

La aplicación debe ser:

- Clara
- Rápida
- Visual
- Gastronómica
- Premium
- Fácil de aprender
- Cómoda para usar con una mano
- Coherente en todas sus pantallas
