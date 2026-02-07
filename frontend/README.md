# Cedar — Frontend

Climate-informed lending platform. React + Vite.

## Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173/** (or the port Vite prints). You should see the **Welcome** page (video background, Cedar logo, “Click to start”). If you still see the old UI, do a **hard refresh** (Mac: Cmd+Shift+R, Windows: Ctrl+Shift+R) or stop and run `npm run dev` again.

- **/** = Welcome (logo + video + Click to start)
- **/login** = Sign in (after “Click to start”)
- **/app** = Main app (after login)

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
