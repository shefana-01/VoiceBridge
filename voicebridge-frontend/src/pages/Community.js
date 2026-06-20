import { useEffect, useState } from 'react';
import { community as communityApi, boards as boardApi, children as childApi } from '../api/endpoints';
import { toast } from '../components/Toaster';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const [templates, setTemplates] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      communityApi.list().catch(() => ({ data: [] })),
      childApi.list().catch(() => ({ data: [] }))
    ]).then(([tmplRes, childRes]) => {
      setTemplates(tmplRes.data.results ?? tmplRes.data ?? []);
      setChildren(childRes.data.results ?? childRes.data ?? []);
      setLoading(false);
    });
  }, []);

  const handleClone = async (templateId) => {
    if (children.length === 0) {
      return toast.error("You need to add a Child profile first before cloning a board.");
    }
    
    setCloning(true);
    try {
      // 1. Download template (increments counter)
      const { data: tmpl } = await communityApi.download(templateId);
      
      // 2. Create a new empty board with the template's dimensions
      // Note: Full icon duplication requires backend support for URL-to-ImageField conversion,
      // so we clone the board structure as a starting point.
      const boardPayload = {
        name: `Copy of ${tmpl.name}`,
        description: tmpl.description,
        rows: tmpl.layout?.rows || 4,
        cols: tmpl.layout?.cols || 4,
        child: children[0].id // Default to first child
      };
      
      const { data: newBoard } = await boardApi.create(boardPayload);
      toast.success("Board template cloned! You can now customize it.");
      navigate(`/boards/${newBoard.id}/edit`);
    } catch (err) {
      toast.error("Failed to clone the template.");
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-20">
      <header className="mb-8">
        <h1 className="font-serif-display text-4xl font-bold text-on-surface">
          Community Hub
        </h1>
        <p className="text-on-surface-variant mt-2 text-lg">
          Discover and share board templates with caregivers worldwide.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-on-surface-variant">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="vb-card border-2 border-dashed border-outline-variant text-center py-20">
          <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">explore</span>
          <h3 className="text-2xl font-bold mb-2 text-on-surface">No templates found</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            The community hub is currently empty. Check back later for new layouts and scenarios shared by other caregivers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="glass-card rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl shadow-primary/5">
              {/* Cover Image Placeholder or Real Image */}
              <div className="h-40 bg-gradient-to-br from-primary-container to-secondary-container relative flex items-center justify-center">
                {tmpl.cover ? (
                  <img src={tmpl.cover} alt={tmpl.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-primary/30">dashboard</span>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="vb-chip bg-white/90 text-primary shadow-sm backdrop-blur-sm">
                    {tmpl.scenario}
                  </span>
                  <span className="vb-chip bg-white/90 text-secondary shadow-sm backdrop-blur-sm uppercase">
                    {tmpl.language}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-title-lg font-bold text-on-surface mb-1">{tmpl.name}</h3>
                <p className="text-sm text-on-surface-variant mb-4 flex-1 line-clamp-2">
                  {tmpl.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-5 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    By {tmpl.author_name || 'Anonymous'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">download</span>
                    {tmpl.download_count} clones
                  </span>
                </div>
                
                <button 
                  onClick={() => handleClone(tmpl.id)}
                  disabled={cloning}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  {cloning ? 'Cloning...' : 'Clone Board'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
