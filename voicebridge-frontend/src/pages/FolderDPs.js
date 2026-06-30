import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { icons as iconApi, boards as boardApi } from '../api/endpoints';
import { toast } from '../components/Toaster';
import ArasaacModal from '../components/ArasaacModal';


export default function FolderDPs() {
  const [dpList, setDpList] = useState([]);
  const [boardList, setBoardList] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [boardSearch, setBoardSearch] = useState('');
  const [draggedDp, setDraggedDp] = useState(null);
  const [showArasaac, setShowArasaac] = useState(false);
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'arasaac') {
      setShowArasaac(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const load = useCallback(() => {
    Promise.all([
      iconApi.list({ is_folder_dp: 'true' }),
      boardApi.list()
    ])
    .then(([dpRes, boardRes]) => {
      setDpList(dpRes.data.results ?? dpRes.data);
      setBoardList(boardRes.data.results ?? boardRes.data);
    })
    .catch(() => toast.error('Failed to load libraries.'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await boardApi.create({ name: newFolderName, rows: 2, cols: 3 });
      setNewFolderName('');
      load();
      toast.success('Folder created!');
    } catch {
      toast.error('Failed to create folder.');
    }
  };

  const assignDpToFolder = async (boardId, dpId) => {
    try {
      await boardApi.update(boardId, { cover_icon_id: dpId });
      load();
      toast.success('Profile picture assigned to folder!');
    } catch {
      toast.error('Failed to assign profile picture.');
    }
  };

  const deleteDp = async (dpId) => {
    if (!window.confirm("Delete this Profile Picture?")) return;
    try {
      await iconApi.remove(dpId);
      toast.success('Profile picture deleted.');
      load();
    } catch {
      toast.error('Failed to delete profile picture.');
    }
  };

  const deleteBoard = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this Folder?")) return;
    try {
      await boardApi.remove(boardId);
      toast.success('Folder deleted.');
      load();
    } catch {
      toast.error('Failed to delete folder.');
    }
  };

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-bold text-on-surface">Folder Library</h1>
          <p className="text-on-surface-variant mt-1">
            Manage your folders and assign profile pictures via drag and drop.
          </p>
        </div>
        <button onClick={() => nav('/library')} className="vb-btn bg-surface-container-high text-on-surface hover:bg-outline-variant transition-colors rounded-full px-6 py-2.5 font-bold shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Central Library
        </button>
      </header>

      {showArasaac && (
        <ArasaacModal 
          initialSaveType="folder"
          onClose={() => setShowArasaac(false)} 
          onImport={(type) => { 
            setShowArasaac(false); 
            if (type === 'icon') nav('/icons');
            else load(); 
          }} 
        />
      )}

      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        {/* Left Side: Folder Grid */}
        <div className="vb-card h-fit min-h-[60vh] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-bold text-xl">1. Your Folders</h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  className="vb-input text-sm py-1.5 pl-9 w-full"
                  placeholder="Search folders..."
                  value={boardSearch}
                  onChange={e => setBoardSearch(e.target.value)}
                />
              </div>
              <form onSubmit={createFolder} className="flex gap-2">
                <input 
                  className="vb-input text-sm py-1.5 w-full sm:w-32" 
                  placeholder="New folder..." 
                  value={newFolderName} 
                  onChange={e => setNewFolderName(e.target.value)} 
                />
                <button type="submit" className="vb-btn-primary px-4 py-1.5 text-sm shrink-0">Create</button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {boardList
              .filter(b => b.name.toLowerCase().includes(boardSearch.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(board => (
              <FolderGridItem
                key={board.id}
                board={board}
                draggedDp={draggedDp}
                assignDpToFolder={assignDpToFolder}
                onRename={async (newName) => {
                  try {
                    await boardApi.update(board.id, { name: newName });
                    load();
                    toast.success('Folder renamed!');
                  } catch { toast.error('Failed to rename folder.'); }
                }}
                onDelete={() => deleteBoard(board.id)}
              />
            ))}
            {boardList.length === 0 && (
              <div className="col-span-full text-center py-16 text-on-surface-variant">
                No folders created yet. Create one above!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: DP Sidebar */}
        <div className="vb-card h-fit max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">2. Profile Pictures</h3>
            <label className="vb-btn bg-surface-container-high text-on-surface hover:bg-outline-variant px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[14px] mr-1">upload</span>
              Upload
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('label', file.name);
                  fd.append('category', 'OTHER');
                  fd.append('is_folder_dp', 'true');
                  fd.append('arasaac_id', 'manual'); // hack to differentiate
                  fd.append('image', file);
                  try {
                    await iconApi.create(fd);
                    load();
                    toast.success('Image uploaded!');
                  } catch { toast.error('Upload failed.'); }
                  e.target.value = '';
                }} 
              />
            </label>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Drag these onto a folder to assign them.
          </p>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div>
              <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-3 pb-1 border-b border-outline-variant">
                Imported from ARASAAC
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dpList.filter(dp => dp.arasaac_id && dp.arasaac_id !== 'manual').map(dp => (
                  <DpDraggable key={dp.id} dp={dp} setDraggedDp={setDraggedDp} deleteDp={deleteDp} />
                ))}
                {dpList.filter(dp => dp.arasaac_id && dp.arasaac_id !== 'manual').length === 0 && (
                  <div className="col-span-full text-center py-4 text-xs text-on-surface-variant opacity-70">
                    No ARASAAC imports yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-3 pb-1 border-b border-outline-variant">
                Uploaded Gallery Pictures
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dpList.filter(dp => !dp.arasaac_id || dp.arasaac_id === 'manual').map(dp => (
                  <DpDraggable key={dp.id} dp={dp} setDraggedDp={setDraggedDp} deleteDp={deleteDp} />
                ))}
                {dpList.filter(dp => !dp.arasaac_id || dp.arasaac_id === 'manual').length === 0 && (
                  <div className="col-span-full text-center py-4 text-xs text-on-surface-variant opacity-70">
                    No uploads yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DpDraggable({ dp, setDraggedDp, deleteDp }) {
  return (
    <div draggable
         onDragStart={(e) => {
           setDraggedDp(dp);
           e.dataTransfer.setData('text/plain', dp.id);
         }}
         onDragEnd={() => setDraggedDp(null)}
         className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform relative group">
      <img src={dp.image} alt={dp.label} className="w-full aspect-square object-cover rounded-md shadow-sm pointer-events-none" />
      <button 
        onClick={() => deleteDp(dp.id)}
        className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        title="Delete this image"
      >
        <span className="material-symbols-outlined text-[14px]">delete</span>
      </button>
    </div>
  );
}

function FolderGridItem({ board, draggedDp, assignDpToFolder, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(board.name);

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const fd = new FormData();
          fd.append('label', file.name);
          fd.append('category', 'OTHER');
          fd.append('is_folder_dp', 'true');
          fd.append('arasaac_id', 'manual');
          fd.append('image', file);
          try {
            const res = await iconApi.create(fd);
            await assignDpToFolder(board.id, res.data.id);
          } catch { toast.error('Upload failed.'); }
          return;
        }
        const dpId = e.dataTransfer.getData('text/plain');
        if (dpId) assignDpToFolder(board.id, dpId);
      }}
      className={`relative rounded-2xl border-2 border-dashed ${draggedDp ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary'} transition-all aspect-square flex flex-col group overflow-hidden bg-surface-container-lowest`}
    >
      {board.cover_icon ? (
        <img src={board.cover_icon.image} className="w-full h-full object-cover absolute inset-0 opacity-50 group-hover:opacity-60 transition-opacity" alt="Cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="material-symbols-outlined text-7xl">folder</span>
        </div>
      )}

      {draggedDp && (
        <div className="absolute inset-0 bg-primary/30 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none transition-all">
          <div className="bg-primary text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">download</span>
            Drop to set cover
          </div>
        </div>
      )}
      
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col items-center justify-end h-1/2">
        {isEditing ? (
          <form className="flex gap-1 w-full" onSubmit={(e) => {
            e.preventDefault();
            if (name !== board.name) onRename(name);
            setIsEditing(false);
          }}>
            <input autoFocus className="vb-input text-xs py-1 px-2 flex-1 text-center font-bold" value={name} onChange={e => setName(e.target.value)} />
            <button type="submit" className="vb-btn-primary text-[10px] px-2 py-1"><span className="material-symbols-outlined text-[14px]">check</span></button>
          </form>
        ) : (
          <div className="font-bold text-white text-lg text-center drop-shadow-md flex items-center justify-center gap-2 w-full">
            <span className="flex-1 text-center leading-tight">{board.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsEditing(true)} className="text-white/70 hover:text-white" title="Rename folder">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-white/70 hover:text-error" title="Delete folder">
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {board.cover_icon && !isEditing && (
        <button 
          onClick={() => assignDpToFolder(board.id, null)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-error opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Remove Profile Picture"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
}
