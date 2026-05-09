# NexoColab

Aplicación móvil P2P desarrollada como Producto Mínimo Viable (MVP) para facilitar el préstamo seguro y organizado de objetos subutilizados entre habitantes de una comunidad.

## Objetivo del proyecto

NexoColab busca fortalecer la colaboración comunitaria mediante una plataforma móvil que permita a los usuarios:

- Publicar objetos disponibles para préstamo.
- Solicitar artículos a otros usuarios.
- Gestionar solicitudes de préstamo.
- Visualizar disponibilidad de objetos.
- Promover el aprovechamiento compartido de recursos.

El proyecto fue desarrollado como parte de un trabajo académico orientado al diseño e implementación de soluciones tecnológicas colaborativas.

---

## Tecnologías utilizadas

### Frontend

- React Native
- Expo
- Expo Router
- TypeScript

### Backend y servicios

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage

### Herramientas de desarrollo

- Visual Studio Code
- Expo Go
- Expo Application Services (EAS)
- Git
- GitHub

---

## Estructura general del proyecto

```bash
app/
components/
hooks/
lib/
assets/
```

- `app/` → Pantallas y rutas principales.
- `components/` → Componentes reutilizables.
- `hooks/` → Hooks personalizados.
- `lib/` → Configuración de servicios externos.
- `assets/` → Recursos gráficos e imágenes.

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Riidexx/nexocolab-app.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el proyecto

```bash
npx expo start --tunnel
```

> Se recomienda utilizar `--tunnel` para evitar problemas de conexión entre Expo Go y la red local.

---

## Generación de APK Android

El proyecto utiliza Expo Application Services (EAS) para la generación del APK.

### Generar APK

```bash
eas build -p android --profile preview
```

---

## Funcionalidades implementadas

- Registro e inicio de sesión de usuarios.
- Publicación de objetos disponibles.
- Gestión de solicitudes de préstamo.
- Actualización automática de disponibilidad.
- Visualización de artículos publicados.
- Persistencia de datos mediante Supabase.
- Interfaz móvil basada en navegación por pestañas.
- Despliegue Android mediante APK standalone.

---

## Estado del proyecto

El proyecto corresponde a un MVP funcional validado mediante pruebas realizadas con usuarios reales pertenecientes a la comunidad objetivo.

Actualmente, la aplicación permite realizar el flujo completo de préstamo colaborativo entre usuarios dentro del entorno planteado para el proyecto académico.

---

## Repositorio oficial

https://github.com/Riidexx/nexocolab-app

---

## Autores

Proyecto académico desarrollado por el equipo NexoColab.
