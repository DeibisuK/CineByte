import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Movie } from '../../../../core/models/movie.model';
@Injectable({
  providedIn: 'root'
})

export class MovieService {
private peliculas: Movie[] = [
  {
    id: 1,
    img: 'https://i.pinimg.com/originals/e7/b6/70/e7b670c72cd5a8a683dc9f6c05db801e.jpg',
    etiqueta: ['ESTRENO', '3D'],
    titulo: 'Once Upon a Time in Hollywood',
    descripcion: 'Una comedia dramática de Quentin Tarantino ambientada en el Hollywood de 1969.Una comedia dramática de Quentin Tarantino ambientada en el Hollywood de 1969.',
    edad: 6,
    duracion: '2 hr 41 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Comedia', 'Drama'],
    img_dsc: ['https://screenhub.blog/wp-content/uploads/2021/07/cliff-and-rick-once-upon-a-time-in-hollywood.png',
      'https://m.media-amazon.com/images/S/pv-target-images/ca6f4ba4e92bc67bb4c36ff3b002d0300f10387afbec9a4efff8a76ec5a71f06.jpg'
    ],
    trailer: 'ELeMaP8EPAA',
    precio: 6,
    enCartelera: true,
    fechaEstreno: new Date('2025-06-15')
  },
  {
    id: 2,
    img: 'https://w0.peakpx.com/wallpaper/565/627/HD-wallpaper-alien-covenant-2017-2017-alien-covenant-movie-poster.jpg',
    etiqueta: ['CLÁSICO','+18'],
    titulo: 'Alien',
    descripcion: 'La icónica película de ciencia ficción y terror dirigida por Ridley Scott.',
    edad: 18,
    duracion: '1 hr 57 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Ciencia ficción', 'Terror'],
    trailer: 't8NSgP1ugoU',
    img_dsc:[],
    precio: 5,
    enCartelera: true,
    fechaEstreno: new Date('1979-05-25')
  },
  {
    id: 3,
    img: 'https://c4.wallpaperflare.com/wallpaper/343/846/438/joker-2019-movie-joker-joaquin-phoenix-men-makeup-hd-wallpaper-preview.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Joker',
    descripcion: 'La historia de origen de uno de los villanos más famosos de DC, protagonizada por Joaquin Phoenix.',
    edad: 16,
    duracion: '2 hr 2 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Drama', 'Crimen', 'Psicológico'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2019-10-04')
  },
  {
    id: 4,
    img: 'https://wallpapers.com/images/hd/makoto-shinkai-your-name-poster-yd4rjkxb6z58fxgs.jpg',
    etiqueta: ['EXCLUSIVO'],
    titulo: 'Your Name',
    descripcion: 'Un anime romántico y de fantasía sobre dos jóvenes que intercambian cuerpos misteriosamente.',
    edad: 12,
    duracion: '1 hr 46 min',
    idiomas: ['Español Latino', 'Japonés', 'Inglés'],
    generos: ['Animación', 'Romance', 'Fantasía'],
    precio: 6,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2016-08-26')
  },
  {
    id: 5,
    img: 'https://m.media-amazon.com/images/M/MV5BYzFjMzNjOTktNDBlNy00YWZhLWExYTctZDcxNDA4OWVhOTJjXkEyXkFqcGc@._V1_.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Minecraft Movie',
    descripcion: 'Ohh, hermano, no me digas que hay un creeper detras mio.',
    edad: 7,
    duracion: '1 hr 40 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Aventura', 'Fantasía', 'Familiar'],
    precio: 7,
    img_dsc: ['https://variety.com/wp-content/uploads/2025/03/Minecraft-Movie-3.jpg',
      'https://theartsshelf.com/wp-content/uploads/2024/09/A-Minecraft-Movie-1920x1080.jpg'
    ],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-06-12')
  },
  {
    id: 6,
    img: 'https://www.laguiadelvaron.com/wp-content/uploads/2019/07/portadas-pel%C3%ADculas-iguales-www.laguiadelvaron-15.jpg',
    etiqueta: ['EXCLUSIVO'],
    titulo: 'Aladdin',
    descripcion: 'La versión live-action del clásico animado de Disney, llena de magia y aventuras.',
    edad: 7,
    duracion: '2 hr 8 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Aventura', 'Fantasía', 'Familiar'],
    precio: 6,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2019-05-24')
  },
  {
    id: 7,
    img: 'https://m.media-amazon.com/images/I/71niXI3lxlL._AC_SL1183_.jpg',
    etiqueta: ['ESTRENO', '3D'],
    titulo: 'The Avengers: Endgame',
    descripcion: 'El épico final de la saga Infinity de Marvel Studios.',
    edad: 13,
    duracion: '3 hr 1 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Acción', 'Ciencia ficción', 'Aventura'],
    precio: 8,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2019-04-26')
  },
  {
    id: 8,
    img: 'https://pics.filmaffinity.com/Ballerina-660408782-large.jpg',
    etiqueta: ['ESTRENO', '3D'],
    titulo: 'Ballerina',
    descripcion: 'Spin‑off de John Wick protagonizado por Ana de Armas como una bailarina‑asesina en busca de venganza.',
    edad: 16,
    duracion: '1 hr 45 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Acción', 'Thriller'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-06-07')
  },
  {
    id: 9,
    img: 'https://pics.filmaffinity.com/sirat-867910558-large.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Sirât',
    descripcion: 'Drama contemplativo de Oliver Laxe que muestra un viaje interior y exterior por el desierto africano.',
    edad: 13,
    duracion: '2 hr 10 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Drama'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2024-09-13')
  },
  {
    id: 10,
    img: 'https://lamoralejamagazine.com/storage/84nDGgk2j0YDx6TNB0hbFrpQ06VsCX-metaTWlja2V5IDE3IExhIE1vcmFsZWphIE1hZ2F6aW5lLmpwZw==-.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Mickey 17',
    descripcion: 'Ciencia ficción de Bong Joon‑ho sobre un astronauta “prescindible” que se reconstituye tras cada muerte.',
    edad: 13,
    duracion: '1 hr 55 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Ciencia ficción', 'Drama'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-01-31')
  },
  {
    id: 11,
    img: 'https://stars-my-destination.com/wp-content/uploads/2025/01/image-103.png',
    etiqueta: ['ESTRENO'],
    titulo: 'Hombre lobo',
    descripcion: 'Reinicio del clásico de terror, sigue a un padre que se convierte en hombre lobo tras infectarse.',
    edad: 16,
    duracion: '1 hr 50 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Terror', 'Drama'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-10-31')
  },
  {
    id: 12,
    img: 'https://images.justwatch.com/poster/324784749/s718/la-furia-2025.jpg',
    etiqueta: ['ESTRENO', '+18', '3D'],
    titulo: 'La furia',
    descripcion: 'Drama español que retrata la rabia y sanación de una joven tras una agresión sexual.',
    edad: 18,
    duracion: '1 hr 38 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Drama'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-03-14')
  },
  {
    id: 13,
    img: 'https://m.media-amazon.com/images/M/MV5BNzBkMDZiOTYtN2U0Zi00NWU4LWFkMmYtZTUwOGYwZGE2NjdhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Mala influencia',
    descripcion: 'Romance/Drama español basado en una novela de Wattpad sobre pareja con dinámicas tóxicas.',
    edad: 16,
    duracion: '1 hr 42 min',
    idiomas: ['Español Latino', 'Inglés'],
    generos: ['Romance', 'Drama'],
    precio: 7,
    img_dsc: [],
    trailer: '',
    enCartelera: true,
    fechaEstreno: new Date('2025-02-21')
  },
  {
  id: 14,
  img: 'https://uip.com.co/veacine/wp-content/uploads/sites/4/2025/02/El-ultimo-viaje-pelicula-estreno-poster.webp',
  etiqueta: ['PRÓXIMO ESTRENO'],
  titulo: 'El Último Viaje',
  descripcion: 'Una emocionante aventura de ciencia ficción sobre un grupo de exploradores en busca de un nuevo hogar para la humanidad.',
  edad: 12,
  duracion: '2 hr 10 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Ciencia ficción', 'Aventura'],
  precio: 8,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-08-15')
},
{
  id: 15,
  img: 'https://cloudfront-eu-central-1.images.arcpublishing.com/diarioas/F3XTQJVLDFBGVIQPBNS4DWWMPU.jpg',
  etiqueta: ['PRÓXIMAMENTE'],
  titulo: '28 años después',
  descripcion: 'Tercera entrega postapocalíptica de “28 Days Later”, dirigida por Danny Boyle.',
  edad: 16,
  duracion: '2 hr 10 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Terror', 'Ciencia ficción'],
  precio: 8,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-08-22')
},
{
  id: 16,
  img: 'https://i.pinimg.com/736x/73/58/03/735803f35b98b043ff0e0c64d1f24ca0.jpg',
  etiqueta: ['PRÓXIMAMENTE'],
  titulo: 'Jurassic World Rebirth',
  descripcion: 'Nueva entrega de la saga Jurassic World, dirigida por Gareth Edwards con un elenco renovado.',
  edad: 13,
  duracion: '2 hr 15 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Aventura', 'Ciencia ficción'],
  precio: 8,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-12-19')
},
{
  id: 17,
  img: 'https://m.media-amazon.com/images/M/MV5BNmQxMTI1YmEtOGY3Yi00NzVlLWEzMjAtYTI1NWZkNDFiMDg1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
  etiqueta: ['PRÓXIMAMENTE'],
  titulo: 'Materialists',
  descripcion: 'Comedia romántica de A24 dirigida por Celine Song, protagonizada por Dakota Johnson, Chris Evans y Pedro Pascal.',
  edad: 15,
  duracion: '1 hr 50 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Comedia', 'Romance'],
  precio: 7,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-09-12')
},
{
  id: 18,
  img: 'https://m.media-amazon.com/images/M/MV5BNTBiYWJlMjQtOTIyMy00NTY4LWFhOWItOWZhNzc3NGMyMjc2XkEyXkFqcGc@._V1_.jpg',
  etiqueta: ['PRÓXIMAMENTE'],
  titulo: 'KPop Demon Hunters',
  descripcion: 'Animación fantástica y musical de Netflix sobre un grupo de cazadores de demonios K‑Pop.',
  edad: 10,
  duracion: '1 hr 40 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Animación', 'Fantasía', 'Musical'],
  precio: 7,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-11-07')
},
  // Evento: Concierto en cines
{
  id: 19,
  img: 'https://m.media-amazon.com/images/M/MV5BZDlkMDFiOGMtNmU0MS00Y2Q5LTk3YTQtYmQwZTFhOGRjMjM3XkEyXkFqcGc@._V1_.jpg',
  etiqueta: ['EVENTO', 'ÚNICA FUNCIÓN'],
  titulo: 'Coldplay: Music of the Spheres Live at River Plate',
  descripcion: 'Vive en cines el espectacular concierto de Coldplay grabado en el estadio River Plate de Buenos Aires durante su gira mundial.',
  edad: 10,
  duracion: '2 hr 20 min',
  idiomas: ['Inglés', 'Español Subtítulos'],
  generos: ['Concierto', 'Música', 'Evento'],
  precio: 12,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2024-04-19'),
  esEvento: true
},
  // Evento: Documental de vida de famoso
{
  id: 20,
  img: 'https://m.media-amazon.com/images/S/pv-target-images/00d70fcc09ac01423fac25820cfac6d6b735895d07598efcfada905729d75559.jpg',
  etiqueta: ['EVENTO', 'SOLO UNA NOCHE'],
  titulo: 'Amy',
  descripcion: 'Documental ganador del Oscar sobre la vida y carrera de la cantante Amy Winehouse, con imágenes inéditas y testimonios cercanos.',
  edad: 15,
  duracion: '2 hr 8 min',
  idiomas: ['Inglés', 'Español Subtítulos'],
  generos: ['Documental', 'Música', 'Biografía'],
  precio: 10,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2015-07-03'),
  esEvento: true
},
{
  id: 21,
  img: 'https://es.web.img3.acsta.net/pictures/14/06/20/13/56/179267.jpg',
  etiqueta: ['ESPECIAL', 'RE-ESTRENO'],
  titulo: 'Spider-Man 2 (2004) - Reestreno',
  descripcion: 'Revive en pantalla grande la aclamada película de Sam Raimi con Tobey Maguire como Spider-Man, en una función especial de reestreno.',
  edad: 13,
  duracion: '2 hr 7 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Acción', 'Aventura', 'Superhéroes'],
  precio: 8,
  img_dsc: ['https://m.media-amazon.com/images/S/pv-target-images/c5456ca7552096abb7ef5d9d70ac419950551fa573b1e552992c7d40d4bc2082._SX1080_FMjpg_.jpg'],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-08-20'),
  esEspecial: true
},
{
  id: 22,
  img: 'https://m.media-amazon.com/images/I/810pfFbhl+L._AC_UF1000,1000_QL80_.jpg',
  etiqueta: ['ESPECIAL', 'BIOPIC'],
  titulo: 'Stephen King: El Maestro del Terror',
  descripcion: 'Un documental biográfico que explora la vida, obra e influencia del legendario escritor Stephen King, con entrevistas y material inédito.',
  edad: 16,
  duracion: '1 hr 55 min',
  idiomas: ['Español Latino', 'Inglés'],
  generos: ['Biografía', 'Documental', 'Literatura'],
  precio: 9,
  img_dsc: [],
  trailer: '',
  enCartelera: false,
  fechaEstreno: new Date('2025-09-05'),
  esEspecial: true
}
];

  getAllMovies(): Observable<Movie[]> {
    return of(this.peliculas);
  }


  getMoviesByType(type: 'estrenos' | 'cartelera' | 'proximamente'): Movie[] {
    return this.peliculas.filter(movie => {
      if (type === 'estrenos') return movie.etiqueta.includes('ESTRENO');
      if (type === 'proximamente') return movie.proximamente;
      return movie.enCartelera;
    });
  }

  searchMovie(title: string): Movie | undefined {
    return this.peliculas.find(
      p => p.titulo.toLowerCase() === title.trim().toLowerCase()
    );
  }

  getMovieById(id: number): Movie | undefined {
    return this.peliculas.find(p => p.id === id);
  }

  getUpcomingMovies(): Movie[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza la fecha actual (sin horas/minutos)

  return this.peliculas.filter(movie => {
    // Si está en cartelera, no es "próxima"
    if (movie.enCartelera) return false;

    // Si no tiene fecha de estreno, no la incluimos (o decide según tu lógica)
    if (!movie.fechaEstreno) return false;

    const releaseDate = new Date(movie.fechaEstreno);
    releaseDate.setHours(0, 0, 0, 0);

    // Solo películas con fecha de estreno FUTURA (mayor que hoy)
    return releaseDate.getTime() > today.getTime();
  });
}
getPeliculasEventoOEspecial(): Movie[] {
  return this.peliculas.filter(
    movie => movie.esEvento === true || movie.esEspecial === true
  );
}
}
