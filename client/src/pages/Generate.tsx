import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colorSchemes, type AspectRatio, type IThumbnail, type ThumbnailStyle } from "../assets/assets";
import SoftBackdrop from "../components/SoftBackdrop";
import AspectRatioSelector from "../components/AspectRatioSelector";
import StyleSelector from "../components/StyleSelector";
import ColourSchemeSelector from "../components/ColourSchemeSelector";
import PreviewPanel from "../components/PreviewPanel";
import { useAuth, API_BASE_URL } from "../context/AuthContext.js";

const Generate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id);
  const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic');
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  // Protect page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a title or topic for your thumbnail.');
      return;
    }

    setError('');
    setLoading(true);
    setThumbnail(null);

    try {
      const response = await fetch(`${API_BASE_URL}/thumbnail/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt: additionalDetails,
          style,
          aspect_ratio: aspectRatio,
          color_scheme: colorSchemeId,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setThumbnail(data.thumbnail);
      } else {
        setError(data.message || 'Failed to generate thumbnail. Please try again.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchThumbnail = async () => {
    if (id) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/user/thumbnails/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.thumbnail) {
          const thumb = data.thumbnail;
          setThumbnail(thumb);
          setAdditionalDetails(thumb.user_prompt || '');
          setTitle(thumb.title || '');
          setColorSchemeId(thumb.color_scheme || colorSchemes[0].id);
          setAspectRatio(thumb.aspect_ratio || '16:9');
          setStyle(thumb.style || 'Bold & Graphic');
        } else {
          setError(data.message || 'Failed to load the requested thumbnail.');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Error loading thumbnail details.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchThumbnail();
    }
  }, [id, user]);

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
      <div className="pt-24 min-h-screen"> 
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left Panel */}
            <div className={`space-y-6 ${id && 'pointer-events-none'}`}> 
              <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 mb-2">Create Your own Thumbnail</h2>
                  <p className="text-sm text-zinc-400">Describe your vision and let AI bring it to life.</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title / Topic</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      maxLength={100} 
                      placeholder="e.g., 10 Tips for Better Sleep" 
                      className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500" 
                    />
                    <div className="flex justify-end mt-1"> 
                      <span className="text-xs text-zinc-400">{title.length}/100</span>
                    </div>
                  </div>
                  
                  {/* AspectRatioSelector */}
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

                  {/* StyleSelector */}
                  <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsopen={setStyleDropdownOpen} />
                  
                  {/* ColourSchemeSelector */}
                  <ColourSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />

                  {/* DETAILS */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium"> 
                      Additional Prompts <span className="text-zinc-400 text-xs">(optional)</span>
                    </label> 
                    <textarea 
                      value={additionalDetails} 
                      onChange={(e) => setAdditionalDetails(e.target.value)} 
                      rows={3} 
                      placeholder="Add any specific elements, mood, or style preferences..." 
                      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                  </div>
                </div>

                {/* Button */}
                {!id && (
                  <button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-pink-900 disabled:to-pink-950 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Generating...' : 'Generate Thumbnail'}
                  </button>
                )}
              </div>
            </div>
            {/* Right Panel */}
            <div>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Preview</h2>
                <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio}/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Generate;
