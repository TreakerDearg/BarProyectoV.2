# NEBULA FOOD & BEVERAGE — DESIGN SYSTEM CLIENTE

## Propósito

Este documento define exclusivamente las reglas visuales y de experiencia que deben utilizarse para diseñar la aplicación cliente de Nebula Food & Beverage.

La aplicación es mobile-first y está orientada al consumidor final. Debe sentirse como una aplicación gastronómica real y moderna, tomando como referencia de usabilidad aplicaciones como McDonald's, KFC, Burger King y Starbucks, pero sin copiar su identidad visual.

> **Revisión NEBULA EMBER (v3, 2026-10-11)**: este documento se actualizó con la identidad vigente. La paleta activa es **NEBULA EMBER** (brasa cálida sobre noche) y la tipografía display es **Fraunces**. El detalle de tokens vive en `03-memoria-nebula-cliente.md` §28; los valores de código, en `src/theme/`.

---

## 1. Identidad visual

Nebula debe transmitir:

- Premium
- Nocturno
- Gastronómico
- Moderno
- Tecnológico de forma sutil
- Elegante
- Cálido
- Accesible
- Intuitivo

La tecnología no debe dominar la experiencia. El protagonista debe seguir siendo el restaurante, la comida, las bebidas y la experiencia del cliente.

### Evitar

- Apariencia de ERP
- Apariencia de POS
- Dashboard administrativo
- Estética empresarial
- Cyberpunk exagerado
- Gamer
- Exceso de neón
- Exceso de glassmorphism
- Negro absoluto como fondo general
- Interfaces recargadas
- Exceso de bordes y sombras

---

# 2. Paleta principal

## Background (escalera cálida NEBULA EMBER)

| Token | Hex | Uso |
|---|---|---|
| Background | `#131014` | Fondo principal |
| Surface Lowest | `#0C0A0D` | Fondo profundo |
| Surface Low | `#1A1619` | Pills resting, tab bar |
| Surface | `#201B1F` | Cards y contenedores |
| Surface Elevated | `#2A2328` | Cards destacadas, modales y bottom sheets |
| Surface Strong | `#352C31` | Inputs, controles y elementos seleccionados |

Nunca utilizar `#000000` como fondo general.

---

## 3. Ember de Nebula (primario) y oro reservado

El **ember** (brasa cálida) es el color principal de identidad y acción.

| Token | Hex | Uso |
|---|---|---|
| Ember | `#F08A5A` | Color principal, highlights, precios |
| Ember Container | `#D96A3B` | Fill de CTAs (bajo gradiente `emberCTA`) |
| Ember Deep | `#D2602A` | Extremo profundo del gradiente |

Usar el ember como acento, no como color dominante de toda la interfaz.

Debe aparecer especialmente en:

- CTA principales
- navegación activa
- precios destacados
- indicadores importantes
- estados seleccionados

**Oro reservado (no es color de acción):** `vipGold #F3BE59` / `vipGoldDark #D4A340`, solo para LEGENDARY de la ruleta, niveles de fidelidad VIP y sellos premium. El wine `#A03D52` es el secundario (EPIC de la ruleta) y nunca se usa como color de texto; sobre wine se escribe con `onSecondaryContainer #FFE3E8`.

---

# 4. Colores funcionales

| Token | Hex | Uso |
|---|---|---|
| Success | `#3FBF7F` | Confirmado, disponible, completado |
| Warning | `#E5A43D` | Pendiente, advertencia, disponibilidad limitada |
| Error | `#FF7A6E` | Error, cancelación, acción destructiva |
| Info | `#5AB8E8` | Información y estados informativos |

Los colores funcionales nunca deben depender únicamente del color. Siempre acompañarlos con iconografía o texto.

---

# 5. Tipografía

## Headings

**Fraunces**

Usar para:

- Títulos
- Nombres de categorías
- Promociones
- Precios importantes
- Branding
- Número de comanda (tracking)

## Body

**Inter**

Usar para:

- Descripciones
- Botones
- Navegación
- Información secundaria
- Estados
- Formularios

La combinación debe sentirse moderna, gastronómica y premium.

---

# 6. Jerarquía tipográfica

Definir visualmente una escala coherente.

- Display: promociones o títulos principales
- H1: títulos de pantalla
- H2: secciones
- H3: nombres de productos
- Body: información principal
- Body Small: información secundaria
- Caption: metadatos
- Label: controles y navegación

Evitar demasiados tamaños distintos.

---

# 7. Iconografía

Usar iconografía geométrica y minimalista.

Preferencia:

**Lucide Icons**

Características:

- Stroke consistente
- Geometría simple
- Buena legibilidad
- Tamaños coherentes
- Área táctil adecuada

No utilizar emojis como iconos de interfaz.

---

# 8. Navegación

La aplicación utilizará navegación inferior fija.

Secciones principales:

1. Inicio
2. Carta
3. Pedidos
4. Reservas
5. Cuenta

Estado activo:

- Icono ember
- Label ember
- Contraste alto

Estado inactivo:

- Icono neutral
- Label neutral

La navegación debe estar diseñada para uso con una mano.

---

# 9. Espaciado

Utilizar una escala consistente basada preferentemente en múltiplos de 4.

Valores frecuentes:

- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px

No crear espacios arbitrarios sin necesidad.

---

# 10. Bordes y radios

Utilizar radios moderados.

- Controles pequeños: 8px
- Cards: 12–16px
- Cards destacadas: 16–20px
- Bottom sheets/modales: 20–24px

Evitar tarjetas excesivamente redondeadas.

---

# 11. Cards

Las cards deben utilizar principalmente:

- Contraste entre superficies
- Espaciado
- Fotografía
- Tipografía
- Jerarquía

No depender de sombras fuertes.

Componentes principales:

- Product Card
- Promotion Card
- Reservation Card
- Order Card
- Table Status Card
- Profile Card

---

# 12. Fotografías

Las imágenes gastronómicas son fundamentales.

Preferir:

- Cocktails
- Comida
- Cervezas
- Postres
- Mesas
- Ambiente nocturno

Características:

- Iluminación cálida
- Fondos oscuros
- Alto contraste
- Fotografía profesional
- Composición premium

Las fotografías deben reforzar la identidad y no parecer stock genérico.

---

# 13. Componentes principales

Diseñar un sistema consistente para:

- Buttons
- Inputs
- Search
- Tabs
- Chips
- Badges
- Product Cards
- Promotion Cards
- Reservation Cards
- Order Cards
- Table Status
- Bottom Navigation
- Modal
- Bottom Sheet
- Toast
- Skeleton
- Empty State
- Error State
- Success State

---

# 14. Botones

### Primary

Gradiente ember (`#F08A5A` → `#D2602A`), texto oscuro de alto contraste.

### Secondary

Superficie elevada con texto claro.

### Ghost

Sin fondo dominante, utilizado para acciones secundarias.

### Danger

Usar rojo únicamente para acciones destructivas.

Los botones importantes deben tener un área táctil cómoda.

---

# 15. UX móvil

Prioridades:

1. Usabilidad
2. Claridad
3. Navegación
4. Gastronomía
5. Identidad
6. Accesibilidad
7. Microinteracciones
8. Decoración

Diseñar para:

- Pulgar
- Una mano
- Scroll vertical
- Scroll horizontal en categorías
- Bottom sheets
- CTA sticky cuando corresponda

---

# 16. Estados

Todos los módulos deben contemplar:

- Loading
- Skeleton
- Empty
- Error
- Success
- Disabled
- Selected
- Active
- Unavailable
- Processing
- Completed

No diseñar únicamente el estado ideal.

---

# 17. Microinteracciones

Las animaciones deben ser:

- Cortas
- Naturales
- Funcionales
- Sutiles

Ejemplos:

- Agregar producto
- Actualizar carrito
- Confirmar reserva
- Cambio de estado del pedido
- Seleccionar categoría

Evitar animaciones decorativas que ralenticen la experiencia.

---

# 18. Regla principal

Todas las pantallas deben parecer parte del mismo producto.

Home → Carta → Producto → Carrito → Pedido → Reserva → Cuenta

deben compartir:

- Color
- Tipografía
- Espaciado
- Iconografía
- Componentes
- Radios
- Jerarquía
- Lenguaje visual

El resultado debe sentirse como una aplicación comercial real lista para evolucionar hacia Android/iOS.
