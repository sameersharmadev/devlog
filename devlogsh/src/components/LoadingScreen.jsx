import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-lightBg dark:bg-darkBg">
            <DotLottieReact
                src="/animations/loading.lottie" 
                loop
                autoplay
                style={{ width: 150, height: 150 }}
            />
        </div>
    );
}
