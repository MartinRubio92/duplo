import Link from 'next/link';
import Image from 'next/image';
import { getAllProyectos } from '@/lib/projectos';

export default function Home() {
  const proyectos = getAllProyectos();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Portfolio Arquitectura
          </h1>
          <p className="text-xl text-gray-600">
            Proyectos de construcción y restauración
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proyectos.map((proyecto) => (
            <Link 
              key={proyecto.slug} 
              href={`/proyectos/${proyecto.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {proyecto.imagenes[0] && (
                  <div className="relative h-64 bg-gray-200">
                    <Image
                      src={proyecto.imagenes[0]}
                      alt={proyecto.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <span className="text-sm text-blue-600 font-semibold">
                    {proyecto.tipo}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-3">
                    {proyecto.titulo}
                  </h2>
                  <p className="text-gray-600 line-clamp-2">
                    {proyecto.descripcion}
                  </p>
                  <time className="text-sm text-gray-500 mt-4 block">
                    {proyecto.fecha}
                  </time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
