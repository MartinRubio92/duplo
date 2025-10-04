import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface GitCommitOptions {
  message: string;
  files: string[];
}

export class GitManager {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * Verifica si estamos en un repositorio Git
   */
  isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { 
        cwd: this.repoPath,
        stdio: 'ignore'
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica el estado del working directory
   */
  getGitStatus(): string[] {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      });
      return status.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('Error getting git status:', error);
      return [];
    }
  }

  /**
   * Agrega archivos al staging area
   */
  addFiles(files: string[]): boolean {
    try {
      for (const file of files) {
        execSync(`git add ${file}`, { 
          cwd: this.repoPath,
          stdio: 'ignore'
        });
      }
      return true;
    } catch (error) {
      console.error('Error adding files:', error);
      return false;
    }
  }

  /**
   * Realiza un commit
   */
  commit(message: string): boolean {
    try {
      execSync(`git commit -m "${message}"`, { 
        cwd: this.repoPath,
        stdio: 'ignore'
      });
      return true;
    } catch (error) {
      console.error('Error committing:', error);
      return false;
    }
  }

  /**
   * Push al repositorio remoto
   */
  push(branch: string = 'main'): boolean {
    try {
      execSync(`git push origin ${branch}`, { 
        cwd: this.repoPath,
        stdio: 'ignore'
      });
      return true;
    } catch (error) {
      console.error('Error pushing to remote:', error);
      return false;
    }
  }

  /**
   * Realiza un commit completo con push
   */
  async commitAndPush(files: string[], message: string = 'Update content'): Promise<boolean> {
    try {
      // Verificar que estamos en un repo git
      if (!this.isGitRepository()) {
        console.log('Not a git repository - skipping git operations');
        return false;
      }

      // Agregar archivos
      if (!this.addFiles(files)) {
        return false;
      }

      // Verificar si hay cambios
      const status = this.getGitStatus();
      if (status.length === 0) {
        console.log('No changes to commit');
        return true;
      }

      // Hacer commit
      if (!this.commit(message)) {
        return false;
      }

      // Push
      if (!this.push()) {
        return false;
      }

      console.log(`Successfully committed and pushed: ${message}`);
      return true;
    } catch (error) {
      console.error('Error in commit and push:', error);
      return false;
    }
  }

  /**
   * Crear proyecto completo con Git
   */
  async createProject(proyectoData: {
    slug: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    fecha: string;
    contenido: string;
    imagePaths: string[];
  }): Promise<{ success: boolean; files: string[]; error?: string }> {
    try {
      const files: string[] = [];
      
      // Crear archivo markdown del proyecto
      const proyectoPath = path.join('content/proyectos', `${proyectoData.slug}.md`);
      // Asegurar que imagePaths es un array
      const imagePaths = Array.isArray(proyectoData.imagePaths) ? proyectoData.imagePaths : [];
      
      const mdContent = `---
titulo: "${proyectoData.titulo}"
descripcion: "${proyectoData.descripcion}"
fecha: "${proyectoData.fecha}"
tipo: "${proyectoData.tipo}"
imagenes:
${imagePaths.map(img => `  - "${img}"`).join('\n')}
videoUrl: ""
---

${proyectoData.contenido}`;

      // Escribir archivo
      await fs.promises.writeFile(proyectoPath, mdContent, 'utf8');
      files.push(proyectoPath);

      // Commit y push
      const message = `Add new project: ${proyectoData.titulo}`;
      const gitSuccess = await this.commitAndPush(files, message);

      return {
        success: true,
        files,
        ...(gitSuccess ? {} : { error: 'Failed to commit to git' })
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Realizar backup de cambios antes de Git
   */
  async backupChanges(files: string[]): Promise<string[]> {
    const backupDir = path.join(this.repoPath, '.backup', Date.now().toString());
    const backupFiles: string[] = [];

    try {
      await fs.promises.mkdir(backupDir, { recursive: true });

      for (const file of files) {
        if (fs.existsSync(file)) {
          const backupPath = path.join(backupDir, path.basename(file));
          await fs.promises.copyFile(file, backupPath);
          backupFiles.push(backupPath);
        }
      }

      return backupFiles;
    } catch (error) {
      console.error('Error creating backup:', error);
      return [];
    }
  }

  /**
   * Verificar si Git está disponible y configurado
   */
  ensureGitConfigured(): boolean {
    try {
      // Verificar que git está instalado y configurado
      execSync('git --version', { cwd: this.repoPath, stdio: 'ignore' });
      
      // Verificar usuario configurado
      try {
        execSync('git config user.name', { cwd: this.repoPath, stdio: 'ignore' });
        execSync('git config user.email', { cwd: this.repoPath, stdio: 'ignore' });
      } catch {
        console.warn('Git user not configured. Use: git config --global user.name "Name" && git config --global user.email "email@example.com"');
        return false;
      }
      
      return true;
    } catch {
      console.warn('Git not available or not initialized');
      return false;
    }
  }
}

// Instancia global para usar en la API
export const gitManager = new GitManager();

// Helpers para manejo de archivos de imagen
export async function processImageUpload(
  imageFiles: File[],
  proyectoSlug: string
): Promise<string[]> {
  const imagePaths: string[] = [];
  
  try {
    // Crear directorio del proyecto
    const proyectoDir = path.join(process.cwd(), 'public/images/proyectos', proyectoSlug);
    await fs.promises.mkdir(proyectoDir, { recursive: true });

    // Procesar cada imagen
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileName = `imagen-${i + 1}.${file.name.split('.').pop()}`;
      const filePath = path.join(proyectoDir, fileName);
      
      // Convertir File a Buffer (esto funcionaría en un entorno Edge Runtime)
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(filePath, buffer);
      
      imagePaths.push(`/images/proyectos/${proyectoSlug}/${fileName}`);
    }
  } catch (error) {
    console.error('Error processing images:', error);
    throw error;
  }

  return imagePaths;
}
