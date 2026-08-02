<div align="center">
  <!-- Reemplaza con tu logo real si lo tienes en /public/img/logo.png -->
  <br />
  <h1 style="font-size: 3rem; font-weight: 900;">EAJMUSIC Platform</h1>
  
  <br />
  
  **La Nueva Era de la Distribución Musical en Puerto Rico**
  <br />
  *Gestiona lanzamientos, regalías y analíticas en una plataforma híbrida de alto rendimiento.*

  <br />
  <br />

  ![Version](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge&logo=git)
  ![Status](https://img.shields.io/badge/Estado-Producción-success?style=for-the-badge)
  ![Stack](https://img.shields.io/badge/Tech-React_|_Vite_|_Hybrid_DB-61DAFB?style=for-the-badge&logo=react)
  ![License](https://img.shields.io/badge/Licencia-Proprietaria-red?style=for-the-badge)
</div>

---

## 📋 Descripción del Proyecto

**EAJMUSIC** es más que una distribuidora; es un ecosistema tecnológico diseñado para el artista independiente moderno. Nuestra plataforma elimina los intermediarios innecesarios, ofreciendo:

*   **Distribución Global**: Acceso a Spotify, Apple Music, TikTok y 150+ tiendas.
*   **Pagos Locales**: Integración nativa con **ATH Móvil** para artistas en PR.
*   **Infraestructura propia**: API y base de datos (PostgreSQL + MinIO) en contenedores propios, expuestos vía Cloudflare Tunnel.
*   **Soporte 24/7**: Canales directos vía WhatsApp y sistema de tickets.

---

## ✨ Características Principales

### 🎵 Para el Artista (Dashboard)
*   **Gestión de Lanzamientos**: Sube singles y álbumes con validación de metadatos en tiempo real.
*   **Wallet & Regalías**: Visualiza tus ganancias y solicita retiros directos a tu banco local.
*   **Smart Analytics**: (Próximamente) Gráficos interactivos de rendimiento por país y plataforma.

### 🏢 Páginas Públicas (Marketing)
*   **Diseño Premium**: Interfaz moderna en **Dark Mode permanente** para una experiencia inmersiva.
*   **Información Clara**: Páginas dedicadas de *About Us*, *Support*, *Terms* y *Privacy Policy*.
*   **Navegación Fluida**: SPA (Single Page Application) optimizada con Vite.

### ⚙️ Ingeniería & Backend
*   **Auth vía InsForge**: Signup, login, OAuth (Google/GitHub), verificación de email y reset de contraseña delegados a InsForge; el resto de la lógica de negocio la sirve la API propia.
*   **Automatizaciones**: Workflows de n8n para sincronización de datos entre servicios.
*   **Seguridad**: CSP real por header HTTP, HSTS, y protección de endpoints vía RBAC.

---

## 📸 Galería de Interfaz

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Home & Landing</b></td>
      <td align="center"><b>Dashboard de Artista</b></td>
    </tr>
    <tr>
      <td><img src="https://placehold.co/600x400/101010/FFFFFF/png?text=Marketing+Home" width="400" alt="Home Page"></td>
      <td><img src="https://placehold.co/600x400/101010/FFFFFF/png?text=Artist+Dashboard" width="400" alt="Artist Dashboard"></td>
    </tr>
    <tr>
      <td align="center"><b>Centro de Soporte</b></td>
      <td align="center"><b>Gestión de Música</b></td>
    </tr>
    <tr>
      <td><img src="https://placehold.co/600x400/101010/FFFFFF/png?text=Support+Center" width="400" alt="Support Page"></td>
      <td><img src="https://placehold.co/600x400/101010/FFFFFF/png?text=Music+Upload" width="400" alt="Upload Flow"></td>
    </tr>
  </table>
</div>

---

## 🛠 Stack Tecnológico

Construido con las herramientas más modernas para asegurar velocidad, escalabilidad y mantenibilidad.

| Área | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Lógica de interfaz robusta y tipada. |
| **Build Tool** | Vite | Compilación ultrarrápida y HMR. |
| **Estilos** | TailwindCSS | Diseño responsivo y sistema de diseño consistente. |
| **Auth** | InsForge | Signup/login/OAuth/verificación de email/reset de contraseña. |
| **Base de Datos** | PostgreSQL + MinIO | Datos de negocio y almacenamiento de archivos, en infraestructura propia. |
| **Backend** | Node.js + Express + Prisma | API (repo separado: `eajmusic-api`). |
| **Automations** | n8n | Sincronización de datos y webhooks. |

> Este repositorio contiene solo el frontend (tres builds de Vite independientes). El backend (`eajmusic-api`) vive en un repositorio aparte.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
*   Node.js v18+
*   NPM v9+

### Pasos para Desarrollo Local

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/EAJRD/EAJMUSIC-PAGE-COMPLATE-V1.git
    cd EAJMUSIC-PAGE-COMPLATE-V1
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` basado en `.env.example`:
    ```bash
    cp .env.example .env
    ```

4.  **Iniciar Servidor de Desarrollo**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

### Build para Producción

El proyecto sirve tres subdominios reales desde tres document roots independientes en Hostinger (`eajmusic.com`, `artist.eajmusic.com`, `eaj.eajmusic.com`), así que `npm run build` genera **tres builds de Vite independientes**, cada uno con su propio `VITE_APP_MODE` inyectado en tiempo de build para que el código de las otras dos apps quede fuera del bundle (tree-shaking real, no solo ruteo en runtime):

```bash
npm run build
# Equivale a: npm run build:main && npm run build:artist && npm run build:eaj
#   dist/main/   -> eajmusic.com        (VITE_APP_MODE=main)
#   dist/artist/ -> artist.eajmusic.com (VITE_APP_MODE=artist)
#   dist/eaj/    -> eaj.eajmusic.com    (VITE_APP_MODE=admin)

npm run build:main    # solo el sitio de marketing
npm run build:artist  # solo el dashboard de artistas
npm run build:eaj     # solo el panel admin (eaj)
```

---

## 🔮 Roadmap y Futuro

* [x] **Fase 1**: Lanzamiento de páginas de marketing y dashboard básico.
* [x] **Fase 2**: Implementación de arquitectura de base de datos híbrida.
* [ ] **Fase 3**: Integración completa de pasarela de pagos (ATH Móvil API).
* [ ] **Fase 4**: App nativa para iOS y Android.

---

<div align="center">
  <p>Desarrollado con ❤️ en Puerto Rico por <b>EAJRD</b></p>
  <p><i>"Donde la música local se hace global."</i></p>
  
  <a href="https://eajmusic.com">www.eajmusic.com</a>
</div>
