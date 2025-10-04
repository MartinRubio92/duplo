import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

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
  if (!fs.existsSync(proyectosDirectory)) {
    return [];
  }
  return fs.readdirSync(proyectosDirectory)
    .filter(file => file.endsWith('.md'));
}

export function getProyectoBySlug(slug: string): Proyecto {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(proyectosDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Proyecto no encontrado: ${slug}`);
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Convertir markdown a HTML
  const processedContent = remark()
    .use(html)
    .processSync(content);
  const contentHtml = processedContent.toString();

  return {
    slug: realSlug,
    titulo: data.titulo,
    descripcion: data.descripcion,
    fecha: data.fecha,
    tipo: data.tipo,
    imagenes: data.imagenes || [],
    videoUrl: data.videoUrl,
    content: contentHtml,
  };
}

export function getAllProyectos(): Proyecto[] {
  const slugs = getProyectoSlugs();
  const proyectos = slugs
    .map((slug) => getProyectoBySlug(slug))
    .sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  return proyectos;
}
