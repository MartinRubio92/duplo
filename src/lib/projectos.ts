import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const proyectosDirectory = path.join(process.cwd(), 'content/proyectos');

export interface Proyecto {
  slug: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  imagenes: string[];
  videoUrl?: string;
  content: string;
}

export function getProyectoSlugs() {
  return fs.readdirSync(proyectosDirectory)
    .filter(file => file.endsWith('.md'));
}

export function getProyectoBySlug(slug: string): Proyecto {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(proyectosDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha,
    tipo: data.tipo,
    imagenes: data.imagenes || [],
    videoUrl: data.videoUrl,
    content,
  };
}

export function getAllProyectos(): Proyecto[] {
  const slugs = getProyectoSlugs();
  const proyectos = slugs
    .map((slug) => getProyectoBySlug(slug))
    .sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  return proyectos;
}