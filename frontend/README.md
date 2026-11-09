# OrderFlow Frontend

Interfaz web de OrderFlow, desarrollada con React, TypeScript, Vite y Lucide React.

## Módulos incluidos

- **Dashboard:** indicadores generales, actividad semanal y pedidos recientes.
- **Pedidos:** búsqueda, filtro por estado, registro de pedidos y cambio de estado.
- **Promociones:** creación de promociones y activación/desactivación.
- **Monitoreo:** vista demostrativa de los bundles y referencias OSGi.
- **Configuración:** datos de perfil y preferencias de interfaz.

## Requisitos

- Node.js 20.19+ o una versión compatible más reciente.
- npm.

## Instalación y ejecución

Desde la carpeta `frontend`:

```powershell
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Comprobar la compilación

```powershell
npm run build
```

Para previsualizar la versión compilada:

```powershell
npm run preview
```

## Datos y conexión con OSGi

En esta entrega, los módulos de la interfaz utilizan datos de demostración en memoria y guardan pedidos y promociones en el almacenamiento local del navegador. Esto permite probar la navegación y las operaciones principales sin depender de un servidor HTTP.

El backend existente expone servicios OSGi (`OrderService` y `PromotionService`) dentro de Apache Karaf. Un navegador no consume directamente servicios OSGi; para integrar los datos reales se debe agregar una capa HTTP/REST (por ejemplo, un bundle OSGi que publique endpoints) y configurar `VITE_API_URL`.

La pantalla de Monitoreo también es demostrativa: muestra el estado de referencia esperado, pero no consulta Karaf en tiempo real.

## Estructura

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts
```
