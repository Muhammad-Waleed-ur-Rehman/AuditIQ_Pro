import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ProjectContext = createContext(null);

const STORAGE_KEY = 'auditiq_pro_active_project';

function loadPersistedProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function persistProject(project) {
  try {
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export function ProjectProvider({ children }) {
  const [activeProject, setActiveProjectState] = useState(loadPersistedProject);

  const setActiveProject = useCallback((project) => {
    setActiveProjectState(project);
    persistProject(project);
  }, []);

  useEffect(() => {
    if (activeProject) persistProject(activeProject);
  }, [activeProject]);

  return (
    <ProjectContext.Provider value={{ activeProject, setActiveProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider');
  return ctx;
}
