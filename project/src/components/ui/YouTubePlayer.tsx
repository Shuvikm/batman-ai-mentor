import React, { useState } from 'react';
import { X, Play, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    title: string;
    channel?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, title, channel }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const getEmbedUrl = () => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`;
    };

    const getWatchUrl = () => {
        return `https://www.youtube.com/watch?v=${videoId}`;
    };

    const getThumbnailUrl = () => {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    };

    return (
        <div className="relative group">
            {!isPlaying ? (
                // Thumbnail with play button overlay
                <div
                    className="relative cursor-pointer rounded-lg overflow-hidden bg-black"
                    onClick={() => setIsPlaying(true)}
                >
                    <img
                        src={getThumbnailUrl()}
                        alt={title}
                        className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                    </div>

                    {/* Duration badge (optional) */}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        Video
                    </div>
                </div>
            ) : (
                // Embedded YouTube player
                <div className="relative rounded-lg overflow-hidden bg-black">
                    <iframe
                        width="100%"
                        height="300"
                        src={getEmbedUrl()}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                    ></iframe>

                    {/* Close button */}
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 p-2 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}

            {/* Video Info */}
            <div className="mt-2 space-y-1">
                <h4 className="text-sm font-semibold text-gray-200 line-clamp-2">
                    {title}
                </h4>
                {channel && (
                    <p className="text-xs text-gray-400">
                        {channel}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <a
                        href={getWatchUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Watch on YouTube
                    </a>
                </div>
            </div>
        </div>
    );
};

export default YouTubePlayer;
