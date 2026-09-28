# Nebula Bar - App Móvil de Clientes (APK Nativa)

Aplicación nativa para comensales y clientes del bar basada en la experiencia de usuario y arquitectura de pedidos rápidos tipo **McDonald's y KFC** (pedidos en mesa, ofertas con temporizador, personalización de cócteles, barra flotante de carrito y monitor de comanda en vivo por WebSockets).

---

## 🚀 Arquitectura y Componentes Clave

1. **Header Contextual de Mesa (`HeaderContext.tsx`):**
   - Muestra el estado actual del servicio: `Mesa #X · Código 482` o `Retiro en Barra`.
   - Botón directo para conectar la mesa con el teclado de 3 dígitos o cámara QR.

2. **Beneficios & Cupones (`DealsCarousel.tsx`):**
   - Consume en vivo `GET /api/promotions/public?audience=app`.
   - Tarjetas de ofertas dinámicas con badges de alto contraste (`2×1`, `-20%`, `Happy Hour`).

3. **Selector de Categorías Sticky (`CategoryPills.tsx`):**
   - Navegación horizontal rápida entre *Todos*, *De Autor*, *Clásicos*, *Tapas*, *Cervezas*.

4. **Catálogo & Cards de Producto (`ProductCard.tsx`):**
   - Fotos en alta calidad (Cloudinary).
   - Precios dinámicos calculados por el servidor.
   - Botón de adición rápida `(+)` con vibración háptica (`expo-haptics`).

5. **Personalizador de Trago (`ModifierModal.tsx`):**
   - Bottom sheet para ajustar cantidad e ingresar notas de coctelería (ej: *"Sin hielo"*, *"Extra lima"*, *"Poco dulce"*).

6. **Barra Flotante de Carrito (`FloatingCartBar.tsx`):**
   - Siempre visible en la parte inferior cuando hay ítems, indicando cantidad y total.

7. **Checkout & Envío de Comanda (`CartScreen.tsx`):**
   - Desglose de cócteles y notas.
   - Selector rápido de propina opcional (0%, 10%, 15%, 20%).
   - Validación de sesión de mesa y envío seguro a `POST /api/orders`.

8. **Live Order Tracker (`OrderStatusScreen.tsx`):**
   - Seguimiento en tiempo real conectado a Socket.IO (`table:{tableId}`).
   - Barra de progreso con estados: `Recibido` ➔ `En Barra` ➔ `Servido`.
   - Notificación háptica cuando un trago está listo (`item:ready`).
   - Botón *"Ver cuenta de la mesa"* con saldo pendiente (`balanceDue`).

9. **Ruleta Nebula (`RouletteScreen.tsx`):**
   - Gamificación interactiva con feedback háptico en cada paso de giro.
   - Tirada pública vía `POST /api/roulette/public/spin` con detalle de receta ganada.

---

## 📱 Cómo Compilar el Archivo APK Instalable

Gracias al archivo de configuración `eas.json` ya preparado en el proyecto, la compilación de un archivo `.apk` autónomo (que se puede instalar directamente en cualquier teléfono Android) se realiza con un solo comando:

### Paso 1: Instalar EAS CLI (si no lo tienes)
```bash
npm install -g eas-cli
```

### Paso 2: Iniciar sesión en Expo
```bash
eas login
```

### Paso 3: Compilar el APK en la nube
```bash
eas build -p android --profile preview
```

> **¿Qué hace este comando?**
> EAS compilará el código en los servidores de Expo en modo `preview` (especificado en `eas.json` como `"buildType": "apk"`). Al finalizar, la terminal te entregará una **URL de descarga directa** del archivo `.apk` listo para instalar en cualquier móvil Android.

---

## 💻 Ejecución en Modo Desarrollo Local

Para probar la app en vivo en tu teléfono móvil usando la app **Expo Go**:

```bash
cd mobile-client
npm start
```

Escanea el código QR que aparecerá en tu terminal con la cámara de tu teléfono (iOS) o la app Expo Go (Android).
