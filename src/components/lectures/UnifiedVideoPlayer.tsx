import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link2,
  Maximize2,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LectureBookmark, VideoSourceType } from '../../types/physics';

interface UnifiedVideoPlayerProps {
  lectureId: string;
  title: string;
  sourceType: VideoSourceType;
  videoUrl: string;
  chapters: LectureBookmark[];
  seekRequest: { seconds: number; nonce: number } | null;
  onAttachSource?: (url: string, type: VideoSourceType) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim() || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] ?? null;
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

export function detectSourceType(url: string): VideoSourceType {
  if (extractYouTubeId(url)) return 'youtube';
  const lower = url.toLowerCase();
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.startsWith('blob:') ||
    lower.startsWith('/')
  ) {
    return 'mp4';
  }
  return 'external';
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export const UnifiedVideoPlayer: React.FC<UnifiedVideoPlayerProps> = ({
  lectureId,
  title,
  sourceType,
  videoUrl,
  chapters,
  seekRequest,
  onAttachSource,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [draftUrl, setDraftUrl] = useState(videoUrl);

  // Reset state when switching lectures
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMediaError(false);
    setDraftUrl(videoUrl);
    setShowSourceInput(false);
  }, [lectureId, videoUrl]);

  const effectiveType = useMemo(() => {
    if (!videoUrl) return sourceType;
    return detectSourceType(videoUrl);
  }, [videoUrl, sourceType]);

  const youtubeId = useMemo(() => {
    if (effectiveType !== 'youtube') return null;
    return extractYouTubeId(videoUrl);
  }, [effectiveType, videoUrl]);

  // Handle timestamp marker seek requests
  useEffect(() => {
    if (!seekRequest) return;
    if (effectiveType === 'mp4' && videoRef.current) {
      videoRef.current.currentTime = seekRequest.seconds;
      setCurrentTime(seekRequest.seconds);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else if (effectiveType === 'youtube' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seekRequest.seconds, true],
        }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: [],
        }),
        '*'
      );
    }
  }, [seekRequest, effectiveType]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  const handleCycleSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackRate(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAttachSource) return;
    const cleaned = draftUrl.trim();
    if (!cleaned) return;
    onAttachSource(cleaned, detectSourceType(cleaned));
    setMediaError(false);
    setShowSourceInput(false);
  };

  const handleLocalFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onAttachSource) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    onAttachSource(blobUrl, 'mp4');
    setMediaError(false);
    setShowSourceInput(false);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-[#14181F]/15 bg-[#14181F] text-[#FAF8F5]"
    >
      {/* Hidden local video file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        className="hidden"
        onChange={handleLocalFilePick}
      />

      {/* Video Stage */}
      <div className="relative aspect-video w-full bg-[#0E1117]">
        {effectiveType === 'youtube' && youtubeId ? (
          <iframe
            ref={iframeRef}
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : effectiveType === 'external' && videoUrl ? (
          <iframe
            ref={iframeRef}
            title={title}
            src={videoUrl}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : !mediaError && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain cursor-pointer"
            playsInline
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration || 0);
              e.currentTarget.playbackRate = playbackRate;
            }}
            onError={() => setMediaError(true)}
          />
        ) : null}

        {/* Clean Fallback Stage when MP4 not supplied yet */}
        {(mediaError || !videoUrl) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#14181F] px-6 text-center">
            <p className="font-math text-[11px] tracking-wider text-[#FAF8F5]/65">
              STREAM UNAVAILABLE // {videoUrl || 'NO SOURCE'}
            </p>
            <h3 className="font-editorial mt-2 max-w-lg text-xl font-semibold text-[#FAF8F5]">
              {title}
            </h3>
            {onAttachSource && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 bg-[#FAF8F5] px-4 py-2 font-math text-[11px] font-semibold text-[#14181F] cursor-pointer hover:bg-white transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>LOAD LOCAL MP4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSourceInput(true)}
                  className="inline-flex items-center gap-2 border border-white/25 px-4 py-2 font-math text-[11px] font-medium text-[#FAF8F5] cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>BIND YOUTUBE / MP4 URL</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Archival MP4 Transport Bar */}
      {effectiveType === 'mp4' && !mediaError && videoUrl && (
        <div className="border-t border-white/10 bg-[#14181F] px-4 py-3 space-y-2.5">
          {/* Scrubber with chapter markers */}
          <div className="relative flex items-center">
            <input
              type="range"
              aria-label="Seek video timeline"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#FAF8F5]"
            />
            {duration > 0 &&
              chapters.map((chap) => {
                const pct = Math.min(100, Math.max(0, (chap.timeSeconds / duration) * 100));
                return (
                  <span
                    key={chap.timeSeconds}
                    title={chap.label}
                    style={{ left: `${pct}%` }}
                    className="pointer-events-none absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-[#F59E0B]"
                  />
                );
              })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause lecture' : 'Play lecture'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-[#FAF8F5] cursor-pointer hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={muted ? 'Unmute video' : 'Mute video'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#FAF8F5]/80 cursor-pointer hover:bg-white/10 transition-colors"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <span className="font-math text-xs text-[#FAF8F5]/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="font-math rounded border border-white/15 px-2.5 py-1 text-xs text-[#FAF8F5] cursor-pointer hover:bg-white/10 transition-colors"
              >
                {playbackRate}x
              </button>

              {onAttachSource && (
                <button
                  type="button"
                  onClick={() => setShowSourceInput((prev) => !prev)}
                  className="rounded border border-white/15 px-2.5 py-1 text-xs text-[#FAF8F5]/80 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  Change Source
                </button>
              )}

              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Toggle fullscreen"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#FAF8F5]/80 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Toolbar for YouTube / External Embeds */}
      {(effectiveType === 'youtube' || effectiveType === 'external') && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#14181F] px-4 py-2.5 text-xs text-[#FAF8F5]/75">
          <span>
            Source: {effectiveType === 'youtube' ? 'YouTube Stream' : 'External Video Embed'}
          </span>
          {onAttachSource && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-white underline-offset-4 hover:underline cursor-pointer"
              >
                Switch to Local MP4
              </button>
              <button
                type="button"
                onClick={() => setShowSourceInput((prev) => !prev)}
                className="hover:text-white underline-offset-4 hover:underline cursor-pointer"
              >
                Change URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline URL Binder Drawer */}
      {showSourceInput && (
        <form
          onSubmit={handleSaveCustomUrl}
          className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#1A2029] px-4 py-3"
        >
          <input
            type="text"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="Paste YouTube URL, direct .mp4 link, or /my-lecture.mp4"
            className="min-w-[240px] flex-1 rounded border border-white/20 bg-[#14181F] px-3 py-1.5 text-xs text-[#FAF8F5] placeholder:text-[#FAF8F5]/40 focus:border-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-[#FAF8F5] px-3.5 py-1.5 text-xs font-semibold text-[#14181F] cursor-pointer hover:bg-white transition-colors"
          >
            Bind Stream
          </button>
          <button
            type="button"
            onClick={() => setShowSourceInput(false)}
            className="rounded px-3 py-1.5 text-xs text-[#FAF8F5]/70 cursor-pointer hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
