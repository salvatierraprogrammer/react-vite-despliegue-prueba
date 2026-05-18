# El Canal del AT
s
Plataforma web que conecta Acompañantes Terapéuticos (AT) con reclutadores y familias, permitiendo la publicación de casos, postulación y gestión de perfiles profesionales.

## Características Principales

### Roles de Usuario
- **Guest**: Visitantes que pueden buscar trabajo o acompañantes
- **Acompañante Terapéutico (Empleado)**: Profesionales que buscan casos
- **Reclutador**: Publica casos y recibe CVs
- **Administrador**: Gestiona usuarios y contenido

### Funcionalidades

#### Para Acompañantes Terapéuticos
- Crear y editar perfil laboral
- Buscar trabajos disponibles
- Postularse a casos (enviar CV)
- Ver CVs enviados
- Generar flyer profesional
- **Descargar flyer como imagen PNG**

#### Para Reclutadores
- Publicar casos/laborales con límites
- Gestionar publicaciones
- Recibir y visualizar CVs
- Buscar acompañantes
- **Generar flyers personalizados** con múltiples diseños
- **Compartir en redes sociales** (WhatsApp, Facebook)
- **Exportar a PDF/Imagen** para difusión

### Límites del Sistema
- Los reclutadores tienen límite de publicaciones activas
- Al alcanzar el límite, deben esperar o pausar publicaciones
- Sistema de bloqueo temporal

## Tecnologías

- **Frontend**: React 18 + Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Authentication + Firestore)
- **Estilos**: Bootstrap, Emotion
- **Alertas**: SweetAlert2
- **Generación de Flyers**: html2canvas (exportar a PNG)
- **Compartición**: WhatsApp API, Facebook, portapapeles
- **Alertas**: SweetAlert2
- **Routing**: React Router DOM v7

## Estructura del Proyecto

```
src/
├── asset/           # Recursos estáticos (logos, imágenes)
├── auth/            # Componentes de autenticación
│   ├── CrearCuenta.jsx
│   └── Login.jsx
├── components/      # Componentes de la aplicación
│   ├── css/         # Estilos de componentes
│   ├── Administrador.jsx
│   ├── BotonCompartir.jsx    # Compartir en redes sociales
│   ├── BuscarAcompanante.jsx
│   ├── BuscarTrabajo.jsx
│   ├── CardAcompaniante.jsx
│   ├── CardReclutador.jsx
│   ├── CvEnviados.jsx
│   ├── CvRecibido.jsx
│   ├── EditarPerfilLaboral.jsx
│   ├── GenerarFlyer.jsx       # Generador de flyers con export
│   ├── Iniciar.jsx
│   ├── MiCuenta.jsx
│   ├── MisPublicaciones.jsx
│   ├── NuevaPublicacion.jsx
│   ├── ShowPerfilAt.jsx
│   ├── VerCaso.jsx
│   └── ...
├── data/            # Datos de configuración
├── firebaseConfg/   # Configuración de Firebase
├── layout/          # Layout principal
│   ├── Header.jsx
│   └── Footer.jsx
├── App.jsx          # Componente principal
└── main.jsx         # Punto de entrada
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/acompaniante-terapeutico` | Información del AT |
| `/buscar-trabajo` | Buscar casos como empleado |
| `/buscar-acompanante` | Buscar ATs como reclutador |
| `/showPerfil/:id` | Ver perfil de AT |
| `/misPublicaciones` | Gestión de publicaciones |
| `/nuevaPublicacion` | Crear nueva publicación |
| `/miCuenta` | Mi cuenta de usuario |
| `/cvEnvidos` | CVs enviados |
| `/cv-recibido` | CVs recibidos |
| `/perfilLaboralUpdate` | Editar perfil laboral |
| `/crear-perfil-laboral` | Crear perfil laboral |
| `/login` | Iniciar sesión |
| `/crearCuenta` | Crear cuenta |
| `/admin` | Panel de administrador |
| `/usuarios-nuevos` | Ver usuarios nuevos |
| `/generarFlyer/:id` | Generar flyer |
| `/verCaso/:id` | Ver detalle de caso |

## Funcionalidades Avanzadas

### Generador de Flyers
- **Múltiples diseños**: Selección de fondos personalizables
- **Fuentes variables**: Cambio de tipografía
- **Colores de texto**: Personalización de colores
- **Títulos dinámicos**: Diferentes opciones de encabezado
- **Exportación PNG**: Descarga directa como imagen
- **Compartir en redes**: WhatsApp, Facebook
- **Copiar al portapapeles**: Mensajes listos para pegar

### Sistema de Límites
- Reclutadores: límite de publicaciones activas configurables
- Al alcanzar el límite: bloqueo temporal o pausa obligatoria
- Notificaciones de estado de cuenta

### Gestión de CVs
- Envío de postulaciones desde perfiles de AT
- Recepción y revisión de CVs por reclutadores
- Historial de envíos
- **Adjuntar archivos PDF/Word** a las postulaciones
- **Almacenamiento en Firebase Storage** para CVs

### Colecciones Firestore + Storage

- `usuarios`: Perfiles de usuario
- `publicaciones`: Casos/laborales publicados
- `mailEnviadosPostulado`: Postulaciones con CVs
- `perfilesLaborales`: Perfiles profesionales de ATs
- Firebase Storage: Archivos CVs (PDF/Word)

## Screenshot

El proyecto incluye diseño responsive con:
- Header fijo con navegación según rol
- Footer con información del sitio
- Cards para listados
- Modal para detalles
- Formularios para creación/edición

## Autor

Desarrollado para la comunidad de Acompañantes Terapéuticos
