// Vite asset URL imports
declare module '*.css?url' {
  const url: string;
  export default url;
}
