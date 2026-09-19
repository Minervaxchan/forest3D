// Vite's base is "/" locally and "/forest3D/" on GitHub Pages.
export const assetUrl = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
