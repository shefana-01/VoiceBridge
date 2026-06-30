import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LibraryGateway() {
  const nav = useNavigate();
  const [pendingAction, setPendingAction] = useState(null); // 'arasaac' | 'upload' | null

  const handleChoice = (target) => {
    // target is 'icons' or 'folder-dps'
    if (pendingAction === 'arasaac') nav(`/${target}?action=arasaac`);
    else if (pendingAction === 'upload') nav(`/${target}?action=upload`);
    else nav(`/${target}`);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
      
      {!pendingAction ? (
        <>
          <span className="material-symbols-outlined text-6xl text-primary mb-4">local_library</span>
          <h1 className="font-serif-display text-4xl font-bold text-on-surface mb-2">Central Library</h1>
          <p className="text-on-surface-variant mb-12 text-lg">
            What would you like to add today?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
            <button 
              onClick={() => setPendingAction('arasaac')}
              className="vb-btn bg-secondary text-white hover:opacity-90 transition-opacity rounded-2xl px-8 py-6 font-bold shadow-lg flex flex-col items-center gap-3 text-lg flex-1"
            >
              <span className="material-symbols-outlined text-4xl">travel_explore</span>
              Search ARASAAC
            </button>
            <button 
              onClick={() => setPendingAction('upload')}
              className="vb-btn-primary rounded-2xl px-8 py-6 font-bold shadow-lg flex flex-col items-center gap-3 text-lg flex-1"
            >
              <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
              + New Custom Icon
            </button>
          </div>

          <div className="border-t border-outline-variant w-full pt-8">
            <p className="text-on-surface-variant font-medium mb-4 uppercase tracking-wider text-sm">Or view existing libraries</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => nav('/icons')} className="vb-btn bg-surface-container text-on-surface hover:bg-outline-variant rounded-full px-6 py-2 shadow-sm font-bold">
                Icon Library
              </button>
              <button onClick={() => nav('/folder-dps')} className="vb-btn bg-surface-container text-on-surface hover:bg-outline-variant rounded-full px-6 py-2 shadow-sm font-bold">
                Folder Library
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4">
          <button onClick={() => setPendingAction(null)} className="mb-6 text-on-surface-variant hover:text-primary flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <h2 className="font-serif-display text-3xl font-bold text-on-surface mb-6">
            Where should this go?
          </h2>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleChoice('icons')} className="vb-card p-6 text-left hover:border-primary hover:shadow-md transition-all group flex items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">record_voice_over</span>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1 text-on-surface group-hover:text-primary transition-colors">Icon Library</h3>
                <p className="text-on-surface-variant">Will require voice. Goes inside folders to be spoken aloud.</p>
              </div>
            </button>
            
            <button onClick={() => handleChoice('folder-dps')} className="vb-card p-6 text-left hover:border-secondary hover:shadow-md transition-all group flex items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">folder_special</span>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1 text-on-surface group-hover:text-secondary transition-colors">Folder Library</h3>
                <p className="text-on-surface-variant">Cover images only. No voice needed. Used as the profile picture for a folder.</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
