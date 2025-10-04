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
    console.warn(`Warning: Directory ${proyectosDirectory} does not exist`);
    return [];
  }
  try {
    return fs.readdirSync(proyectosDirectory)
      .filter(file => file.endsWith('.md'));
  } catch (error) {
    console.error(`Error reading directory ${proyectosDirectory}:`, error);
    return [];
  }
}

export function getProyectoBySlug(slug: string): Proyecto {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(proyectosDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Proyecto no encontrado: ${slug}`);
  }
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validar campos requeridos
    if (!data.titulo || !data.descripcion || !data.fecha || !data.tipo) {
      throw new Error(`Proyecto ${realSlug} tiene campos requeridos faltantes`);
    }

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
  } catch (error) {
    console.error(`Error reading proyecto ${realSlug}:`, error);
    
    if (error instanceof Error && error.message === `Proyecto ${realSlug} tiene campos requeridos faltantes`) {
      throw error;
    }
    
    throw new Error(`Error al procesar proyecto: ${realSlug}`);
  }
}

export function getAllProyectos(): Proyecto[] {
  const slugs = getProyectoSlugs();
  const proyectos = slugs
    .map((slug) => {
      try {
        return getProyectoBySlug(slug);
      } catch (error) {
        console.error(`Skipping proyecto ${slug} due to errors:`, error);
        return null;
      }
    })
    .filter((proyecto): proyecto is Proyecto => proyecto !== null)
    .sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  return proyectos;
}
