import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingScreen({ isLoading }) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [opacityClass, setOpacityClass] = useState('opacity-100'); // full opacity from start

  useEffect(() => {
    if (!isLoading) {
      // Fade out
      setOpacityClass('opacity-0');
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    } else {
      // If loading starts again, immediately show at full opacity
      setShouldRender(true);
      setOpacityClass('opacity-100');
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-lightBg dark:bg-darkBg transition-opacity duration-300 ${opacityClass}`}
    >
      <DotLottieReact
        src="/animations/loading.lottie"
        loop
        autoplay
        style={{ width: 150, height: 150 }}
      />
    </div>
  );
}
