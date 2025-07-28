
````markdown
# Ollama Messenger Chat

A Windows Live Messenger-inspired React chat UI that connects to a local Ollama server via an Express proxy.

## Features

- Retro Messenger-style chat interface
- English and Spanish support
- Dark and light mode
- Nudge feature with sound and animation
- Mobile responsive design
- Language toggle and sound notifications

## Getting Started

**Requirements**

- Node.js and npm
- Ollama installed and running
- Express proxy server
- Sound files in `public/assets/` (`nudge.mp3`, `alert.mp3`)

**Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/ollama-chat.git
cd ollama-chat
````

**Install dependencies**

```bash
npm install
```

**Add sound files**

Place `nudge.mp3` and `alert.mp3` in `public/assets/`.

**Start Ollama server**

```bash
ollama serve
```

**Start the Express proxy**

```bash
node proxy.js
```

**Start React app for development**

```bash
npm start
```

**Build for production**

```bash
npm run build
```

Deploy the `build/` folder to your hosting (for example, Vercel).

## Deployment on Vercel

1. Push your project to GitHub.
2. Import the repo in Vercel.
3. In `App.js`, set `baseUrl` to your public IP and proxy port:

   ```js
   const baseUrl = 'http://YOUR_PUBLIC_IP:5000';
   ```
4. Make sure your PC with Ollama and the proxy is online and accessible.

## Notes

* Your PC must be online and ports open for external access.
* For LAN use only, you can use your local IP.
* On iPhone/iOS Safari, tap anywhere in the app to enable sound.

## Credits

Sounds: Microsoft Messenger, open source sound libraries

---

# Español

Una interfaz de chat tipo Windows Live Messenger hecha en React, conectada a un servidor Ollama local mediante un proxy Express.

## Funcionalidades

* Estilo clásico Messenger
* Soporte para español e inglés
* Modo claro y oscuro
* Botón de zumbido con sonido y animación
* Diseño responsive para móviles
* Cambio de idioma y notificaciones de sonido

## Cómo empezar

**Requisitos**

* Node.js y npm
* Ollama instalado y corriendo
* Proxy Express configurado
* Archivos de sonido en `public/assets/` (`nudge.mp3`, `alert.mp3`)

**Clona el repositorio**

```bash
git clone https://github.com/TU_USUARIO/ollama-chat.git
cd ollama-chat
```

**Instala dependencias**

```bash
npm install
```

**Agrega archivos de sonido**

Coloca `nudge.mp3` y `alert.mp3` en `public/assets/`.

**Inicia el servidor Ollama**

```bash
ollama serve
```

**Inicia el proxy Express**

```bash
node proxy.js
```

**Inicia la app React en desarrollo**

```bash
npm start
```

**Compila para producción**

```bash
npm run build
```

Sube la carpeta `build/` al hosting de tu preferencia (por ejemplo, Vercel).

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. En `App.js`, ajusta `baseUrl` a tu IP pública y puerto del proxy:

   ```js
   const baseUrl = 'http://TU_IP_PUBLICA:5000';
   ```
4. Asegúrate de que tu PC con Ollama y el proxy estén encendidos y accesibles.

## Notas

* Tu PC debe estar encendida y con los puertos abiertos para acceso externo.
* Para uso solo en red local, puedes usar tu IP local.
* En iPhone/iOS Safari, toca la app para habilitar el sonido.

## Créditos

Sonidos: Microsoft Messenger, bibliotecas de sonido de código abierto

```
```
