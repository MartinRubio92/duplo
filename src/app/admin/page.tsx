'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface FormData {
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  contenido: string;
  imagenes: FileList | null;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    tipo: 'Construcción',
    fecha: new Date().toISOString().split('T')[0],
    contenido: '',
    imagenes: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (files: FileList | null) => {
    setFormData(prev => ({
      ...prev,
      imagenes: files
    }));
  };

  const generateSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const markdownTemplate = (data: FormData, imagePaths: string[]) => {
    return `---
titulo: "${data.titulo}"
descripcion: "${data.descripcion}"
fecha: "${data.fecha}"
tipo: "${data.tipo}"
imagenes:
${imagePaths.map(path => `  - "${path}"`).join('\n')}
videoUrl: ""
---

${data.contenido}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const slug = generateSlug(formData.titulo);
      
      // Preparar rutas de imágenes (simuladas para desarrollo)
      const imagePaths: string[] = [];
      if (formData.imagenes && formData.imagenes.length > 0) {
        // En desarrollo, solo usamos nombres simulados
        for (let i = 0; i < Math.min(formData.imagenes.length, 5); i++) {
          imagePaths.push(`/images/proyectos/${slug}/imagen-${i + 1}.jpg`);
        }
      }

      const response = await fetch('/api/admin/proyecto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imagenes: imagePaths,
          slug,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Proyecto creado exitosamente! El sitio se actualizará automáticamente.' });
        setFormData({
          titulo: '',
          descripcion: '',
          tipo: 'Construcción',
          fecha: new Date().toISOString().split('T')[0],
          contenido: '',
          imagenes: null,
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al crear el proyecto' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Volver al Portfolio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Proyecto *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  required
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Casa Moderna 2024"
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Proyecto *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Construcción">Construcción</option>
                  <option value="Restauración">Restauración</option>
                  <option value="Renovación">Renovación</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Breve *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={3}
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Breve descripción del proyecto..."
              />
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Proyecto *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                required
                value={formData.fecha}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Galería de Imágenes del Proyecto
              </label>
              <ImageUpload
                onChange={handleImageChange}
                value={formData.imagenes}
                maxFiles={5}
              />
            </div>

            <div>
              <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido Detallado (Markdown)
              </label>
              <textarea
                id="contenido"
                name="contenido"
                rows={10}
                value={formData.contenido}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`## Descripción del Proyecto

Detalle aquí la información del proyecto...

### Trabajos Realizados

- Lista de trabajos
- Otros aspectos importantes

### Características Destacadas

Descripción de lo que hace único este proyecto.`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Puedes usar formato Markdown para estructurar el contenido.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creando proyecto...' : 'Crear Proyecto'}
              </button>
              
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setFormData({
                    titulo: '',
                    descripcion: '',
                    tipo: 'Construcción',
                    fecha: new Date().toISOString().split('T')[0],
                    contenido: '',
                    imagenes: null,
                  });
                  setMessage(null);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Cómo Funciona</h2>
          <ol className="text-blue-800 space-y-2">
            <li>1. Completa el formulario con la información del proyecto</li>
            <li>2. Sube las imágenes que quieras incluir</li>
            <li>3. Haz clic en "Crear Proyecto"</li>
            <li>4. El sistema genera automáticamente los archivos necesarios</li>
            <li>5. El sitio se actualiza automáticamente en unos minutos</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
