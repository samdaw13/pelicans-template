import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchImage } from '../api/client.ts';

type Image = NonNullable<Awaited<ReturnType<typeof fetchImage>>>;

const MAX_HISTORY = 5;
const PLAY_INTERVAL_MS = 2000;

export function useImageSlideshow() {
  const [history, setHistory] = useState<Image[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNoMore, setShowNoMore] = useState(false);

  const isFirstFetch = useRef(true);

  const { mutate: loadImage, isPending, isError } = useMutation({
    mutationFn: fetchImage,
    onSuccess(data) {
      if (!data) return;
      if (isFirstFetch.current) {
        isFirstFetch.current = false;
        setHistory([data]);
        setCurrentIndex(0);
      } else {
        setHistory(prev => {
          const next = [...prev, data].slice(-MAX_HISTORY);
          setCurrentIndex(next.length - 1);
          return next;
        });
      }
    },
  });

  // Initial load — calling mutate() in an effect is a side-effect action, not setState
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleNext = useCallback(() => {
    setShowNoMore(false);
    if (currentIndex < history.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      loadImage();
    }
  }, [currentIndex, history.length, loadImage]);

  const handlePrevious = useCallback(() => {
    setShowNoMore(false);
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else {
      setShowNoMore(true);
    }
  }, [currentIndex]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  // Keep a stable ref to handleNext so the interval doesn't restart every render
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => handleNextRef.current(), PLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  return {
    image: history[currentIndex] ?? null,
    isLoading: isPending,
    isError,
    isPlaying,
    showNoMore,
    canGoPrevious: currentIndex > 0,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onPlay: handlePlay,
    onPause: handlePause,
  };
}
