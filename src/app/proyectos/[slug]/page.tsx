import Image from 'next/image';
import Link from 'next/link';
import { getAllProyectos, getProyectoBySlug } from '@/lib/proyectos';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const proyectos = getAllProyectos();
  return proyectos.map((proyecto) => ({
    slug: proyecto.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProyectoPage({ params }: PageProps) {
  const { slug } = await params;
  
  let proyecto;
  try {
    proyecto = getProyectoBySlug(slug);
  } catch (error) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-8 inline-block font-semibold"
        >
          ← Volver al portfolio
        </Link>

        <article>
          <header className="mb-8">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {proyecto.tipo}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {proyecto.titulo}
            </h1>
            <time className="text-gray-600 text-sm">
              {new Date(proyecto.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <p className="text-xl text-gray-700 mt-6 leading-relaxed">
              {proyecto.descripcion}
            </p>
          </header>

          {/* Galería de Imágenes */}
          <div className="space-y-6 mb-12">
            {proyecto.imagenes.map((imagen, index) => (
              <div 
                key={index} 
                className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-md"
              >
                <Image
                  src={imagen}
                  alt={`${proyecto.titulo} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            ))}
          </div>

          {/* Video si existe */}
          {proyecto.videoUrl && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Video del Proyecto</h2>
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                <iframe
                  src={proyecto.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Video de ${proyecto.titulo}`}
                />
              </div>
            </div>
          )}

          {/* Contenido Markdown */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: proyecto.content }}
          />
        </article>
      </div>
    </main>
  );
}
