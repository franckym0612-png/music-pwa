import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, LogIn, LogOut, Disc } from 'lucide-react';

const App = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const audioRef = useRef(null);

  // Albums de démonstration - REMPLACEZ avec vos vraies données Archive.org
  const demoAlbums = [
    {
      id: 1,
      title: "🌃 Nuit Électrique",
      artist: "Suno AI Collection",
      cover: "https://via.placeholder.com/400/667eea/ffffff?text=Nuit+Électrique",
      archiveUrl: "https://archive.org/details/your-album-1",
      tracks: [
        { title: "Néons Bleus", url: "https://ia801504.us.archive.org/1/items/example/track1.mp3", duration: "3:45" },
        { title: "Pixels en Mouvement", url: "https://ia801504.us.archive.org/1/items/example/track2.mp3", duration: "4:12" },
        { title: "Signaux Perdus", url: "https://ia801504.us.archive.org/1/items/example/track3.mp3", duration: "3:58" }
      ]
    },
    {
      id: 2,
      title: "🎸 Bonjour Nga",
      artist: "Collection IA",
      cover: "https://via.placeholder.com/400/f093fb/ffffff?text=Bonjour+Nga",
      archiveUrl: "https://archive.org/details/your-album-2",
      tracks: [
        { title: "Voyage Sonore", url: "https://ia801504.us.archive.org/1/items/example/track4.mp3", duration: "4:23" },
        { title: "Échos Lointains", url: "https://ia801504.us.archive.org/1/items/example/track5.mp3", duration: "3:34" }
      ]
    }
  ];

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const result = await window.storage?.get('music-albums');
      if (result && result.value) {
        setAlbums(JSON.parse(result.value));
      } else {
        setAlbums(demoAlbums);
      }
    } catch (error) {
      setAlbums(demoAlbums);
    }
  };

  const saveAlbums = async (newAlbums) => {
    try {
      await window.storage?.set('music-albums', JSON.stringify(newAlbums));
      setAlbums(newAlbums);
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (selectedAlbum && currentTrack < selectedAlbum.tracks.length - 1) {
        setCurrentTrack(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [selectedAlbum, currentTrack]);

  useEffect(() => {
    if (audioRef.current && selectedAlbum) {
      audioRef.current.src = selectedAlbum.tracks[currentTrack].url;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Playback failed:', e));
      }
    }
  }, [currentTrack, selectedAlbum]);

  const togglePlay = () => {
    if (!audioRef.current || !selectedAlbum) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Playback failed:', e));
    }
    setIsPlaying(!isPlaying);
  };

  const playAlbum = (album) => {
    setSelectedAlbum(album);
    setCurrentTrack(0);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (selectedAlbum && currentTrack < selectedAlbum.tracks.length - 1) {
      setCurrentTrack(prev => prev + 1);
    }
  };

  const prevTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(prev => prev - 1);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = () => {
    const password = prompt('Mot de passe administrateur:');
    if (password === 'admin123') { // CHANGEZ CE MOT DE PASSE !
      setIsAdmin(true);
      alert('Connexion réussie!');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
  };

  const handleAddAlbum = () => {
    const title = prompt('Titre de l\'album:');
    const artist = prompt('Artiste:');
    const cover = prompt('URL de la couverture:');
    const archiveUrl = prompt('URL Archive.org:');
    const tracksInput = prompt('Titres (format: Titre|URL|Durée, séparés par des virgules):\nExemple: Ma Chanson|https://archive.org/track.mp3|3:45, Autre|url|4:12');
    
    if (title && artist && tracksInput) {
      const tracks = tracksInput.split(',').map(t => {
        const [trackTitle, url, duration] = t.split('|').map(s => s.trim());
        return { title: trackTitle, url, duration };
      });

      const newAlbum = {
        id: Date.now(),
        title,
        artist,
        cover: cover || 'https://via.placeholder.com/400/667eea/ffffff?text=' + encodeURIComponent(title),
        archiveUrl: archiveUrl || '',
        tracks
      };

      saveAlbums([...albums, newAlbum]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <audio ref={audioRef} />
      
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-purple-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎵 Mes Albums
            </h1>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <div className="max-w-7xl mx-auto p-4 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg m-4">
          <h2 className="text-xl font-bold mb-4">Panneau Administrateur</h2>
          <button
            onClick={handleAddAlbum}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Ajouter un Album
          </button>
        </div>
      )}

      {/* Albums Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8 text-center">📀 Collection Suno AI</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {albums.map(album => (
            <div
              key={album.id}
              className="group bg-gradient-to-br from-purple-900 to-pink-900 bg-opacity-30 backdrop-blur-lg rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 border border-purple-500 border-opacity-30 cursor-pointer shadow-2xl"
              onClick={() => playAlbum(album)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{album.title}</h3>
                <p className="text-purple-300 mb-3">{album.artist}</p>
                <p className="text-sm text-gray-400">{album.tracks.length} titres</p>
                {album.archiveUrl && (
                  <a
                    href={album.archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir sur Archive.org →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Player */}
      {selectedAlbum && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-95 backdrop-blur-xl border-t border-purple-500 p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Album Info */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <img
                  src={selectedAlbum.cover}
                  alt={selectedAlbum.title}
                  className="w-16 h-16 rounded-lg shadow-lg"
                />
                <div className="min-w-0">
                  <p className="font-bold truncate">{selectedAlbum.tracks[currentTrack].title}</p>
                  <p className="text-sm text-purple-300 truncate">{selectedAlbum.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1 flex flex-col items-center gap-2 w-full">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevTrack}
                    disabled={currentTrack === 0}
                    className="hover:text-purple-400 transition disabled:opacity-30"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 transition transform hover:scale-110"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={nextTrack}
                    disabled={currentTrack === selectedAlbum.tracks.length - 1}
                    className="hover:text-purple-400 transition disabled:opacity-30"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 w-full max-w-2xl">
                  <span className="text-xs text-gray-400 w-12 text-right">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden group"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all group-hover:from-purple-400 group-hover:to-pink-400"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={toggleMute} className="hover:text-purple-400 transition">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
