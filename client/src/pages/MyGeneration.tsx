import { useEffect, useState } from 'react'
import { type IThumbnail } from '../assets/assets'
import SoftBackdrop from '../components/SoftBackdrop'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth, API_BASE_URL } from '../context/AuthContext.js'

const MyGeneration = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const aspectRatioClassMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  }

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Protect page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchThumbnails = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/user/thumbnails`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setThumbnails(data.thumbnail || []);
      } else {
        setError(data.message || 'Failed to fetch thumbnails.');
      }
    } catch (err: any) {
      console.error('Fetch thumbnails error:', err);
      setError('An error occurred while loading your thumbnails.');
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = (image_url: string) => {
    window.open(image_url, '_blank');
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this thumbnail?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/thumbnail/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setThumbnails(prev => prev.filter(thumb => thumb._id !== id));
      } else {
        alert(data.message || 'Failed to delete thumbnail.');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('An error occurred while trying to delete this thumbnail.');
    }
  }

  useEffect(() => {
    if (user) {
      fetchThumbnails()
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
      <SoftBackdrop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-200">My Generations</h1>
            <p className="text-sm text-zinc-400 mt-1">View and manage all your AI-generated thumbnails.</p>
          </div>
          <button 
            onClick={() => navigate('/generate')} 
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 transition rounded-full text-sm font-medium w-fit"
          >
            Generate New
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/6 border border-white/10 animate-pulse h-[260px]"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && thumbnails.length === 0 && (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/4">
            <h3 className="text-lg font-semibold text-zinc-200">No thumbnails created yet</h3>
            <p className="text-sm text-zinc-400 mt-2">Generate your first thumbnail to see it here.</p>
            <button 
              onClick={() => navigate('/generate')} 
              className="mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 transition rounded-full text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && thumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-8">
            {thumbnails.map((thumb: IThumbnail) => {
              const aspectClass = aspectRatioClassMap[thumb.aspect_ratio || '16:9'];
              return (
                <div key={thumb._id} onClick={() => navigate(`/generate/${thumb._id}`)} className="mb-8 group relative cursor-pointer rounded-2xl bg-white/6 border border-white/10 transition hover:border-white/20 shadow-xl break-inside-avoid overflow-hidden">
                  {/* Image */}
                  <div className={`relative overflow-hidden ${aspectClass} bg-black`}>
                    {thumb.image_url ? (
                      <img src={thumb.image_url} alt={thumb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">
                        {thumb.isGenerating ? 'Generating...' : 'No image available'}
                      </div>
                    )}

                    {thumb.isGenerating && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm font-medium">Generating...</div>}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2">{thumb.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/10">{thumb.style}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10">{thumb.color_scheme}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10">{thumb.aspect_ratio}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{new Date(thumb.createdAt!).toDateString()}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="absolute bottom-2 right-2 max-sm:flex sm:hidden group-hover:flex gap-1.5">
                    <TrashIcon onClick={() => handleDelete(thumb._id)}
                      className="size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all text-white" />

                    {thumb.image_url && (
                      <DownloadIcon
                        onClick={() => handleDownload(thumb.image_url!)}
                        className="size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all text-white" />
                    )}

                    {thumb.image_url && (
                      <Link target="_blank" to={`/preview?thumbnail_url=${encodeURIComponent(thumb.image_url)}&title=${encodeURIComponent(thumb.title)}`}>
                        <ArrowUpRightIcon className='size-6 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all text-white' />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default MyGeneration
