import { NextRequest, NextResponse } from 'next/server';
import { gitManager } from '@/lib/git-integration';

interface ProyectoData {
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  contenido: string;
  slug: string;
  imagenes?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: ProyectoData = await request.json();
    
    // Validar datos requeridos
    if (!data.titulo || !data.descripcion || !data.tipo || !data.fecha || !data.slug) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validar y procesar imágenes
    const imagePaths = Array.isArray(data.imagenes) ? data.imagenes : [];
    
    console.log(`Creating project: ${data.slug} with ${imagePaths.length} images`);
    
    // Usar GitManager para crear el proyecto
    const result = await gitManager.createProject({
      slug: data.slug,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      fecha: data.fecha,
      contenido: data.contenido,
      imagePaths
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Error al crear el proyecto' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Proyecto creado exitosamente con ${imagePaths.length} imágenes`,
      slug: data.slug,
      files: result.files,
      imagesProcessed: imagePaths.length,
      gitCommited: !result.error,
      note: result.error || 'Sitio se actualizará automáticamente vía Git webhook'
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
