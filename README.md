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
*   **Arquitectura Híbrida**: Resiliencia total con base de datos primaria en Proxmox y failover automático a Supabase.
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
*   **Failover Inteligente**: El sistema detecta si el servidor primario cae y cambia automáticamente a la réplica en la nube.
*   **Sincronización Bidireccional**: Workflows de n8n mantienen los datos sincronizados entre entornos.
*   **Seguridad**: Autenticación robusta y protección de endpoints.

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
| **Frontend** | React 18 + TypeScript | Lógica de interfaz robusta y tipada. |
| **Build Tool** | Vite | Compilación ultrarrápida y HMR. |
| **Estilos** | TailwindCSS | Diseño responsivo y sistema de diseño consistente. |
| **Base de Datos 1** | PostgreSQL (Proxmox) | Base de datos primaria de alto rendimiento. |
| **Base de Datos 2** | Supabase | Réplica en la nube para failover y acceso global. |
| **Backend** | Node.js + Express | API Gateway y lógica de negocio. |
| **Automations** | n8n | Sincronización de datos y webhooks. |

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

```bash
npm run build
# Los archivos estáticos se generarán en la carpeta /dist
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
