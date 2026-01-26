<div align="center">
  <img src="./img/logo.png" alt="Logo EAJ Music" width="200" height="auto" />
  
  <br />
  
  # EAJ Music Dashboard
  
  **Plataforma de Gestión y Distribución Musical para Artistas**

  ![Version](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)
  ![Status](https://img.shields.io/badge/Estado-Beta%20Privada-orange?style=for-the-badge)
  ![License](https://img.shields.io/badge/Licencia-Proprietaria-red?style=for-the-badge)
</div>

---

## 📋 Descripción del Proyecto

**EAJ Music** es una plataforma web integral diseñada para empoderar a los artistas y sellos discográficos. A diferencia de un simple reproductor, este sistema funciona como un **centro de comando (Dashboard)** donde los músicos pueden gestionar sus lanzamientos, monitorear sus ganancias en tiempo real y analizar el rendimiento de sus pistas.

La interfaz ha sido construida con un enfoque "Mobile-First", garantizando una experiencia fluida tanto en dispositivos móviles como en escritorio, con un diseño moderno en modo oscuro (Dark Mode).

---

## ✨ Características Principales

Basado en la versión actual (V1), la plataforma incluye:

### 📊 1. Panel de Control (Dashboard)
* **Vista General**: Resumen inmediato de reproducciones totales (*Total Streams*) y lanzamientos activos.
* **Smart Greetings**: Bienvenida personalizada al artista.

### 💰 2. Billetera y Pagos (Wallet)
* **Balance en Tiempo Real**: Visualización clara del dinero disponible para retiro.
* **Sistema de Auditoría**: Fechas claras para las próximas auditorías de regalías.
* **Historial**: Acceso a transiciones y botón para solicitar pagos (*Request Payout*).

### 🚀 3. Gestión de Lanzamientos
* **Creador de Lanzamientos**: Flujo paso a paso (Wizard) para subir nueva música.
* **Metadatos Completos**: Soporte para Título, Artista Principal, Género, Tipo de lanzamiento (Single/EP) y fechas de lanzamiento.
* **Validaciones**: Reglas de negocio integradas (ej. "Min 21 days lead time").

### 📈 4. Analíticas y Datos (Playback Data)
* **Top Tracks**: Lista rankeada de las canciones con mejor rendimiento.
* **Integración de Datos**: Preparado para visualizar gráficos interactivos (conectado vía Webhooks/n8n).

---

## 📸 Galería de Interfaz

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Dashboard Principal</b></td>
      <td align="center"><b>Billetera (Wallet)</b></td>
    </tr>
    <tr>
      <td><img src="./img/screenshot_dashboard.png" width="300" alt="Dashboard View"></td>
      <td><img src="./img/screenshot_wallet.png" width="300" alt="Wallet View"></td>
    </tr>
    <tr>
      <td align="center"><b>Nuevo Lanzamiento</b></td>
      <td align="center"><b>Analíticas</b></td>
    </tr>
    <tr>
      <td><img src="./img/screenshot_release.png" width="300" alt="New Release Flow"></td>
      <td><img src="./img/screenshot_data.png" width="300" alt="Analytics View"></td>
    </tr>
  </table>
</div>

> *Nota: Las imágenes representan la interfaz de usuario actual en dispositivos móviles.*

---

## 🛠 Stack Tecnológico

El proyecto utiliza tecnologías web modernas para asegurar rendimiento y escalabilidad:

* **Frontend**: HTML5, CSS3 (Custom Properties para Dark Mode), JavaScript (ES6+).
* **Diseño**: CSS Grid & Flexbox para layout responsivo.
* **Integraciones**: 
    * Webhook Ready (n8n integration placeholders).
    * Gestión de formularios dinámicos.

---

## 🚀 Instalación y Despliegue

Sigue estos pasos para levantar el proyecto en tu entorno local:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/EAJRD/EAJMUSIC-V1.git](https://github.com/EAJRD/EAJMUSIC.git)
    ```
2.  **Entrar al directorio**
    ```bash
    cd EAJMUSIC
    ```
3.  **Ejecutar**
    * Abre el archivo `index.html` en tu navegador.
    * Recomendado: Usar "Live Server" en VSCode para simular el entorno de servidor.

---

## 🔮 Roadmap (Próximos Pasos)

* [ ] Integración completa con API de distribución.
* [ ] Visualización de gráficos con Chart.js o D3.js.
* [ ] Sistema de autenticación de usuarios (Login/Register).
* [ ] Modo claro (Light Mode).

---

<div align="center">
  <p>Desarrollado con ❤️ por <b>EAJRD</b></p>
  <p><i>Empoderando a la próxima generación de artistas.</i></p>
</div>
