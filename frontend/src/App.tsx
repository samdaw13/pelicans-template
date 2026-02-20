import './App.css';
import { useImageSlideshow } from './hooks/useImageSlideshow.ts';

function App() {
  const {
    image,
    isLoading,
    isError,
    isPlaying,
    showNoMore,
    onNext,
    onPrevious,
    onPlay,
    onPause,
  } = useImageSlideshow();

  return (
    <div className="slideshow">
      <h1>Pelicans</h1>

      <div className="image-container">
        {isLoading && <div className="status">Loading...</div>}
        {isError && <div className="status error">Failed to load image. Please try again.</div>}
        {image && !isLoading && (
          <>
            <img src={image.url} alt={image.alt} className="slideshow-image" />
            <p className="credit">
              Photo by{' '}
              <a href={image.photographerUrl} target="_blank" rel="noreferrer">
                {image.photographer}
              </a>{' '}
              on Unsplash
            </p>
          </>
        )}
      </div>

      {showNoMore && <p className="no-more">No more images!</p>}

      <div className="controls">
        <button onClick={onPrevious} disabled={isLoading}>
          ← Previous
        </button>
        {isPlaying ? (
          <button onClick={onPause}>Pause</button>
        ) : (
          <button onClick={onPlay} disabled={isLoading}>
            Play
          </button>
        )}
        <button onClick={onNext} disabled={isLoading}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default App;
