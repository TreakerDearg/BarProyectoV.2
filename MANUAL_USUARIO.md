# Manual de Usuario - Bartender Desktop

## 1. Introducción

### 1.1 Propósito del Sistema

Bartender Desktop es un sistema de gestión integral para establecimientos de hostelería como bares, restaurantes y locales nocturnos. El sistema permite controlar todas las operaciones diarias desde una única plataforma, optimizando el servicio al cliente y la administración del negocio.

El sistema centraliza la gestión de pedidos, mesas, reservaciones, inventario, empleados y reportes, proporcionando una visión completa del funcionamiento del establecimiento en tiempo real.

### 1.2 Características Principales

El sistema permite:

- **Gestión de pedidos**: Crear, modificar y cerrar órdenes de manera rápida y eficiente.
- **Control de mesas**: Visualizar el estado de cada mesa y asignar clientes.
- **Reservaciones**: Administrar las reservas de clientes con anticipación.
- **Inventario**: Controlar el stock de productos y recibir alertas de bajo stock.
- **Descuentos y promociones**: Aplicar descuentos dinámicos y gestionar promociones especiales.
- **Reportes**: Obtener análisis detallados de ventas, rendimiento y actividad.
- **Gestión de empleados**: Administrar el personal, roles, turnos y permisos.
- **Recetas**: Gestionar las recetas de bebidas y platos del menú.

### 1.3 Roles de Usuario

El sistema cuenta con diferentes roles que determinan el acceso a las funcionalidades:

- **Administrador**: Acceso completo a todas las funcionalidades del sistema.
- **Bartender**: Gestión de pedidos, mesas, reservaciones, descuentos y ruleta.
- **Mesero**: Gestión de pedidos, mesas, reservaciones y descuentos básicos.
- **Cajero**: Gestión de pedidos, mesas, reservaciones y descuentos avanzados.
- **Cocina**: Acceso a pedidos, inventario y recetas.

Cada rol tiene permisos específicos que limitan o permiten el acceso a determinadas secciones del sistema, garantizando la seguridad y el orden en las operaciones.

### 1.4 Requisitos de Uso

Para utilizar el sistema se requiere:

- Un dispositivo con conexión a internet.
- Credenciales de acceso proporcionadas por el administrador.
- Navegador web compatible (Chrome, Firefox, Edge, Safari).
- Conexión estable para garantizar la sincronización de datos en tiempo real.

---

## 2. Inicio de Sesión

### 2.1 Pantalla de Acceso

La pantalla de inicio de sesión es el punto de entrada al sistema. En esta pantalla se deben ingresar las credenciales para acceder a las funcionalidades correspondientes al rol del usuario.

### 2.2 Proceso de Inicio de Sesión

Para iniciar sesión en el sistema:

1. **Ingrese el correo electrónico**: En el campo "Correo electrónico", escriba la dirección de correo asociada a su cuenta de usuario.
2. **Ingrese la contraseña**: En el campo "Contraseña", escriba su contraseña personal.
3. **Mostrar contraseña**: Si desea verificar lo que está escribiendo, puede hacer clic en el icono del ojo para mostrar u ocultar la contraseña.
4. **Iniciar sesión**: Presione el botón "Iniciar Sesión".

El sistema validará las credenciales ingresadas. Si son correctas, será redirigido automáticamente al panel principal. Si las credenciales son incorrectas, aparecerá un mensaje de error indicando el problema.

### 2.3 Mensajes de Error

Durante el proceso de inicio de sesión pueden aparecer los siguientes mensajes:

- **"Completa todos los campos"**: Indica que no ha ingresado el correo electrónico o la contraseña. Debe completar ambos campos antes de continuar.
- **"Credenciales incorrectas"**: El correo electrónico o la contraseña no coinciden con los registros del sistema. Verifique que haya escrito correctamente sus credenciales.
- **"Conectando..."**: El sistema está procesando la solicitud de inicio de sesión. Espere unos segundos.

### 2.4 Recuperación de Credenciales

Si ha olvidado su contraseña o no recuerda sus credenciales, debe comunicarse con el administrador del sistema. El sistema no incluye una función de recuperación automática de contraseñas por motivos de seguridad.

### 2.5 Sesión Activa

Una vez iniciada la sesión, el sistema mantendrá al usuario conectado mientras no cierre la sesión explícitamente o no expire el tiempo de inactividad. Si cierra el navegador y vuelve a abrirlo, el sistema intentará restaurar la sesión automáticamente si las credenciales siguen siendo válidas.

### 2.6 Cierre de Sesión

Para cerrar la sesión de manera segura:

1. Ubique el menú lateral en la parte izquierda de la pantalla.
2. Desplácese hasta la parte inferior del menú.
3. Presione el botón "LOGOUT".

Al cerrar la sesión, será redirigido a la pantalla de inicio de sesión y sus credenciales serán eliminadas del dispositivo. Esto es importante especialmente si está utilizando un dispositivo compartido.

---

## 3. Pantalla Principal (Dashboard)

### 3.1 Descripción General

El Panel Nebula es la pantalla principal del sistema después de iniciar sesión. Esta pantalla proporciona una visión general de todas las operaciones del establecimiento en tiempo real, permitiendo monitorear el estado actual y tomar decisiones informadas.

### 3.2 Elementos de la Pantalla

#### 3.2.1 Cabecera

En la parte superior de la pantalla se encuentra la cabecera con:

- **Título del sistema**: "Panel Nebula" con un indicador de versión.
- **Subtítulo**: "Operación del local · Nebula v3" que indica el contexto actual.
- **Botón Tutorial**: Un botón con icono de ayuda que permite acceder a un tutorial interactivo del panel.
- **Selector de modo**: Permite cambiar entre modo "Simple" y "Avanzado" para ajustar el nivel de detalle de la información mostrada.
- **Pestañas de navegación**: Cuatro pestañas principales que permiten cambiar entre diferentes vistas:
  - **Operación**: Vista de las operaciones en curso.
  - **Análisis**: Vista de métricas y comparativas.
  - **Ventas**: Vista de ventas y descuentos.
  - **Inventario**: Vista del estado del inventario.

#### 3.2.2 Indicadores de Sincronización

En la parte inferior derecha de la pantalla se encuentra un indicador que muestra:

- **Estado de conexión**: Un punto verde pulsante indica que el sistema está conectado al servidor Nebula. Si aparece un icono de desconexión, significa que el sistema está intentando reconectarse.
- **Hora de última actualización**: Muestra la hora a la que se actualizaron los datos por última vez.

#### 3.2.3 Vista de Operación

La pestaña "Operación" muestra:

- **Estado actual de mesas**: Indica cuántas mesas están ocupadas, disponibles o en proceso.
- **Pedidos en curso**: Muestra el número de pedidos que están siendo preparados o servidos.
- **Actividad reciente**: Lista de las últimas reservaciones y actividades del sistema.
- **Alertas**: Mensajes importantes sobre el estado del sistema o situaciones que requieren atención.

#### 3.2.4 Vista de Análisis

La pestaña "Análisis" proporciona:

- **Comparativas de períodos**: Comparación de ventas y métricas entre diferentes rangos de tiempo.
- **Gráficos de rendimiento**: Visualización gráfica del desempeño del establecimiento.
- **Selector de rango**: Permite seleccionar el período de tiempo a analizar (7 días, 30 días, etc.).
- **Reporte analítico**: Un botón que genera un resumen detallado de las métricas principales.

#### 3.2.5 Vista de Ventas

La pestaña "Ventas" muestra:

- **Ventas totales**: El monto total de ventas en el período seleccionado.
- **Número de órdenes**: Cantidad de pedidos realizados.
- **Ticket promedio**: El valor promedio de cada pedido.
- **Descuentos aplicados**: Monto total de descuentos otorgados.
- **Gráficos de tendencias**: Visualización de las tendencias de ventas a lo largo del tiempo.

#### 3.2.6 Vista de Inventario

La pestaña "Inventario" presenta:

- **Productos con bajo stock**: Alerta de productos que necesitan reabastecimiento.
- **Valor del inventario**: Estimación del valor total del inventario actual.
- **Movimientos recientes**: Registro de las últimas entradas y salidas de inventario.
- **Estado general**: Indicador del estado general del inventario.

### 3.3 Modos de Visualización

El panel cuenta con dos modos de visualización:

#### 3.3.1 Modo Simple

Muestra la información esencial de manera clara y concisa. Ideal para usuarios que necesitan una visión rápida del estado del sistema sin detalles complejos.

#### 3.3.2 Modo Avanzado

Proporciona información detallada con métricas adicionales, gráficos más completos y opciones de análisis profundo. Recomendado para administradores y usuarios que necesitan tomar decisiones basadas en datos detallados.

### 3.4 Tutorial Interactivo

El panel incluye un tutorial interactivo que guía al usuario a través de las principales funcionalidades. Para acceder al tutorial:

1. Presione el botón "Tutorial" en la cabecera del panel.
2. Siga las instrucciones paso a paso que aparecerán en pantalla.
3. El tutorial resaltará los elementos importantes y explicará su función.
4. Puede cerrar el tutorial en cualquier momento presionando el botón de cerrar.
5. Si completa el tutorial, el sistema recordará que ya lo ha realizado.

### 3.5 Actualización de Datos

El panel se actualiza automáticamente en tiempo real mediante una conexión con el servidor Nebula. No es necesario recargar la página manualmente. Si la conexión se pierde temporalmente, el sistema intentará reconectarse automáticamente y mostrará un indicador de "Reconectando..." hasta restablecer la conexión.

### 3.6 Alertas y Notificaciones

El panel puede mostrar alertas importantes en la parte superior. Estas alertas pueden incluir:

- Alertas de descuentos activos.
- Advertencias de bajo stock.
- Notificaciones de eventos especiales.
- Mensajes del sistema.

Las alertas desaparecerán automáticamente después de un tiempo o pueden cerrarse manualmente presionando el botón de cerrar.

---

## 4. Navegación

### 4.1 Menú Lateral

El menú lateral, ubicado en la parte izquierda de la pantalla, es la principal herramienta de navegación del sistema. Permite acceder a todos los módulos disponibles según el rol del usuario.

#### 4.1.1 Estructura del Menú

El menú está organizado en cuatro secciones principales:

**General**
- Dashboard: Panel principal del sistema.

**Operación**
- Pedidos: Gestión de órdenes y comandas.
- Mesas: Control del estado de las mesas.
- Reservas: Administración de reservaciones.
- Descuentos: Aplicación de descuentos y promociones.

**Gestión**
- Productos: Catálogo de productos del establecimiento.
- Menús: Gestión de menús y categorías.
- Inventario: Control de stock y movimientos.
- Recetas: Gestión de recetas de bebidas y platos.

**Sistema**
- Empleados: Administración del personal.
- Ruleta: Funcionalidad especial de sorteos.
- Configuración: Ajustes del sistema.

#### 4.1.2 Uso del Menú

Para navegar a un módulo:

1. Ubique la sección deseada en el menú lateral.
2. Haga clic en el nombre del módulo.
3. El sistema cargará la pantalla correspondiente en el área principal.

El módulo activo se resalta con un borde izquierdo de color cyan y el texto cambia a color cyan para indicar su selección.

#### 4.1.3 Colapso del Menú

El menú lateral puede colapsarse para ganar espacio en pantalla:

- Presione el botón con la flecha en la parte superior del menú.
- El menú se reducirá mostrando solo los iconos.
- Al pasar el cursor sobre un icono colapsado, aparecerá una etiqueta con el nombre del módulo.
- Presione nuevamente el botón de la flecha para expandir el menú.

#### 4.1.4 Permisos de Acceso

Según el rol del usuario, algunos módulos pueden no aparecer en el menú. Esto es normal y se debe a los permisos asignados. Si necesita acceso a un módulo que no ve, comuníquese con el administrador.

### 4.2 Cabecera Superior

La cabecera superior proporciona información adicional sobre el estado del sistema y el usuario actual.

#### 4.2.1 Información de Ruta

En la parte izquierda de la cabecera se muestra:

- **Nombre del módulo actual**: Indica en qué sección del sistema se encuentra.
- **Subtítulo del sistema**: "OBSIDIAN_CONTROL_CENTER" como identificador del sistema.

#### 4.2.2 Estado del Sistema

En la parte derecha de la cabecera se encuentra un indicador que muestra:

- **Punto verde pulsante**: Indica que el sistema está activo y funcionando correctamente.
- **Texto "SYSTEM_ACTIVE"**: Confirma que el sistema está en línea.

#### 4.2.3 Información del Usuario

También en la parte derecha de la cabecera se muestra:

- **Inicial del nombre**: Un cuadrado con la primera letra del nombre del usuario.
- **Nombre completo**: El nombre del usuario registrado.
- **Rol**: El rol asignado al usuario (Administrador, Bartender, etc.).

### 4.3 Pestañas de Módulos

Algunos módulos cuentan con pestañas internas para organizar sus funcionalidades. Estas pestañas aparecen debajo de la cabecera superior y permiten navegar entre diferentes subsecciones del mismo módulo.

Por ejemplo, el módulo de Empleados puede tener pestañas para:
- Lista de empleados
- Gestión de roles
- Permisos
- Turnos

Para usar las pestañas:

1. Identifique las pestañas debajo de la cabecera.
2. Haga clic en la pestaña deseada.
3. El contenido del área principal cambiará para mostrar la subsección seleccionada.

La pestaña activa se resalta con un borde violeta y un efecto de brillo.

### 4.4 Navegación por Breadcrumbs

Al navegar profundamente en el sistema, puede aparecer una ruta de navegación (breadcrumbs) en la parte superior del contenido. Esta ruta muestra el camino desde el módulo principal hasta la pantalla actual, permitiendo regresar a niveles anteriores haciendo clic en los elementos de la ruta.

### 4.5 Botón de Cierre de Sesión

En la parte inferior del menú lateral se encuentra el botón "LOGOUT" con un icono de salida. Este botón permite cerrar la sesión de manera segura y regresar a la pantalla de inicio de sesión.

Presione este botón cuando termine su trabajo o si va a dejar el dispositivo desatendido.

### 4.6 Atajos de Teclado

El sistema no incluye atajos de teclado específicos. Toda la navegación se realiza mediante el uso del ratón o dispositivo táctil.

### 4.7 Responsividad

El sistema se adapta automáticamente al tamaño de la pantalla. En pantallas más pequeñas, el menú lateral puede colapsarse automáticamente y el contenido se reorganiza para mantener la usabilidad.

---

## 5. Módulo de Pedidos

### 5.1 Objetivo

El módulo de Pedidos permite gestionar todas las órdenes del establecimiento, desde su creación hasta el cierre y cobro. Es el corazón operativo del sistema donde se registran todas las ventas.

### 5.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Un cliente realice un pedido.
- Necesite agregar o modificar items en una orden existente.
- Deba aplicar descuentos a una orden.
- Requiera cerrar y cobrar una orden.
- Necesite ver el historial de pedidos.

### 5.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Operación".
2. Haga clic en "Pedidos".

### 5.4 Elementos de la Pantalla

#### 5.4.1 Lista de Mesas

En la parte izquierda de la pantalla se muestra una lista o grilla de mesas con su estado actual:

- **Disponible**: La mesa está libre y puede asignarse.
- **Ocupada**: La mesa tiene clientes activos.
- **En proceso**: La mesa tiene pedidos en preparación.
- **Reservada**: La mesa está reservada para un horario específico.

Cada tarjeta de mesa muestra:
- Número de mesa
- Estado actual (con código de color)
- Número de clientes
- Monto acumulado (si hay pedidos activos)

#### 5.4.2 Panel de Orden

En el área central se muestra el detalle de la orden seleccionada:

- **Información de la mesa**: Número y estado.
- **Lista de items**: Productos agregados a la orden con cantidad y precio.
- **Subtotal**: Suma de los items antes de descuentos.
- **Descuentos aplicados**: Monto de descuentos si los hay.
- **Total**: Monto final a pagar.

#### 5.4.3 Selector de Productos

En la parte derecha o inferior se encuentra el catálogo de productos organizado por categorías:

- **Categorías**: Bebidas, Comidas, Postres, etc.
- **Productos**: Lista de productos disponibles con precio e imagen.
- **Buscador**: Campo para buscar productos por nombre.

#### 5.4.4 Botones de Acción

En la parte inferior del panel de orden se encuentran botones para:

- **Agregar item**: Agregar el producto seleccionado a la orden.
- **Modificar item**: Cambiar cantidad o eliminar un item.
- **Aplicar descuento**: Aplicar un descuento a la orden o item específico.
- **Imprimir comanda**: Enviar la orden a cocina/bar.
- **Cerrar orden**: Finalizar y cobrar la orden.

### 5.5 Flujo Completo de Uso

#### 5.5.1 Crear una Nueva Orden

1. **Seleccione una mesa**: En la lista de mesas, haga clic en una mesa disponible.
2. **Agregue productos**: Busque el producto deseado en el catálogo y haga clic en él.
3. **Defina la cantidad**: Se abrirá un modal para especificar la cantidad deseada.
4. **Confirme**: Presione "Agregar" para incluir el producto en la orden.
5. **Repita**: Agregue todos los productos necesarios.
6. **Envíe a cocina**: Presione "Imprimir comanda" para enviar el pedido a preparación.

#### 5.5.2 Modificar una Orden Existente

1. **Seleccione la mesa**: Haga clic en la mesa con la orden activa.
2. **Seleccione el item**: En la lista de items, haga clic en el producto que desea modificar.
3. **Cambie cantidad**: Modifique la cantidad en el modal que aparece.
4. **Elimine si es necesario**: Si desea eliminar el item, presione "Eliminar".
5. **Confirme**: Los cambios se aplicarán automáticamente al total.

#### 5.5.3 Aplicar Descuentos

1. **Seleccione la orden**: Abra la orden a la que desea aplicar el descuento.
2. **Presione "Descuento"**: Haga clic en el botón de descuento.
3. **Seleccione tipo**: Elija entre descuento por porcentaje o monto fijo.
4. **Ingrese valor**: Especifique el porcentaje o monto del descuento.
5. **Confirme**: El descuento se aplicará y el total se recalculará.

#### 5.5.4 Cerrar y Cobrar una Orden

1. **Verifique la orden**: Revise que todos los items sean correctos.
2. **Presione "Cerrar orden"**: Haga clic en el botón de cierre.
3. **Seleccione método de pago**: Elija entre efectivo, tarjeta u otros métodos.
4. **Ingrese monto recibido**: Si es efectivo, ingrese el monto recibido.
5. **Confirme**: El sistema calculará el cambio y generará el recibo.
6. **Libere la mesa**: La mesa volverá a estado disponible automáticamente.

### 5.6 Resultado Esperado

Al completar el proceso:

- La orden quedará registrada en el sistema.
- El stock de los productos se actualizará automáticamente.
- La mesa quedará disponible para nuevos clientes.
- El recibo se generará para impresión o envío digital.
- Las ventas del día se actualizarán en el dashboard.

### 5.7 Posibles Errores del Usuario

- **Mesa no disponible**: Si intenta abrir una mesa que ya está ocupada, el sistema le avisará. Seleccione otra mesa o libere la ocupada primero.
- **Producto sin stock**: Si un producto no tiene stock disponible, no aparecerá en el catálogo o mostrará un aviso. Comunique al administrador para reabastecer.
- **Descuento no permitido**: Si intenta aplicar un descuento mayor al permitido por su rol, el sistema lo rechazará. Verifique los límites de descuento.
- **Monto insuficiente**: Si el cliente paga con efectivo y el monto es menor al total, el sistema le avisará. Solicite el monto correcto.

### 5.8 Recomendaciones

- Siempre verifique la orden antes de cerrarla.
- Imprima la comanda inmediatamente después de tomar el pedido para evitar errores en cocina.
- Aplique descuentos solo cuando esté autorizado para hacerlo.
- Mantenga el catálogo de productos actualizado comunicando cambios al administrador.
- Si un cliente cancela un pedido, elimine el item de la orden para no cobrarlo.

---

## 6. Módulo de Mesas

### 6.1 Objetivo

El módulo de Mesas permite visualizar y gestionar el estado de todas las mesas del establecimiento en tiempo real, facilitando la asignación de clientes y el control de la ocupación.

### 6.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite asignar una mesa a nuevos clientes.
- Quiera ver el estado general de ocupación del local.
- Deba liberar una mesa después de que los clientes se vayan.
- Requiera cambiar el estado de una mesa manualmente.
- Necesite ver detalles de una mesa específica.

### 6.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Operación".
2. Haga clic en "Mesas".

### 6.4 Elementos de la Pantalla

#### 6.4.1 Vista de Plano

La pantalla muestra un plano visual del establecimiento con todas las mesas representadas como tarjetas o recuadros.

Cada mesa muestra:
- **Número de mesa**: Identificador único.
- **Estado**: Representado por un código de color:
  - Verde: Disponible
  - Rojo: Ocupada
  - Amarillo: En proceso
  - Azul: Reservada
- **Capacidad**: Número máximo de personas.
- **Ocupación actual**: Número de personas sentadas.
- **Monto acumulado**: Total de consumos si hay pedidos activos.

#### 6.4.2 Panel de Detalles

Al hacer clic en una mesa, se abre un panel lateral con información detallada:

- **Información general**: Número, capacidad, ubicación.
- **Estado actual**: Estado actual y hora de último cambio.
- **Clientes asignados**: Lista de clientes en la mesa.
- **Pedidos activos**: Resumen de órdenes en curso.
- **Historial**: Registro de cambios recientes.

#### 6.4.3 Filtros y Controles

En la parte superior de la pantalla se encuentran controles para:

- **Filtrar por estado**: Mostrar solo mesas con un estado específico.
- **Buscar mesa**: Ingresar el número de mesa para ubicarla rápidamente.
- **Vista de lista**: Cambiar entre vista de plano y vista de lista.
- **Actualizar**: Recargar manualmente la información de mesas.

#### 6.4.4 Botones de Acción

Desde el panel de detalles puede:

- **Asignar clientes**: Agregar clientes a la mesa.
- **Liberar mesa**: Marcar la mesa como disponible.
- **Cambiar estado**: Modificar manualmente el estado de la mesa.
- **Ver pedidos**: Acceder a los pedidos de esa mesa.
- **Transferir**: Mover clientes a otra mesa.

### 6.5 Flujo Completo de Uso

#### 6.5.1 Asignar una Mesa

1. **Identifique una mesa disponible**: Busque una mesa con estado verde.
2. **Haga clic en la mesa**: Se abrirá el panel de detalles.
3. **Presione "Asignar"**: Haga clic en el botón para asignar clientes.
4. **Ingrese número de clientes**: Especifique cuántas personas se sentarán.
5. **Confirme**: La mesa cambiará a estado "Ocupada" (rojo).

#### 6.5.2 Liberar una Mesa

1. **Seleccione la mesa ocupada**: Haga clic en la mesa que desea liberar.
2. **Verifique que esté limpia**: Asegúrese de que los clientes se hayan ido.
3. **Presione "Liberar"**: Haga clic en el botón de liberar.
4. **Confirme**: La mesa volverá a estado "Disponible" (verde).

#### 6.5.3 Cambiar Estado Manualmente

1. **Seleccione la mesa**: Haga clic en la mesa deseada.
2. **Presione "Cambiar estado"**: Acceda al selector de estados.
3. **Seleccione el nuevo estado**: Elija el estado apropiado.
4. **Confirme**: El estado se actualizará inmediatamente.

#### 6.5.4 Transferir Clientes

1. **Seleccione la mesa origen**: Haga clic en la mesa con los clientes.
2. **Presione "Transferir"**: Haga clic en el botón de transferencia.
3. **Seleccione la mesa destino**: Elija la mesa a la que moverán los clientes.
4. **Confirme**: Los clientes y sus pedidos se moverán a la nueva mesa.

### 6.6 Resultado Esperado

Al completar las acciones:

- El estado de la mesa se actualizará en tiempo real.
- El dashboard reflejará el cambio en la ocupación del local.
- Si hay pedidos activos, estos se asociarán correctamente a la mesa.
- El historial de cambios quedará registrado para auditoría.

### 6.7 Posibles Errores del Usuario

- **Mesa no disponible**: Si intenta asignar una mesa que ya está ocupada, el sistema le avisará. Seleccione otra mesa.
- **Capacidad excedida**: Si intenta asignar más clientes de los que permite la mesa, el sistema lo rechazará. Verifique la capacidad de la mesa.
- **Pedidos activos**: Si intenta liberar una mesa con pedidos sin cerrar, el sistema le advertirá. Cierre los pedidos primero.
- **Mesa destino ocupada**: Si intenta transferir a una mesa que ya está ocupada, la operación fallará. Seleccione una mesa disponible.

### 6.8 Recomendaciones

- Mantenga el estado de las mesas actualizado en tiempo real.
- Libere las mesas inmediatamente después de que los clientes se vayan.
- Verifique la capacidad de la mesa antes de asignar grupos grandes.
- Use la función de transferencia cuando los clientes soliciten cambiarse de mesa.
- Revise regularmente el plano de mesas para identificar mesas disponibles rápidamente.

---

## 7. Módulo de Reservaciones

### 7.1 Objetivo

El módulo de Reservaciones permite gestionar todas las reservas de clientes, permitiendo programar mesas con anticipación y optimizar la ocupación del establecimiento.

### 7.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Un cliente solicite una reserva.
- Necesite ver las reservas del día.
- Deba confirmar o cancelar una reserva existente.
- Quiera asignar una mesa específica a una reserva.
- Requiera ver el historial de reservaciones de un cliente.

### 7.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Operación".
2. Haga clic en "Reservas".

### 7.4 Elementos de la Pantalla

#### 7.4.1 Calendario

En la parte superior de la pantalla se encuentra un calendario que muestra:

- **Días del mes**: Vista mensual con todos los días.
- **Indicadores de reservas**: Los días con reservas muestran un marcador.
- **Navegación**: Botones para cambiar de mes.
- **Selección**: Haga clic en un día para ver sus reservas.

#### 7.4.2 Lista de Reservas del Día

Debajo del calendario se muestra una lista de todas las reservas para el día seleccionado:

- **Hora**: Horario de la reserva.
- **Nombre del cliente**: Nombre de quien realizó la reserva.
- **Número de personas**: Cantidad de personas en la reserva.
- **Mesa asignada**: Mesa reservada (si está asignada).
- **Estado**: Confirmada, Pendiente, Cancelada, Completada.
- **Contacto**: Teléfono o email del cliente.

#### 7.4.3 Panel de Detalles

Al seleccionar una reserva, se abre un panel con información completa:

- **Datos del cliente**: Nombre, teléfono, email, notas.
- **Detalles de la reserva**: Fecha, hora, número de personas.
- **Mesa asignada**: Mesa reservada con capacidad.
- **Estado actual**: Estado de la reserva.
- **Historial**: Registro de cambios y comunicaciones.
- **Notas especiales**: Solicitudes o preferencias del cliente.

#### 7.4.4 Formulario de Nueva Reserva

Para crear una nueva reserva, se abre un formulario con:

- **Nombre del cliente**: Campo para ingresar el nombre.
- **Fecha**: Selector de fecha para la reserva.
- **Hora**: Selector de horario.
- **Número de personas**: Cantidad de personas esperadas.
- **Mesa preferida**: Opcional, para asignar mesa específica.
- **Contacto**: Teléfono o email.
- **Notas**: Campo para observaciones especiales.

#### 7.4.5 Botones de Acción

Desde el panel de detalles puede:

- **Confirmar**: Marcar la reserva como confirmada.
- **Cancelar**: Cancelar la reserva.
- **Modificar**: Editar los datos de la reserva.
- **Asignar mesa**: Seleccionar una mesa específica.
- **Contactar**: Ver información de contacto del cliente.

### 7.5 Flujo Completo de Uso

#### 7.5.1 Crear una Nueva Reserva

1. **Presione "Nueva reserva"**: Haga clic en el botón para crear una reserva.
2. **Ingrese datos del cliente**: Complete el nombre y contacto.
3. **Seleccione fecha y hora**: Elija el día y horario deseado.
4. **Especifique número de personas**: Ingrese cuántas personas asistirán.
5. **Seleccione mesa (opcional)**: Si el cliente tiene preferencia, asígnela.
6. **Agregue notas si es necesario**: Incluya solicitudes especiales.
7. **Confirme**: La reserva quedará registrada con estado "Pendiente".

#### 7.5.2 Confirmar una Reserva

1. **Seleccione la reserva**: Haga clic en la reserva pendiente.
2. **Verifique los datos**: Revise que toda la información sea correcta.
3. **Contacte al cliente**: Llame o envíe mensaje para confirmar asistencia.
4. **Presione "Confirmar"**: Marque la reserva como confirmada.
5. **Asigne mesa si no está asignada**: Seleccione una mesa disponible.

#### 7.5.3 Cancelar una Reserva

1. **Seleccione la reserva**: Haga clic en la reserva a cancelar.
2. **Presione "Cancelar"**: Haga clic en el botón de cancelación.
3. **Confirme la acción**: El sistema le pedirá confirmación.
4. **La mesa quedará liberada**: Si había mesa asignada, volverá a estar disponible.

#### 7.5.4 Modificar una Reserva

1. **Seleccione la reserva**: Haga clic en la reserva a modificar.
2. **Presione "Modificar"**: Acceda al formulario de edición.
3. **Cambie los datos necesarios**: Modifique fecha, hora, personas, etc.
4. **Confirme**: Los cambios se aplicarán y se notificarán si afectan la asignación de mesa.

#### 7.5.5 Asignar Mesa a una Reserva

1. **Seleccione la reserva**: Haga clic en la reserva sin mesa asignada.
2. **Presione "Asignar mesa"**: Acceda al selector de mesas.
3. **Filtre mesas disponibles**: El sistema mostrará solo mesas libres en ese horario.
4. **Seleccione la mesa**: Elija una mesa con capacidad suficiente.
5. **Confirme**: La mesa quedará reservada para ese horario.

### 7.6 Resultado Esperado

Al completar las acciones:

- La reserva quedará registrada en el calendario.
- La mesa asignada quedará bloqueada para ese horario.
- El cliente recibirá confirmación (si está configurado).
- El dashboard mostrará la reserva en la actividad reciente.
- El historial de cambios quedará registrado.

### 7.7 Posibles Errores del Usuario

- **Horario no disponible**: Si intenta reservar en un horario donde no hay mesas disponibles, el sistema lo avisará. Seleccione otro horario.
- **Mesa ya reservada**: Si intenta asignar una mesa que ya está reservada para ese horario, la operación fallará. Elija otra mesa.
- **Capacidad insuficiente**: Si intenta asignar una mesa con capacidad menor al número de personas, el sistema lo rechazará. Seleccione una mesa más grande.
- **Reserva duplicada**: Si intenta crear una reserva para el mismo cliente en el mismo horario, el sistema le advertirá. Verifique si ya existe la reserva.

### 7.8 Recomendaciones

- Confirme siempre las reservas con el cliente antes del evento.
- Asigne mesas con anticipación para garantizar disponibilidad.
- Revise las reservas del día al inicio del turno.
- Mantenga actualizada la información de contacto de los clientes.
- Use el campo de notas para registrar preferencias importantes (alergias, celebraciones, etc.).

---

## 8. Módulo de Descuentos

### 8.1 Objetivo

El módulo de Descuentos permite gestionar todas las promociones y descuentos del establecimiento, facilitando la aplicación de ofertas especiales y mejorando la experiencia del cliente.

### 8.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite aplicar un descuento a una orden.
- Quiera ver las promociones activas.
- Deba crear una nueva promoción.
- Requiera ver el historial de descuentos aplicados.
- Necesite configurar precios dinámicos.

### 8.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Operación".
2. Haga clic en "Descuentos".

### 8.4 Elementos de la Pantalla

#### 8.4.1 Suite de Descuentos

El módulo se divide en varias secciones accesibles mediante pestañas:

- **Descuentos rápidos**: Aplicación directa de descuentos a órdenes.
- **Precios dinámicos**: Configuración de precios según demanda.
- **Promociones**: Gestión de promociones especiales.
- **Eventos**: Descuentos para eventos específicos.

#### 8.4.2 Descuentos Rápidos

Esta sección permite aplicar descuentos directamente:

- **Lista de descuentos predefinidos**: Descuentos comunes configurados por el administrador.
- **Selector de tipo**: Porcentaje o monto fijo.
- **Campo de valor**: Para ingresar el porcentaje o monto.
- **Botón de aplicación**: Para aplicar el descuento a la orden seleccionada.

#### 8.4.3 Precios Dinámicos

Esta sección permite configurar precios que varían según:

- **Hora del día**: Diferentes precios en horarios pico y valle.
- **Día de la semana**: Promociones en días específicos.
- **Ocupación**: Ajustes según la ocupación del local.
- **Producto específico**: Variaciones por producto.

#### 8.4.4 Promociones

Esta sección gestiona promociones activas:

- **Lista de promociones**: Todas las promociones configuradas.
- **Estado**: Activa, Inactiva, Programada.
- **Condiciones**: Requisitos para aplicar la promoción.
- **Duración**: Fechas de inicio y fin.
- **Botones de acción**: Activar, desactivar, editar, eliminar.

#### 8.4.5 Eventos

Esta sección gestiona descuentos para eventos especiales:

- **Lista de eventos**: Eventos con descuentos especiales.
- **Fecha del evento**: Día y hora del evento.
- **Tipo de descuento**: Porcentaje, monto fijo, 2x1, etc.
- **Productos aplicables**: Categorías o productos específicos.
- **Estado**: Próximo, En curso, Finalizado.

### 8.5 Flujo Completo de Uso

#### 8.5.1 Aplicar un Descuento Rápido

1. **Seleccione la orden**: Abra la orden a la que desea aplicar el descuento.
2. **Acceda a Descuentos**: Haga clic en el botón de descuentos en la orden.
3. **Seleccione tipo**: Elija entre porcentaje o monto fijo.
4. **Ingrese valor**: Especifique el valor del descuento.
5. **Confirme**: El descuento se aplicará y el total se recalculará.

#### 8.5.2 Configurar Precios Dinámicos

1. **Acceda a Precios Dinámicos**: Seleccione la pestaña correspondiente.
2. **Seleccione el producto**: Elija el producto a configurar.
3. **Defina reglas**: Establezca las condiciones de precio (horario, día, etc.).
4. **Ingrese precios**: Especifique los precios para cada condición.
5. **Active la configuración**: Presione "Guardar" para aplicar.

#### 8.5.3 Crear una Promoción

1. **Acceda a Promociones**: Seleccione la pestaña de promociones.
2. **Presione "Nueva promoción"**: Haga clic en el botón de creación.
3. **Defina nombre**: Asigne un nombre descriptivo a la promoción.
4. **Establezca condiciones**: Defina cuándo se aplica la promoción.
5. **Configure el descuento**: Especifique el tipo y valor del descuento.
6. **Defina duración**: Establezca fechas de inicio y fin.
7. **Active la promoción**: Presione "Guardar" y active la promoción.

#### 8.5.4 Crear un Evento con Descuento

1. **Acceda a Eventos**: Seleccione la pestaña de eventos.
2. **Presione "Nuevo evento"**: Haga clic en el botón de creación.
3. **Ingrese datos del evento**: Nombre, fecha, descripción.
4. **Configure el descuento**: Defina el tipo y valor del descuento.
5. **Seleccione productos**: Elija qué productos incluyen el descuento.
6. **Guarde el evento**: Presione "Guardar" para crear el evento.

### 8.6 Resultado Esperado

Al completar las acciones:

- Los descuentos se aplicarán correctamente a las órdenes.
- Los precios dinámicos se ajustarán automáticamente según las condiciones.
- Las promociones estarán disponibles para su aplicación.
- Los eventos con descuentos estarán programados y activos en sus fechas.
- El historial de descuentos aplicados quedará registrado.

### 8.7 Posibles Errores del Usuario

- **Descuento excedido**: Si intenta aplicar un descuento mayor al permitido por su rol, el sistema lo rechazará. Verifique los límites de su rol.
- **Promoción solapada**: Si intenta crear una promoción que se solapa con otra existente, el sistema le avisará. Ajuste las fechas.
- **Producto no encontrado**: Si intenta configurar un producto que no existe, la operación fallará. Verifique el catálogo de productos.
- **Evento pasado**: Si intenta crear un evento con fecha pasada, el sistema lo rechazará. Seleccione una fecha futura.

### 8.8 Recomendaciones

- Aplique descuentos solo cuando esté autorizado.
- Revise las promociones activas antes de aplicar descuentos manuales.
- Configure precios dinámicos con anticipación para evitar confusiones.
- Planifique los eventos con suficiente antelación.
- Revise regularmente el historial de descuentos para identificar patrones de uso.

---

## 9. Módulo de Productos

### 9.1 Objetivo

El módulo de Productos permite gestionar el catálogo completo de productos del establecimiento, incluyendo bebidas, alimentos y cualquier item que se ofrezca a los clientes.

### 9.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite agregar un nuevo producto al catálogo.
- Quiera modificar el precio o descripción de un producto existente.
- Deba desactivar un producto que ya no se ofrece.
- Requiera ver el inventario actual de un producto.
- Necesite organizar productos por categorías.

### 9.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Gestión".
2. Haga clic en "Productos".

**Nota**: Este módulo requiere permisos de administrador o rol con acceso a gestión de productos.

### 9.4 Elementos de la Pantalla

#### 9.4.1 Lista de Productos

La pantalla muestra una lista o grilla de todos los productos del catálogo:

- **Imagen**: Foto representativa del producto.
- **Nombre**: Nombre del producto.
- **Categoría**: Categoría a la que pertenece.
- **Precio**: Precio unitario actual.
- **Stock**: Cantidad disponible en inventario.
- **Estado**: Activo, Inactivo, Agotado.

#### 9.4.2 Panel de Detalles

Al seleccionar un producto, se abre un panel con información completa:

- **Información general**: Nombre, descripción, categoría.
- **Precio**: Precio actual e histórico de cambios.
- **Inventario**: Stock actual, mínimo, máximo.
- **Estado**: Estado actual del producto.
- **Imágenes**: Galería de imágenes del producto.
- **Receta asociada**: Si el producto tiene receta preparación.

#### 9.4.3 Formulario de Producto

Para crear o editar un producto, se abre un formulario con:

- **Nombre**: Campo para el nombre del producto.
- **Descripción**: Texto descriptivo del producto.
- **Categoría**: Selector de categoría.
- **Precio**: Campo para el precio unitario.
- **Stock**: Cantidad disponible.
- **Stock mínimo**: Nivel mínimo para alerta.
- **Stock máximo**: Nivel máximo de reabastecimiento.
- **Imágenes**: Carga de imágenes del producto.
- **Estado**: Selector de estado (Activo/Inactivo).

#### 9.4.4 Filtros y Búsqueda

En la parte superior se encuentran controles para:

- **Buscar por nombre**: Campo de búsqueda textual.
- **Filtrar por categoría**: Selector de categorías.
- **Filtrar por estado**: Mostrar solo activos, inactivos o agotados.
- **Ordenar**: Por nombre, precio, stock, etc.

#### 9.4.5 Botones de Acción

Desde el panel de detalles puede:

- **Editar**: Modificar los datos del producto.
- **Activar/Desactivar**: Cambiar el estado del producto.
- **Eliminar**: Eliminar el producto del catálogo.
- **Ver historial**: Ver cambios realizados en el producto.
- **Duplicar**: Crear una copia del producto.

### 9.5 Flujo Completo de Uso

#### 9.5.1 Crear un Nuevo Producto

1. **Presione "Nuevo producto"**: Haga clic en el botón de creación.
2. **Ingrese nombre**: Escriba el nombre del producto.
3. **Seleccione categoría**: Elija la categoría apropiada.
4. **Ingrese descripción**: Describa el producto detalladamente.
5. **Establezca precio**: Defina el precio unitario.
6. **Configure stock**: Ingrese stock actual, mínimo y máximo.
7. **Cargue imágenes**: Suba fotos representativas del producto.
8. **Seleccione estado**: Active el producto si está disponible.
9. **Guarde**: Presione "Guardar" para crear el producto.

#### 9.5.2 Modificar un Producto Existente

1. **Seleccione el producto**: Haga clic en el producto a modificar.
2. **Presione "Editar"**: Acceda al formulario de edición.
3. **Modifique los datos necesarios**: Cambie nombre, precio, descripción, etc.
4. **Actualice stock si es necesario**: Modifique la cantidad disponible.
5. **Guarde los cambios**: Presione "Guardar" para aplicar.

#### 9.5.3 Activar o Desactivar un Producto

1. **Seleccione el producto**: Haga clic en el producto deseado.
2. **Presione "Activar" o "Desactivar"**: Cambie el estado según necesite.
3. **Confirme**: El producto aparecerá o desaparecerá del catálogo según el estado.

#### 9.5.4 Eliminar un Producto

1. **Seleccione el producto**: Haga clic en el producto a eliminar.
2. **Presione "Eliminar"**: Haga clic en el botón de eliminación.
3. **Confirme la acción**: El sistema le pedirá confirmación.
4. **El producto se eliminará**: Ya no aparecerá en el catálogo ni en reportes.

### 9.6 Resultado Esperado

Al completar las acciones:

- El producto quedará registrado en el catálogo.
- El stock se actualizará en el módulo de inventario.
- El producto estará disponible para agregar a órdenes (si está activo).
- Los cambios quedarán registrados en el historial.
- El dashboard reflejará los cambios en las métricas.

### 9.7 Posibles Errores del Usuario

- **Nombre duplicado**: Si intenta crear un producto con un nombre que ya existe, el sistema lo rechazará. Use un nombre único.
- **Precio inválido**: Si ingresa un precio negativo o cero, el sistema lo rechazará. Ingrese un precio válido.
- **Stock negativo**: Si intenta establecer un stock negativo, la operación fallará. Ingrese un valor positivo.
- **Categoría inexistente**: Si selecciona una categoría que no existe, el sistema lo avisará. Cree la categoría primero o seleccione una existente.

### 9.8 Recomendaciones

- Mantenga el catálogo actualizado con productos reales.
- Use descripciones claras y detalladas para cada producto.
- Cargue imágenes de buena calidad para mejorar la presentación.
- Establezca niveles de stock mínimo para recibir alertas de reabastecimiento.
- Revise regularmente los productos inactivos para decidir si eliminarlos o reactivarlos.
- Use nombres descriptivos que faciliten la búsqueda.

---

## 10. Módulo de Menús

### 10.1 Objetivo

El módulo de Menús permite organizar los productos en menús estructurados, facilitando la presentación al cliente y la gestión de ofertas combinadas.

### 10.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite crear un nuevo menú (ejecutivo, infantil, etc.).
- Quiera organizar productos en categorías.
- Deba crear combos o promociones combinadas.
- Requiera modificar la estructura de un menú existente.
- Necesite activar o desactivar menús según temporada.

### 10.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Gestión".
2. Haga clic en "Menús".

**Nota**: Este módulo requiere permisos de administrador o rol con acceso a gestión de menús.

### 10.4 Elementos de la Pantalla

#### 10.4.1 Lista de Menús

La pantalla muestra todos los menús configurados:

- **Nombre**: Nombre del menú.
- **Descripción**: Breve descripción del menú.
- **Estado**: Activo, Inactivo.
- **Número de productos**: Cantidad de productos incluidos.
- **Precio base**: Precio del menú (si aplica).

#### 10.4.2 Panel de Detalles del Menú

Al seleccionar un menú, se abre un panel con:

- **Información general**: Nombre, descripción, estado.
- **Categorías incluidas**: Lista de categorías del menú.
- **Productos**: Todos los productos del menú organizados por categoría.
- **Precio del menú**: Si es un menú con precio fijo.
- **Horarios de disponibilidad**: Si el menú está disponible solo en ciertos horarios.

#### 10.4.3 Editor de Menú

Para crear o editar un menú, se abre un editor con:

- **Nombre del menú**: Campo para el nombre.
- **Descripción**: Texto descriptivo.
- **Tipo de menú**: Selector (individual, ejecutivo, infantil, etc.).
- **Precio**: Campo para precio fijo (opcional).
- **Horarios**: Configuración de disponibilidad por horario.
- **Selector de productos**: Lista de productos disponibles para agregar.
- **Organizador de categorías**: Estructura de categorías del menú.

#### 10.4.4 Vista Previa

El editor incluye una vista previa que muestra cómo se verá el menú para los clientes, permitiendo verificar la organización y presentación antes de guardar.

#### 10.4.5 Botones de Acción

Desde el panel de detalles puede:

- **Editar**: Modificar la estructura del menú.
- **Activar/Desactivar**: Cambiar la disponibilidad del menú.
- **Duplicar**: Crear una copia del menú.
- **Eliminar**: Eliminar el menú completo.
- **Ver vista previa**: Mostrar cómo se ve el menú.

### 10.5 Flujo Completo de Uso

#### 10.5.1 Crear un Nuevo Menú

1. **Presione "Nuevo menú"**: Haga clic en el botón de creación.
2. **Ingrese nombre**: Escriba el nombre del menú.
3. **Seleccione tipo**: Elija el tipo de menú (ejecutivo, infantil, etc.).
4. **Ingrese descripción**: Describa el contenido del menú.
5. **Configure precio (opcional)**: Si es un menú con precio fijo, ingréselo.
6. **Establezca horarios**: Defina en qué horarios está disponible.
7. **Agregue categorías**: Cree las categorías del menú.
8. **Agregue productos**: Seleccione productos de cada categoría.
9. **Organice la estructura**: Ordene categorías y productos.
10. **Revise vista previa**: Verifique cómo se ve el menú.
11. **Guarde**: Presione "Guardar" para crear el menú.

#### 10.5.2 Modificar un Menú Existente

1. **Seleccione el menú**: Haga clic en el menú a modificar.
2. **Presione "Editar"**: Acceda al editor del menú.
3. **Modifique los datos necesarios**: Cambie nombre, descripción, precio, etc.
4. **Agregue o elimine productos**: Modifique el contenido del menú.
5. **Reorganice categorías**: Cambie el orden o estructura.
6. **Guarde los cambios**: Presione "Guardar" para aplicar.

#### 10.5.3 Activar o Desactivar un Menú

1. **Seleccione el menú**: Haga clic en el menú deseado.
2. **Presione "Activar" o "Desactivar"**: Cambie la disponibilidad.
3. **Confirme**: El menú estará disponible o no según el estado.

#### 10.5.4 Duplicar un Menú

1. **Seleccione el menú**: Haga clic en el menú a duplicar.
2. **Presione "Duplicar"**: Haga clic en el botón de duplicación.
3. **Modifique el nombre**: Cambie el nombre del menú duplicado.
4. **Ajuste contenido si es necesario**: Modifique productos o categorías.
5. **Guarde**: Se creará una copia del menú original.

### 10.6 Resultado Esperado

Al completar las acciones:

- El menú quedará disponible para su uso en órdenes.
- Los clientes podrán ver el menú organizado por categorías.
- El precio del menú se aplicará automáticamente si corresponde.
- Los cambios quedarán registrados en el historial.
- El menú respetará los horarios de disponibilidad configurados.

### 10.7 Posibles Errores del Usuario

- **Nombre duplicado**: Si intenta crear un menú con un nombre que ya existe, el sistema lo rechazará. Use un nombre único.
- **Sin productos**: Si intenta guardar un menú sin productos, el sistema le avisará. Agregue al menos un producto.
- **Precio inválido**: Si ingresa un precio negativo, el sistema lo rechazará. Ingrese un valor válido o deje el campo vacío.
- **Horario inválido**: Si configura horarios que se solapan o son inválidos, el sistema lo avisará. Ajuste los horarios.

### 10.8 Recomendaciones

- Organice los menús de manera lógica para facilitar la navegación.
- Use descripciones claras que indiquen el contenido del menú.
- Configure horarios de disponibilidad para menús especiales (ejecutivo, happy hour).
- Revise regularmente los menús para actualizar productos según temporada.
- Use la vista previa para verificar la presentación antes de activar.
- Mantenga los menús actualizados con productos disponibles.

---

## 11. Módulo de Inventario

### 11.1 Objetivo

El módulo de Inventario permite controlar el stock de todos los productos del establecimiento, recibiendo alertas de bajo stock y registrando los movimientos de entrada y salida.

### 11.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite ver el stock actual de los productos.
- Deba registrar una entrada de mercancía.
- Quiera ver el historial de movimientos de inventario.
- Requiera recibir alertas de productos con bajo stock.
- Necesite realizar un ajuste de inventario.

### 11.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Gestión".
2. Haga clic en "Inventario".

**Nota**: Este módulo requiere permisos de administrador o rol con acceso a gestión de inventario.

### 11.4 Elementos de la Pantalla

#### 11.4.1 Lista de Inventario

La pantalla muestra una lista de todos los productos con su stock:

- **Producto**: Nombre del producto.
- **Categoría**: Categoría a la que pertenece.
- **Stock actual**: Cantidad disponible.
- **Stock mínimo**: Nivel mínimo para alerta.
- **Stock máximo**: Nivel máximo de reabastecimiento.
- **Estado**: Normal, Bajo stock, Agotado, Excedido.
- **Último movimiento**: Fecha del último movimiento registrado.

#### 11.4.2 Panel de Detalles del Producto

Al seleccionar un producto, se abre un panel con:

- **Información del producto**: Nombre, categoría, descripción.
- **Stock actual**: Cantidad disponible.
- **Niveles de stock**: Mínimo y máximo configurados.
- **Historial de movimientos**: Registro de todas las entradas y salidas.
- **Valor unitario**: Costo unitario del producto.
- **Valor total**: Valor del stock actual (cantidad × costo).

#### 11.4.3 Formulario de Movimiento

Para registrar movimientos, se abre un formulario con:

- **Tipo de movimiento**: Entrada o Salida.
- **Cantidad**: Cantidad del movimiento.
- **Motivo**: Razón del movimiento (compra, consumo, pérdida, etc.).
- **Fecha**: Fecha del movimiento.
- **Notas**: Observaciones adicionales.

#### 11.4.4 Alertas de Bajo Stock

En la parte superior de la pantalla se muestran alertas para:

- **Productos agotados**: Productos con stock en cero.
- **Bajo stock**: Productos por debajo del nivel mínimo.
- **Próximos a agotarse**: Productos cercanos al nivel mínimo.

#### 11.4.5 Filtros y Búsqueda

Controles para filtrar la vista:

- **Buscar por nombre**: Campo de búsqueda textual.
- **Filtrar por estado**: Normal, Bajo stock, Agotado.
- **Filtrar por categoría**: Selector de categorías.
- **Ordenar**: Por nombre, stock, categoría, etc.

#### 11.4.6 Botones de Acción

Desde el panel de detalles puede:

- **Registrar entrada**: Agregar stock al producto.
- **Registrar salida**: Restar stock del producto.
- **Ajustar stock**: Corregir el stock actual.
- **Ver historial**: Ver todos los movimientos del producto.
- **Configurar niveles**: Modificar stock mínimo y máximo.

### 11.5 Flujo Completo de Uso

#### 11.5.1 Registrar una Entrada de Mercancía

1. **Seleccione el producto**: Haga clic en el producto a reabastecer.
2. **Presione "Registrar entrada"**: Haga clic en el botón de entrada.
3. **Ingrese cantidad**: Especifique la cantidad recibida.
4. **Seleccione motivo**: Elija el motivo (compra, devolución, etc.).
5. **Ingrese fecha**: Seleccione la fecha del movimiento.
6. **Agregue notas si es necesario**: Incluya observaciones.
7. **Confirme**: El stock se incrementará y el movimiento quedará registrado.

#### 11.5.2 Registrar una Salida de Mercancía

1. **Seleccione el producto**: Haga clic en el producto con salida.
2. **Presione "Registrar salida"**: Haga clic en el botón de salida.
3. **Ingrese cantidad**: Especifique la cantidad retirada.
4. **Seleccione motivo**: Elija el motivo (consumo, pérdida, etc.).
5. **Ingrese fecha**: Seleccione la fecha del movimiento.
6. **Agregue notas si es necesario**: Incluya observaciones.
7. **Confirme**: El stock se decrementará y el movimiento quedará registrado.

#### 11.5.3 Ajustar el Stock

1. **Seleccione el producto**: Haga clic en el producto a ajustar.
2. **Presione "Ajustar stock"**: Haga clic en el botón de ajuste.
3. **Ingrese el stock correcto**: Especifique la cantidad real.
4. **Ingrese motivo**: Explique la razón del ajuste (inventario físico, error, etc.).
5. **Confirme**: El stock se actualizará al valor ingresado.

#### 11.5.4 Configurar Niveles de Stock

1. **Seleccione el producto**: Haga clic en el producto deseado.
2. **Presione "Configurar niveles"**: Acceda a la configuración.
3. **Ingrese stock mínimo**: Defina el nivel mínimo para alertas.
4. **Ingrese stock máximo**: Defina el nivel máximo de reabastecimiento.
5. **Guarde**: Los niveles se actualizarán y las alertas se ajustarán.

#### 11.5.5 Ver Historial de Movimientos

1. **Seleccione el producto**: Haga clic en el producto deseado.
2. **Presione "Ver historial"**: Acceda al registro de movimientos.
3. **Revise los movimientos**: Vea todas las entradas y salidas con fecha y motivo.
4. **Filtre si es necesario**: Use filtros por fecha o tipo de movimiento.

### 11.6 Resultado Esperado

Al completar las acciones:

- El stock se actualizará correctamente.
- El historial de movimientos quedará registrado.
- Las alertas de bajo stock se actualizarán automáticamente.
- El valor del inventario se recalculará.
- El dashboard reflejará los cambios en las métricas de inventario.

### 11.7 Posibles Errores del Usuario

- **Stock insuficiente**: Si intenta registrar una salida mayor al stock disponible, el sistema lo rechazará. Verifique el stock actual.
- **Cantidad negativa**: Si ingresa una cantidad negativa, la operación fallará. Ingrese un valor positivo.
- **Motivo requerido**: Si no selecciona un motivo, el sistema le avisará. Seleccione un motivo del movimiento.
- **Ajuste inválido**: Si intenta ajustar el stock a un valor negativo, el sistema lo rechazará. Ingrese un valor válido.

### 11.8 Recomendaciones

- Realice inventarios físicos regularmente y ajuste el stock según corresponda.
- Configure niveles de stock mínimo apropiados para recibir alertas oportunas.
- Registre todos los movimientos con motivos claros para auditoría.
- Revise las alertas de bajo stock diariamente para planificar reabastecimiento.
- Mantenga el inventario actualizado para evitar problemas en el servicio.
- Use notas para registrar detalles importantes de los movimientos.

---

## 12. Módulo de Recetas

### 12.1 Objetivo

El módulo de Recetas permite gestionar las recetas de preparación de bebidas y platos, asegurando consistencia en la calidad y facilitando el cálculo de costos.

### 12.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite crear una nueva receta para un producto.
- Quiera modificar los ingredientes de una receta existente.
- Deba ver el costo de producción de un plato.
- Requiera estandarizar las preparaciones.
- Necesite calcular el costo de un nuevo menú.

### 12.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Gestión".
2. Haga clic en "Recetas".

**Nota**: Este módulo requiere permisos de administrador o rol con acceso a gestión de recetas.

### 12.4 Elementos de la Pantalla

#### 12.4.1 Lista de Recetas

La pantalla muestra todas las recetas configuradas:

- **Nombre del producto**: Producto al que pertenece la receta.
- **Categoría**: Categoría del producto.
- **Número de ingredientes**: Cantidad de ingredientes en la receta.
- **Costo total**: Costo de producción de la receta.
- **Estado**: Activa, Inactiva.

#### 12.4.2 Panel de Detalles de la Receta

Al seleccionar una receta, se abre un panel con:

- **Información del producto**: Nombre, categoría, descripción.
- **Lista de ingredientes**: Todos los ingredientes con sus cantidades.
- **Instrucciones de preparación**: Pasos detallados de la preparación.
- **Costo total**: Suma del costo de todos los ingredientes.
- **Costo por porción**: Costo unitario de la receta.
- **Tiempo de preparación**: Tiempo estimado de preparación.
- **Estado**: Estado actual de la receta.

#### 12.4.3 Editor de Receta

Para crear o editar una receta, se abre un editor con:

- **Selector de producto**: Producto al que se asignará la receta.
- **Lista de ingredientes**: Campo para agregar ingredientes.
- **Cantidad de cada ingrediente**: Medida de cada ingrediente.
- **Unidad de medida**: Tipo de medida (ml, gr, unidad, etc.).
- **Instrucciones**: Campo para pasos de preparación.
- **Tiempo de preparación**: Duración estimada.
- **Notas adicionales**: Observaciones importantes.

#### 12.4.4 Calculadora de Costos

El editor incluye una calculadora que muestra:

- **Costo por ingrediente**: Costo unitario de cada ingrediente.
- **Costo total de la receta**: Suma de todos los ingredientes.
- **Margen de ganancia**: Diferencia entre precio de venta y costo.
- **Porcentaje de costo**: Costo como porcentaje del precio de venta.

#### 12.4.5 Botones de Acción

Desde el panel de detalles puede:

- **Editar**: Modificar la receta.
- **Activar/Desactivar**: Cambiar el estado de la receta.
- **Duplicar**: Crear una copia de la receta.
- **Eliminar**: Eliminar la receta.
- **Imprimir**: Generar una versión imprimible de la receta.

### 12.5 Flujo Completo de Uso

#### 12.5.1 Crear una Nueva Receta

1. **Presione "Nueva receta"**: Haga clic en el botón de creación.
2. **Seleccione el producto**: Elija el producto para la receta.
3. **Agregue ingredientes**: Seleccione los ingredientes necesarios.
4. **Ingrese cantidades**: Especifique la cantidad de cada ingrediente.
5. **Seleccione unidades**: Elija la unidad de medida apropiada.
6. **Escriba instrucciones**: Detalle los pasos de preparación.
7. **Ingrese tiempo de preparación**: Estime la duración.
8. **Agregue notas si es necesario**: Incluya observaciones importantes.
9. **Revise el costo**: Verifique el costo calculado.
10. **Guarde**: Presione "Guardar" para crear la receta.

#### 12.5.2 Modificar una Receta Existente

1. **Seleccione la receta**: Haga clic en la receta a modificar.
2. **Presione "Editar"**: Acceda al editor de la receta.
3. **Modifique los ingredientes**: Agregue, elimine o cambie ingredientes.
4. **Ajuste cantidades**: Modifique las cantidades según necesite.
5. **Actualice instrucciones**: Cambie los pasos de preparación.
6. **Guarde los cambios**: Presione "Guardar" para aplicar.

#### 12.5.3 Activar o Desactivar una Receta

1. **Seleccione la receta**: Haga clic en la receta deseada.
2. **Presione "Activar" o "Desactivar"**: Cambie el estado.
3. **Confirme**: La receta estará disponible o no según el estado.

#### 12.5.4 Calcular Costo de un Menú

1. **Seleccione las recetas**: Elija todas las recetas del menú.
2. **Revise los costos**: Vea el costo de cada receta.
3. **Sume los costos**: El sistema calculará el costo total del menú.
4. **Compare con precio**: Verifique el margen de ganancia.

### 12.6 Resultado Esperado

Al completar las acciones:

- La receta quedará asociada al producto.
- El costo de producción quedará calculado.
- Las instrucciones estarán disponibles para el personal.
- El margen de ganancia podrá analizarse.
- La consistencia en la preparación mejorará.

### 12.7 Posibles Errores del Usuario

- **Producto sin receta**: Si intenta crear una receta para un producto que ya tiene una, el sistema le avisará. Modifique la existente.
- **Ingrediente no encontrado**: Si selecciona un ingrediente que no existe en inventario, la operación fallará. Verifique el catálogo de ingredientes.
- **Cantidad inválida**: Si ingresa una cantidad negativa o cero, el sistema lo rechazará. Ingrese un valor válido.
- **Sin instrucciones**: Si intenta guardar una receta sin instrucciones, el sistema le avisará. Agregue al menos los pasos básicos.

### 12.8 Recomendaciones

- Mantenga las recetas actualizadas con ingredientes disponibles.
- Use instrucciones claras y detalladas para asegurar consistencia.
- Revise regularmente los costos para ajustar precios si es necesario.
- Incluya notas sobre técnicas especiales o variaciones.
- Use recetas duplicadas como base para crear nuevas variaciones.
- Imprima las recetas para tenerlas disponibles en cocina/bar.

---

## 13. Módulo de Empleados

### 13.1 Objetivo

El módulo de Empleados permite gestionar todo el personal del establecimiento, incluyendo sus roles, permisos, turnos y actividad, facilitando la administración de recursos humanos.

### 13.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite agregar un nuevo empleado al sistema.
- Quiera modificar los datos de un empleado existente.
- Deba asignar o cambiar el rol de un empleado.
- Requiera configurar los turnos del personal.
- Necesite ver la actividad de los empleados.

### 13.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Sistema".
2. Haga clic en "Empleados".

**Nota**: Este módulo requiere permisos de administrador.

### 13.4 Elementos de la Pantalla

#### 13.4.1 Submódulos

El módulo de Empleados se divide en varias secciones accesibles mediante pestañas:

- **Empleados**: Lista y gestión del personal.
- **Roles**: Configuración de roles del sistema.
- **Permisos**: Gestión de permisos por rol.
- **Turnos**: Configuración de horarios y turnos.
- **Actividad**: Seguimiento de actividad de empleados.
- **Gestión de turnos**: Asignación de turnos a empleados.
- **Métricas de turnos**: Análisis de rendimiento por turno.

#### 13.4.2 Lista de Empleados

La sección de empleados muestra:

- **Nombre**: Nombre completo del empleado.
- **Email**: Correo electrónico de acceso.
- **Rol**: Rol asignado al empleado.
- **Estado**: Activo, Inactivo.
- **Último acceso**: Fecha y hora del último inicio de sesión.
- **Turno actual**: Turno asignado actualmente.

#### 13.4.3 Panel de Detalles del Empleado

Al seleccionar un empleado, se abre un panel con:

- **Información personal**: Nombre, email, teléfono.
- **Información de empleo**: Rol, fecha de contratación, estado.
- **Credenciales**: Email para acceso al sistema.
- **Turnos asignados**: Historial de turnos del empleado.
- **Actividad reciente**: Registro de acciones recientes.
- **Permisos**: Permisos asignados según su rol.

#### 13.4.4 Formulario de Empleado

Para crear o editar un empleado, se abre un formulario con:

- **Nombre completo**: Campo para el nombre.
- **Email**: Campo para el correo de acceso.
- **Teléfono**: Campo para contacto.
- **Rol**: Selector de rol a asignar.
- **Estado**: Selector de estado (Activo/Inactivo).
- **Contraseña**: Campo para establecer contraseña inicial.

#### 13.4.5 Gestión de Roles

La sección de roles permite:

- **Lista de roles**: Todos los roles configurados.
- **Descripción**: Función de cada rol.
- **Permisos asociados**: Permisos que tiene cada rol.
- **Botones de acción**: Crear, editar, eliminar roles.

#### 13.4.6 Gestión de Permisos

La sección de permisos permite:

- **Lista de permisos**: Todos los permisos del sistema.
- **Categorías**: Permisos organizados por módulo.
- **Asignación por rol**: Qué permisos tiene cada rol.
- **Activación/Desactivación**: Habilitar o deshabilitar permisos.

#### 13.4.7 Gestión de Turnos

La sección de turnos permite:

- **Lista de turnos**: Todos los turnos configurados.
- **Horarios**: Horario de inicio y fin de cada turno.
- **Empleados asignados**: Personal asignado a cada turno.
- **Botones de acción**: Crear, editar, eliminar turnos.

#### 13.4.8 Seguimiento de Actividad

La sección de actividad muestra:

- **Lista de empleados**: Todos los empleados activos.
- **Acciones recientes**: Qué ha hecho cada empleado.
- **Horas trabajadas**: Tiempo de actividad en el sistema.
- **Última acción**: Fecha y hora de la última acción.

### 13.5 Flujo Completo de Uso

#### 13.5.1 Crear un Nuevo Empleado

1. **Acceda a la sección Empleados**: Seleccione la pestaña de empleados.
2. **Presione "Nuevo empleado"**: Haga clic en el botón de creación.
3. **Ingrese nombre completo**: Escriba el nombre del empleado.
4. **Ingrese email**: Proporcione el correo para acceso al sistema.
5. **Ingrese teléfono**: Agregue un número de contacto.
6. **Seleccione rol**: Asigne el rol apropiado.
7. **Establezca contraseña**: Cree una contraseña inicial.
8. **Seleccione estado**: Active el empleado si está disponible.
9. **Guarde**: Presione "Guardar" para crear el empleado.

#### 13.5.2 Modificar un Empleado Existente

1. **Seleccione el empleado**: Haga clic en el empleado a modificar.
2. **Presione "Editar"**: Acceda al formulario de edición.
3. **Modifique los datos necesarios**: Cambie nombre, email, rol, etc.
4. **Guarde los cambios**: Presione "Guardar" para aplicar.

#### 13.5.3 Cambiar el Rol de un Empleado

1. **Seleccione el empleado**: Haga clic en el empleado deseado.
2. **Presione "Editar"**: Acceda al formulario.
3. **Seleccione nuevo rol**: Cambie el rol asignado.
4. **Guarde**: Los permisos del empleado se actualizarán automáticamente.

#### 13.5.4 Crear un Nuevo Rol

1. **Acceda a Roles**: Seleccione la pestaña de roles.
2. **Presione "Nuevo rol"**: Haga clic en el botón de creación.
3. **Ingrese nombre del rol**: Asigne un nombre descriptivo.
4. **Ingrese descripción**: Explique la función del rol.
5. **Asigne permisos**: Seleccione los permisos que tendrá el rol.
6. **Guarde**: Presione "Guardar" para crear el rol.

#### 13.5.5 Configurar Permisos de un Rol

1. **Acceda a Permisos**: Seleccione la pestaña de permisos.
2. **Seleccione el rol**: Elija el rol a configurar.
3. **Active o desactive permisos**: Marque o desmarque los permisos deseados.
4. **Guarde**: Presione "Guardar" para aplicar los cambios.

#### 13.5.6 Crear un Nuevo Turno

1. **Acceda a Turnos**: Seleccione la pestaña de turnos.
2. **Presione "Nuevo turno"**: Haga clic en el botón de creación.
3. **Ingrese nombre del turno**: Asigne un nombre (Mañana, Tarde, Noche).
4. **Establezca horario**: Defina hora de inicio y fin.
5. **Asigne empleados**: Seleccione los empleados del turno.
6. **Guarde**: Presione "Guardar" para crear el turno.

#### 13.5.7 Ver Actividad de Empleados

1. **Acceda a Actividad**: Seleccione la pestaña de actividad.
2. **Seleccione el empleado**: Elija el empleado a revisar.
3. **Revise las acciones**: Vea qué ha hecho el empleado.
4. **Filtre por fecha**: Use filtros para ver períodos específicos.

### 13.6 Resultado Esperado

Al completar las acciones:

- El empleado quedará registrado en el sistema.
- El empleado podrá acceder con sus credenciales.
- Los permisos se aplicarán según el rol asignado.
- Los turnos quedarán configurados y asignados.
- La actividad quedará registrada para auditoría.

### 13.7 Posibles Errores del Usuario

- **Email duplicado**: Si intenta crear un empleado con un email que ya existe, el sistema lo rechazará. Use un email único.
- **Rol no asignado**: Si intenta crear un empleado sin asignar un rol, el sistema le avisará. Seleccione un rol.
- **Contraseña débil**: Si la contraseña no cumple los requisitos mínimos, el sistema la rechazará. Use una contraseña más fuerte.
- **Permiso sin rol**: Si intenta configurar permisos sin seleccionar un rol, la operación fallará. Seleccione un rol primero.

### 13.8 Recomendaciones

- Asigne roles apropiados según las funciones de cada empleado.
- Revise regularmente la actividad de los empleados.
- Mantenga los turnos actualizados con el personal actual.
- Use contraseñas seguras y exhórtelas a los empleados a cambiarlas periódicamente.
- Desactive empleados que ya no trabajen en el establecimiento.
- Documente claramente las funciones de cada rol.

---

## 14. Módulo de Ruleta

### 14.1 Objetivo

El módulo de Ruleta es una funcionalidad especial que permite realizar sorteos interactivos para clientes, mejorando la experiencia y fomentando el engagement.

### 14.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Desee realizar un sorteo para clientes.
- Quiera ofrecer premios o descuentos aleatorios.
- Necesite animar eventos especiales.
- Requiera una herramienta interactiva para promociones.

### 14.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Sistema".
2. Haga clic en "Ruleta".

**Nota**: Este módulo requiere permisos específicos (Bartender, Admin).

### 14.4 Elementos de la Pantalla

#### 14.4.1 Ruleta Interactiva

La pantalla muestra una ruleta visual con:

- **Segmentos**: Divisiones de la ruleta con diferentes premios.
- **Botón de girar**: Control para activar la ruleta.
- **Resultado**: Área que muestra el premio ganador.
- **Historial**: Registro de sorteos realizados.

#### 14.4.2 Configuración de Premios

Panel para configurar los premios:

- **Lista de premios**: Todos los premios configurados.
- **Tipo de premio**: Descuento, producto gratis, bebida, etc.
- **Valor del premio**: Monto o descripción del premio.
- **Probabilidad**: Peso o probabilidad de cada premio.
- **Color**: Color del segmento en la ruleta.

#### 14.4.3 Panel de Control

Controles para gestionar la ruleta:

- **Activar/Desactivar**: Habilitar o deshabilitar la ruleta.
- **Resetear**: Reiniciar el historial de sorteos.
- **Configurar**: Acceder a la configuración de premios.
- **Estadísticas**: Ver métricas de uso de la ruleta.

#### 14.4.4 Historial de Sorteos

Registro de todos los sorteos:

- **Fecha y hora**: Cuándo se realizó el sorteo.
- **Premio ganado**: Qué premio se obtuvo.
- **Cliente**: Cliente que participó (si está registrado).
- **Empleado**: Empleado que operó la ruleta.

### 14.5 Flujo Completo de Uso

#### 14.5.1 Configurar la Ruleta

1. **Acceda a Configuración**: Haga clic en el botón de configuración.
2. **Agregue premios**: Cree los premios deseados.
3. **Defina valores**: Especifique el valor de cada premio.
4. **Establezca probabilidades**: Asigne el peso de cada premio.
5. **Seleccione colores**: Elija colores para cada segmento.
6. **Guarde**: Presione "Guardar" para aplicar la configuración.

#### 14.5.2 Realizar un Sorteo

1. **Verifique que la ruleta esté activa**: Confirme que esté habilitada.
2. **Invite al cliente**: Explique las reglas al cliente.
3. **Presione "Girar"**: Active la ruleta.
4. **Espere el resultado**: La ruleta girará y se detendrá en un premio.
5. **Anuncie el premio**: Comunique al cliente qué ganó.
6. **Registre el cliente**: Si el cliente está registrado, asócielo al sorteo.
7. **Aplique el premio**: Otorgue el descuento o producto ganado.

#### 14.5.3 Ver Estadísticas

1. **Acceda a Estadísticas**: Haga clic en el botón de estadísticas.
2. **Revise los datos**: Vea cuántos sorteos se han realizado.
3. **Analice premios**: Vea qué premios se han otorgado más.
4. **Filtre por fecha**: Use filtros para ver períodos específicos.

#### 14.5.4 Resetear la Ruleta

1. **Acceda a Control**: Haga clic en el botón de control.
2. **Presione "Resetear"**: Haga clic en el botón de reset.
3. **Confirme la acción**: El sistema le pedirá confirmación.
4. **El historial se borrará**: Todos los sorteos anteriores se eliminarán.

### 14.6 Resultado Esperado

Al completar las acciones:

- La ruleta estará configurada con los premios deseados.
- Los sorteos se realizarán de manera justa según las probabilidades.
- El historial quedará registrado para auditoría.
- Los clientes disfrutarán de la experiencia interactiva.
- Las estadísticas permitirán analizar el uso de la ruleta.

### 14.7 Posibles Errores del Usuario

- **Ruleta desactivada**: Si intenta girar la ruleta y está desactivada, la operación fallará. Active la ruleta primero.
- **Sin premios configurados**: Si intenta usar la ruleta sin premios, el sistema le avisará. Configure al menos un premio.
- **Probabilidades inválidas**: Si las probabilidades no suman 100%, el sistema lo avisará. Ajuste los pesos.
- **Cliente no encontrado**: Si intenta asociar un cliente que no existe, la operación fallará. Verifique el registro del cliente.

### 14.8 Recomendaciones

- Configure premios atractivos pero sostenibles para el negocio.
- Use probabilidades balanceadas para mantener el interés.
- Revise regularmente las estadísticas para ajustar la configuración.
- Anuncie la ruleta como una promoción especial.
- Use la ruleta en eventos o horarios específicos para maximizar su impacto.
- Mantenga un registro de clientes que participan para análisis de marketing.

---

## 15. Módulo de Configuración

### 15.1 Objetivo

El módulo de Configuración permite ajustar los parámetros generales del sistema, personalizando su funcionamiento según las necesidades del establecimiento.

### 15.2 Cuándo Utilizarlo

Utilice este módulo cuando:

- Necesite ajustar la configuración general del sistema.
- Quiera modificar parámetros de negocio.
- Deba configurar integraciones externas.
- Requiera actualizar la información del establecimiento.

### 15.3 Cómo Acceder

Desde el menú lateral:
1. Ubique la sección "Sistema".
2. Haga clic en "Configuración".

**Nota**: Este módulo requiere permisos de administrador.

### 15.4 Elementos de la Pantalla

#### 15.4.1 Secciones de Configuración

El módulo se divide en varias secciones:

- **General**: Información básica del establecimiento.
- **Negocio**: Parámetros de operación.
- **Sistema**: Ajustes técnicos.
- **Integraciones**: Conexiones con servicios externos.
- **Notificaciones**: Configuración de alertas.

#### 15.4.2 Configuración General

Información del establecimiento:

- **Nombre del establecimiento**: Campo para el nombre.
- **Dirección**: Dirección física.
- **Teléfono**: Número de contacto.
- **Email**: Correo electrónico del negocio.
- **Horario**: Horarios de operación.

#### 15.4.3 Configuración de Negocio

Parámetros operativos:

- **Moneda**: Moneda utilizada para precios.
- **Impuestos**: Porcentaje de impuestos aplicables.
- **Propina**: Configuración de propinas (opcional u obligatoria).
- **Métodos de pago**: Métodos aceptados.
- **Política de cancelación**: Reglas de cancelación de reservas.

#### 15.4.4 Configuración del Sistema

Ajustes técnicos:

- **Zona horaria**: Configuración de hora local.
- **Idioma**: Idioma de la interfaz.
- **Tema**: Apariencia visual del sistema.
- **Backup**: Configuración de respaldos automáticos.
- **Actualizaciones**: Preferencias de actualización.

#### 15.4.5 Integraciones

Conexiones externas:

- **Pasarelas de pago**: Configuración de pagos electrónicos.
- **Impresoras**: Configuración de impresoras de tickets.
- **Sistemas externos**: Integraciones con otros software.
- **API**: Configuración de claves de API.

#### 15.4.6 Notificaciones

Configuración de alertas:

- **Alertas de stock**: Nivel mínimo para notificaciones.
- **Alertas de reservas**: Recordatorios de reservas próximas.
- **Reportes automáticos**: Frecuencia de envío de reportes.
- **Canales de notificación**: Email, SMS, etc.

### 15.5 Flujo Completo de Uso

#### 15.5.1 Configurar Información General

1. **Acceda a General**: Seleccione la sección General.
2. **Ingrese nombre del establecimiento**: Escriba el nombre.
3. **Ingrese dirección**: Complete la dirección física.
4. **Ingrese teléfono y email**: Agregue información de contacto.
5. **Establezca horarios**: Defina los horarios de operación.
6. **Guarde**: Presione "Guardar" para aplicar los cambios.

#### 15.5.2 Configurar Parámetros de Negocio

1. **Acceda a Negocio**: Seleccione la sección Negocio.
2. **Seleccione moneda**: Elija la moneda a usar.
3. **Configure impuestos**: Establezca el porcentaje de impuestos.
4. **Configure propinas**: Defina la política de propinas.
5. **Seleccione métodos de pago**: Marque los métodos aceptados.
6. **Establezca política de cancelación**: Defina las reglas.
7. **Guarde**: Presione "Guardar" para aplicar.

#### 15.5.3 Configurar el Sistema

1. **Acceda a Sistema**: Seleccione la sección Sistema.
2. **Seleccione zona horaria**: Elija la zona horaria correcta.
3. **Seleccione idioma**: Elija el idioma de la interfaz.
4. **Seleccione tema**: Elija la apariencia visual.
5. **Configure backup**: Establezca la frecuencia de respaldos.
6. **Guarde**: Presione "Guardar" para aplicar.

#### 15.5.4 Configurar Integraciones

1. **Acceda a Integraciones**: Seleccione la sección Integraciones.
2. **Configure pasarela de pago**: Ingrese las credenciales del servicio.
3. **Configure impresoras**: Agregue las impresoras disponibles.
4. **Configure sistemas externos**: Ingrese datos de integración.
5. **Guarde**: Presione "Guardar" para aplicar.

#### 15.5.5 Configurar Notificaciones

1. **Acceda a Notificaciones**: Seleccione la sección Notificaciones.
2. **Configure alertas de stock**: Establezca el nivel mínimo.
3. **Configure alertas de reservas**: Defina el tiempo de anticipación.
4. **Configure reportes automáticos**: Establezca la frecuencia.
5. **Seleccione canales**: Marque los canales deseados.
6. **Guarde**: Presione "Guardar" para aplicar.

### 15.6 Resultado Esperado

Al completar las acciones:

- La configuración del sistema se actualizará.
- Los parámetros de negocio se aplicarán a todas las operaciones.
- Las integraciones quedarán configuradas y funcionales.
- Las notificaciones se enviarán según la configuración.
- Los cambios se reflejarán en todo el sistema.

### 15.7 Posibles Errores del Usuario

- **Datos incompletos**: Si deja campos obligatorios vacíos, el sistema le avisará. Complete todos los campos requeridos.
- **Formato inválido**: Si ingresa datos en formato incorrecto (email, teléfono), el sistema lo rechazará. Verifique el formato.
- **Credenciales incorrectas**: Si ingresa credenciales de API incorrectas, la integración fallará. Verifique los datos.
- **Configuración conflictiva**: Si configura parámetros que entran en conflicto, el sistema le avisará. Ajuste la configuración.

### 15.8 Recomendaciones

- Revise la configuración regularmente para asegurar que esté actualizada.
- Pruebe las integraciones después de configurarlas.
- Mantenga las credenciales de API seguras y actualizadas.
- Configure notificaciones apropiadas para recibir alertas importantes.
- Documente cualquier configuración personalizada para referencia futura.
- Realice respaldos antes de hacer cambios importantes en la configuración.

---

## 16. Flujo de Trabajo Recomendado

### 16.1 Proceso Típico de Atención

El flujo de trabajo recomendado para la atención diaria sigue estos pasos:

#### 16.1.1 Apertura de Turno

1. **Inicie sesión**: Acceda al sistema con sus credenciales.
2. **Revise el dashboard**: Verifique el estado general del establecimiento.
3. **Revise las reservas del día**: Consulte las reservaciones programadas.
4. **Verifique el inventario**: Revise alertas de bajo stock.
5. **Confirme disponibilidad de mesas**: Asegúrese de que las mesas estén limpias y disponibles.

#### 16.1.2 Atención de Clientes

1. **Reciba al cliente**: Salude al cliente y pregunte cuántas personas son.
2. **Asigne una mesa**: Seleccione una mesa disponible con capacidad suficiente.
3. **Tome el pedido**: Registre los productos solicitados en la orden.
4. **Envíe a cocina/bar**: Imprima la comanda para preparación.
5. **Sirva los productos**: Cuando estén listos, sírvalos al cliente.
6. **Verifique satisfacción**: Pregunte si todo está correcto.
7. **Agregue items si es necesario**: Si el cliente solicita más productos, agréguelos a la orden.

#### 16.1.3 Cierre de Orden

1. **Solicite la cuenta**: Cuando el cliente esté listo para pagar.
2. **Revise la orden**: Verifique que todos los items sean correctos.
3. **Aplique descuentos si corresponde**: Si hay promociones o descuentos aplicables.
4. **Procese el pago**: Reciba el pago según el método elegido.
5. **Genere el recibo**: Imprima o envíe el recibo al cliente.
6. **Libere la mesa**: Marque la mesa como disponible.
7. **Limpie la mesa**: Prepare la mesa para los siguientes clientes.

#### 16.1.4 Gestión de Reservas

1. **Confirme reservas**: Llame a los clientes para confirmar asistencia.
2. **Asigne mesas**: Reserve las mesas con anticipación.
3. **Reciba a los clientes con reserva**: Cuando lleguen, asigne la mesa reservada.
4. **Procese la orden**: Siga el flujo normal de atención.
5. **Libere la mesa al final**: Cuando los clientes se vayan.

#### 16.1.5 Cierre de Turno

1. **Cierre todas las órdenes**: Asegúrese de que no haya órdenes abiertas.
2. **Libere todas las mesas**: Verifique que todas las mesas estén disponibles.
3. **Revise el dashboard**: Consulte las métricas del turno.
4. **Registre movimientos de inventario**: Si hubo salidas no registradas.
5. **Cierre sesión**: Salga del sistema de manera segura.

### 16.2 Integración Entre Módulos

El sistema está diseñado para que los módulos trabajen juntos de manera integrada:

- **Pedidos ↔ Inventario**: Cada pedido reduce automáticamente el stock de los productos.
- **Pedidos ↔ Mesas**: Las órdenes se asocian a mesas específicas.
- **Reservas ↔ Mesas**: Las reservas bloquean mesas para horarios específicos.
- **Descuentos ↔ Pedidos**: Los descuentos se aplican directamente a las órdenes.
- **Productos ↔ Recetas**: Las recetas calculan el costo de los productos.
- **Empleados ↔ Turnos**: Los turnos asignan horarios a los empleados.
- **Dashboard ↔ Todos los módulos**: El dashboard muestra información agregada de todo el sistema.

### 16.3 Buenas Prácticas de Flujo de Trabajo

- **Mantenga el sistema actualizado**: Realice acciones en tiempo real, no las acumule.
- **Verifique antes de confirmar**: Revise siempre la información antes de guardar o cerrar.
- **Comunique cambios**: Si hay cambios en el menú o precios, infórmelo al equipo.
- **Revise alertas**: Preste atención a las alertas del dashboard y módulos.
- **Use el historial**: Consulte el historial cuando tenga dudas sobre acciones pasadas.
- **Mantenga el inventario actualizado**: Registre todos los movimientos de stock.

---

## 17. Gestión Diaria

### 17.1 Rutina Matutina

Al inicio del día, siga estos pasos:

1. **Inicie sesión** en el sistema.
2. **Revise el dashboard** para ver el estado general.
3. **Consulte las reservas del día** en el módulo de Reservas.
4. **Verifique el inventario** y revise alertas de bajo stock.
5. **Confirme disponibilidad de mesas** asegurándose de que estén limpias.
6. **Revise promociones activas** en el módulo de Descuentos.
7. **Verifique que los empleados** estén asignados a sus turnos.

### 17.2 Durante el Servicio

Mientras el establecimiento está en operación:

1. **Monitoree el dashboard** regularmente para detectar problemas.
2. **Asigne mesas** rápidamente a los clientes que llegan.
2. **Tome pedidos** de manera eficiente y envíelos a cocina/bar.
3. **Verifique el estado de las órdenes** para asegurar que se preparen a tiempo.
4. **Aplique descuentos** solo cuando corresponda según las promociones.
5. **Atienda reservas** en los horarios programados.
6. **Revise alertas de stock** si aparecen durante el servicio.
7. **Mantenga comunicación** con cocina/bar sobre el estado de los pedidos.

### 17.3 Rutina Vespertina

Al final del día, complete estas tareas:

1. **Cierre todas las órdenes abiertas**.
2. **Libere todas las mesas** ocupadas.
3. **Revise el dashboard** para ver las métricas del día.
4. **Registre movimientos de inventario** si hubo salidas no registradas.
5. **Verifique que no haya reservas pendientes** para el día siguiente.
6. **Revise el historial de activity** si hubo incidentes.
7. **Cierre sesión** del sistema.

### 17.4 Gestión de Incidentes

Si ocurre un incidente durante el servicio:

1. **Mantenga la calma** y evalúe la situación.
2. **Documente el incidente** en notas del sistema si es posible.
3. **Comunique al administrador** si el incidente requiere atención técnica.
4. **Contine con el servicio manual** si el sistema no está disponible.
5. **Registre las acciones** cuando el sistema esté disponible nuevamente.

---

## 18. Gestión Administrativa

### 18.1 Gestión de Empleados

La gestión efectiva del personal incluye:

- **Contratación**: Crear cuentas para nuevos empleados con roles apropiados.
- **Capacitación**: Asegurarse de que los empleados conozcan el sistema.
- **Asignación de turnos**: Configurar horarios según las necesidades del negocio.
- **Monitoreo de actividad**: Revisar regularmente la actividad de los empleados.
- **Actualización de roles**: Cambiar roles cuando las funciones cambien.
- **Desactivación**: Desactivar cuentas de empleados que ya no trabajan.

### 18.2 Gestión de Roles y Permisos

Para mantener la seguridad del sistema:

- **Asigne roles apropiados**: Cada empleado debe tener el rol que corresponda a sus funciones.
- **Revise permisos regularmente**: Asegúrese de que los permisos sean adecuados.
- **Use el principio de mínimo privilegio**: Otorgue solo los permisos necesarios.
- **Documente roles**: Mantenga un registro de qué hace cada rol.
- **Actualice permisos**: Cambie permisos cuando las funciones cambien.

### 18.3 Gestión de Turnos

Para optimizar la cobertura:

- **Planifique turnos con anticipación**: Asigne turnos según las necesidades del negocio.
- **Verifique disponibilidad**: Asegúrese de que haya suficiente personal en cada turno.
- **Ajuste según demanda**: Modifique turnos según la ocupación esperada.
- **Revise métricas de turnos**: Analice el rendimiento por turno.
- **Comunique cambios**: Informe a los empleados sobre cambios de horario.

### 18.4 Gestión de Inventario

Para mantener el stock adecuado:

- **Realice inventarios físicos**: Compare el stock del sistema con el físico regularmente.
- **Registre todos los movimientos**: No deje de registrar entradas y salidas.
- **Configure niveles apropiados**: Establezca niveles mínimo y máximo según el consumo.
- **Revise alertas**: Preste atención a las alertas de bajo stock.
- **Planifique reabastecimiento**: Compre con anticipación según las tendencias de consumo.
- **Analice tendencias**: Identifique productos que se agotan rápidamente.

### 18.5 Gestión de Productos y Menús

Para mantener el catálogo actualizado:

- **Agregue nuevos productos** cuando se incorporen al establecimiento.
- **Desactive productos** que ya no se ofrezcan.
- **Actualice precios** cuando haya cambios.
- **Revise descripciones** para asegurar que sean claras.
- **Organice menús** de manera lógica para facilitar la navegación.
- **Actualice menús según temporada** para ofrecer variedad.

---

## 19. Reportes

### 19.1 Reportes de Ventas

El sistema proporciona reportes de ventas que incluyen:

- **Ventas totales**: Monto total de ventas en un período.
- **Ventas por categoría**: Desglose de ventas por tipo de producto.
- **Ventas por producto**: Productos más vendidos.
- **Ventas por hora**: Distribución de ventas a lo largo del día.
- **Ticket promedio**: Valor promedio de cada orden.
- **Tendencias**: Evolución de ventas en el tiempo.

Para acceder a los reportes de ventas:

1. **Acceda al Dashboard**: Vaya a la pestaña "Ventas".
2. **Seleccione el rango de tiempo**: Elija el período a analizar.
3. **Revise las métricas**: Consulte los datos mostrados.
4. **Genere reporte detallado**: Presione el botón de reporte para más detalles.

### 19.2 Reportes de Inventario

Los reportes de inventario incluyen:

- **Stock actual**: Cantidad de cada producto en inventario.
- **Movimientos**: Registro de entradas y salidas.
- **Valor del inventario**: Valor total del stock.
- **Productos con bajo stock**: Alerta de productos que necesitan reabastecimiento.
- **Tendencias de consumo**: Patrones de uso de productos.

Para acceder a los reportes de inventario:

1. **Acceda al módulo de Inventario**: Vaya a la sección Gestión → Inventario.
2. **Revise el stock actual**: Consulte la lista de productos.
3. **Vea el historial**: Acceda al historial de movimientos.
4. **Filtre por fecha**: Use filtros para ver períodos específicos.

### 19.3 Reportes de Actividad

Los reportes de actividad incluyen:

- **Actividad de empleados**: Qué ha hecho cada empleado.
- **Horas trabajadas**: Tiempo de actividad en el sistema.
- **Órdenes procesadas**: Cantidad de órdenes por empleado.
- **Acciones realizadas**: Registro de todas las acciones en el sistema.

Para acceder a los reportes de actividad:

1. **Acceda al módulo de Empleados**: Vaya a la sección Sistema → Empleados.
2. **Seleccione la pestaña Actividad**: Acceda al seguimiento de actividad.
3. **Seleccione el empleado**: Elija el empleado a revisar.
4. **Revise las acciones**: Consulte el registro de actividad.

### 19.4 Reportes de Turnos

Los reportes de turnos incluyen:

- **Rendimiento por turno**: Métricas de cada turno.
- **Ventas por turno**: Monto de ventas en cada turno.
- **Órdenes por turno**: Cantidad de órdenes procesadas.
- **Eficiencia**: Comparación entre turnos.

Para acceder a los reportes de turnos:

1. **Acceda al módulo de Empleados**: Vaya a la sección Sistema → Empleados.
2. **Seleccione la pestaña Métricas de turnos**: Acceda al análisis de turnos.
3. **Seleccione el turno**: Elija el turno a analizar.
4. **Revise las métricas**: Consulte los datos mostrados.

### 19.5 Exportación de Reportes

Si el sistema permite exportar reportes:

1. **Genere el reporte**: Cree el reporte deseado.
2. **Presione "Exportar"**: Haga clic en el botón de exportación.
3. **Seleccione formato**: Elija el formato (PDF, Excel, etc.).
4. **Descargue el archivo**: El reporte se descargará a su dispositivo.

---

## 20. Preguntas Frecuentes

### 20.1 Preguntas Generales

**¿Qué hago si olvidé mi contraseña?**
Contacte al administrador del sistema. No hay función de recuperación automática por seguridad.

**¿Puedo acceder al sistema desde cualquier dispositivo?**
Sí, el sistema es accesible desde cualquier dispositivo con conexión a internet y navegador compatible.

**¿Qué navegadores son compatibles?**
Chrome, Firefox, Edge y Safari son compatibles. Se recomienda usar la versión más reciente.

**¿El sistema funciona sin internet?**
No, se requiere conexión a internet para la sincronización de datos en tiempo real.

### 20.2 Preguntas sobre Pedidos

**¿Puedo modificar una orden después de enviarla a cocina?**
Sí, puede modificar items hasta que la orden se cierre. Los cambios se comunicarán a cocina.

**¿Qué hago si un cliente cancela un pedido?**
Elimine el item de la orden. El stock se restaurará automáticamente.

**¿Puedo aplicar múltiples descuentos a una orden?**
Depende de la configuración de su rol. Algunos roles permiten múltiples descuentos, otros no.

**¿Cómo separo una cuenta entre varios clientes?**
Actualmente el sistema no soporta separación de cuentas. Debe crear órdenes separadas desde el inicio.

### 20.3 Preguntas sobre Mesas

**¿Puedo cambiar una mesa después de asignarla?**
Sí, use la función de transferencia para mover clientes a otra mesa.

**¿Qué significa cada estado de mesa?**
- Verde: Disponible
- Rojo: Ocupada
- Amarillo: En proceso
- Azul: Reservada

**¿Puedo asignar más clientes de los que permite la mesa?**
No, el sistema rechazará asignaciones que excedan la capacidad de la mesa.

### 20.4 Preguntas sobre Reservas

**¿Cómo cancelo una reserva?**
Seleccione la reserva y presione "Cancelar". La mesa asignada quedará liberada.

**¿Puedo modificar una reserva existente?**
Sí, seleccione la reserva y presione "Modificar" para cambiar fecha, hora o número de personas.

**¿El sistema avisa automáticamente sobre reservas próximas?**
Si está configurado, el sistema enviará notificaciones según la configuración de alertas.

### 20.5 Preguntas sobre Inventario

**¿Qué hago si el stock del sistema no coincide con el físico?**
Realice un ajuste de inventario ingresando el stock correcto y explicando el motivo.

**¿Cómo recibo alertas de bajo stock?**
Configure niveles de stock mínimo en el módulo de Inventario. El sistema enviará alertas cuando el stock baje de ese nivel.

**¿Puedo registrar una salida sin una orden?**
Sí, use la función de registrar salida en el módulo de Inventario y especifique el motivo.

### 20.6 Preguntas sobre Empleados

**¿Cómo cambio el rol de un empleado?**
Seleccione el empleado, presione "Editar", cambie el rol y guarde. Los permisos se actualizarán automáticamente.

**¿Puedo ver qué ha hecho un empleado?**
Sí, acceda a la sección de Actividad en el módulo de Empleados y seleccione el empleado.

**¿Qué hago si un empleado ya no trabaja aquí?**
Seleccione el empleado y cámbielo a estado "Inactivo" para desactivar su cuenta.

### 20.7 Preguntas sobre Configuración

**¿Cómo cambio la moneda del sistema?**
Acceda a Configuración → Negocio y seleccione la moneda deseada.

**¿Puedo cambiar el idioma de la interfaz?**
Acceda a Configuración → Sistema y seleccione el idioma deseado.

**¿Cómo configuro impresoras?**
Acceda a Configuración → Integraciones y agregue las impresoras disponibles.

---

## 21. Resolución de Problemas Comunes

### 21.1 Problemas de Acceso

**No puedo iniciar sesión**

- **Causa**: Credenciales incorrectas.
- **Solución**: Verifique que esté escribiendo correctamente el email y contraseña. Si el problema persiste, contacte al administrador.

**El sistema no recuerda mi sesión**

- **Causa**: La sesión expiró o las credenciales son inválidas.
- **Solución**: Inicie sesión nuevamente. Si el problema es recurrente, contacte al administrador.

**Me redirigen siempre al login**

- **Causa**: No tiene permisos para acceder a la sección solicitada.
- **Solución**: Verifique que su rol tenga acceso a esa sección. Contacte al administrador si necesita acceso adicional.

### 21.2 Problemas de Conexión

**El sistema muestra "Reconectando..."**

- **Causa**: Pérdida de conexión a internet.
- **Solución**: Verifique su conexión a internet. El sistema intentará reconectarse automáticamente.

**Los datos no se actualizan**

- **Causa**: El sistema no está sincronizando correctamente.
- **Solución**: Espere unos momentos. Si el problema persiste, recargue la página. Contacte al administrador si continúa.

**El sistema está lento**

- **Causa**: Conexión lenta o sobrecarga del servidor.
- **Solución**: Verifique su conexión a internet. Si el problema es general, espere unos momentos.

### 21.3 Problemas con Pedidos

**No puedo agregar un producto a la orden**

- **Causa**: El producto puede estar agotado o inactivo.
- **Solución**: Verifique el estado del producto en el módulo de Productos. Si está agotado, reabastezca el inventario.

**El descuento no se aplica**

- **Causa**: El descuento puede exceder los límites de su rol.
- **Solución**: Verifique los límites de descuento de su rol. Contacte al administrador si necesita límites mayores.

**No puedo cerrar la orden**

- **Causa**: Puede haber items sin procesar o la orden estar incompleta.
- **Solución**: Verifique que todos los items estén correctos y que no haya errores en la orden.

### 21.4 Problemas con Mesas

**No puedo asignar una mesa**

- **Causa**: La mesa puede estar ocupada o reservada.
- **Solución**: Seleccione otra mesa disponible o libere la ocupada primero.

**El estado de la mesa no se actualiza**

- **Causa**: Puede haber un problema de sincronización.
- **Solución**: Recargue la página. Si el problema persiste, contacte al administrador.

**No puedo transferir clientes**

- **Causa**: La mesa destino puede estar ocupada.
- **Solución**: Seleccione una mesa destino disponible.

### 21.5 Problemas con Inventario

**El stock no se actualiza después de un pedido**

- **Causa**: Puede haber un problema de configuración del producto.
- **Solución**: Verifique que el producto esté configurado para reducir stock. Contacte al administrador.

**No puedo registrar un movimiento de inventario**

- **Causa**: El stock puede ser insuficiente para una salida.
- **Solución**: Verifique el stock actual antes de registrar una salida.

**Las alertas de bajo stock no aparecen**

- **Causa**: Los niveles de stock mínimo pueden no estar configurados.
- **Solución**: Configure los niveles de stock mínimo en el módulo de Inventario.

### 21.6 Problemas con Empleados

**Un empleado no puede acceder al sistema**

- **Causa**: El empleado puede estar inactivo o tener credenciales incorrectas.
- **Solución**: Verifique que el empleado esté activo y que las credenciales sean correctas. Restablezca la contraseña si es necesario.

**Los permisos del empleado no funcionan**

- **Causa**: El rol puede no tener los permisos necesarios.
- **Solución**: Verifique la configuración de permisos del rol en el módulo de Empleados.

**No puedo ver la actividad de un empleado**

- **Causa**: Puede que no haya actividad registrada o el empleado esté inactivo.
- **Solución**: Verifique que el empleado esté activo y que haya realizado acciones en el sistema.

---

## 22. Buenas Prácticas

### 22.1 Seguridad

- **Mantenga sus credenciales seguras**: No comparta su contraseña con nadie.
- **Cierre sesión al terminar**: Salga del sistema cuando deje de usarlo, especialmente en dispositivos compartidos.
- **Use contraseñas fuertes**: Si crea contraseñas, use combinaciones de letras, números y símbolos.
- **Reporte incidentes**: Si nota actividad sospechosa, repórtela al administrador inmediatamente.

### 22.2 Operación

- **Verifique antes de confirmar**: Revise siempre la información antes de guardar o cerrar órdenes.
- **Mantenga el sistema actualizado**: Realice acciones en tiempo real, no las acumule.
- **Use el historial**: Consulte el historial cuando tenga dudas sobre acciones pasadas.
- **Comunique cambios**: Informe al equipo sobre cambios en menús, precios o procedimientos.

### 22.3 Atención al Cliente

- **Sea rápido y eficiente**: Use el sistema para agilizar el servicio.
- **Verifique las órdenes**: Asegúrese de que los pedidos sean correctos antes de enviarlos.
- **Use descuentos apropiadamente**: Aplique descuentos solo cuando corresponda según las promociones.
- **Mantenga comunicación**: Coordine con cocina/bar para asegurar un servicio fluido.

### 22.4 Gestión de Inventario

- **Registre todos los movimientos**: No deje de registrar entradas y salidas de stock.
- **Realice inventarios físicos**: Compare el stock del sistema con el físico regularmente.
- **Configure niveles apropiados**: Establezca niveles mínimo y máximo según el consumo.
- **Revise alertas**: Preste atención a las alertas de bajo stock.

### 22.5 Administración

- **Documente cambios**: Mantenga registros de cambios en configuración, roles y permisos.
- **Revise reportes regularmente**: Analice los reportes para identificar áreas de mejora.
- **Mantenga empleados actualizados**: Capacite al personal sobre el uso del sistema.
- **Planifique con anticipación**: Configure turnos, reservas y promociones con tiempo.

### 22.6 Uso del Sistema

- **Mantenga el navegador actualizado**: Use la versión más reciente de su navegador.
- **Verifique la conexión**: Asegúrese de tener una conexión estable a internet.
- **Use el tutorial**: Si es nuevo en el sistema, complete el tutorial del dashboard.
- **Reporte problemas**: Si encuentra errores o comportamientos inesperados, repórtelos al administrador.

---

## 23. Glosario

### 23.1 Términos del Sistema

- **Dashboard**: Panel principal del sistema que muestra una visión general de las operaciones.
- **Orden**: Registro de los productos solicitados por un cliente en una mesa específica.
- **Mesa**: Espacio físico donde se atiende a los clientes, con capacidad y estado específicos.
- **Reserva**: Programación anticipada de una mesa para un cliente en un horario específico.
- **Stock**: Cantidad disponible de un producto en inventario.
- **Descuento**: Reducción aplicada al precio de una orden o producto.
- **Promoción**: Oferta especial que puede incluir descuentos o beneficios adicionales.
- **Rol**: Conjunto de permisos que determina qué puede hacer un usuario en el sistema.
- **Permiso**: Autorización específica para realizar una acción en el sistema.
- **Turno**: Período de tiempo asignado a un empleado para trabajar.
- **Receta**: Conjunto de ingredientes e instrucciones para preparar un producto.
- **Inventario**: Registro de todos los productos y sus cantidades disponibles.
- **Producto**: Item que se ofrece a los clientes (bebida, comida, etc.).
- **Menú**: Organización de productos en categorías para presentación al cliente.
- **Comanda**: Orden enviada a cocina/bar para preparación.
- **Ticket**: Recibo o comprobante de una orden.
- **KPI**: Indicador clave de rendimiento, métrica para medir el desempeño.

### 23.2 Estados del Sistema

- **Activo**: Estado que indica que un elemento está disponible y en uso.
- **Inactivo**: Estado que indica que un elemento no está disponible temporalmente.
- **Ocupado**: Estado de una mesa que tiene clientes presentes.
- **Disponible**: Estado de una mesa que está libre para asignar.
- **En proceso**: Estado que indica que una acción está en curso.
- **Agotado**: Estado de un producto sin stock disponible.
- **Bajo stock**: Estado de un producto con stock por debajo del nivel mínimo.
- **Confirmado**: Estado que indica que una acción ha sido verificada y aprobada.
- **Pendiente**: Estado que indica que una acción está esperando procesamiento.
- **Cancelado**: Estado que indica que una acción ha sido anulada.

### 23.3 Abreviaturas Comunes

- **POS**: Point of Sale (Punto de Venta).
- **ERP**: Enterprise Resource Planning (Planificación de Recursos Empresariales).
- **KPI**: Key Performance Indicator (Indicador Clave de Desempeño).
- **SKU**: Stock Keeping Unit (Unidad de Mantenimiento de Inventario).
- **API**: Application Programming Interface (Interfaz de Programación de Aplicaciones).

---

## Conclusión

Este manual proporciona una guía completa para el uso del sistema Bartender Desktop. Si tiene preguntas adicionales o necesita más asistencia, contacte al administrador del sistema.

El sistema se actualiza regularmente para mejorar la experiencia del usuario. Revise este manual periódicamente para estar al tanto de las últimas funcionalidades y procedimientos.

**Versión del manual**: 1.0  
**Fecha de creación**: Junio 2026  
**Sistema**: Bartender Desktop - Nebula v3
