/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/admin/components/peliculas/listar-pelicula/*.{html,ts}",
    "./src/app/admin/components/actores/crear-actor.component/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

