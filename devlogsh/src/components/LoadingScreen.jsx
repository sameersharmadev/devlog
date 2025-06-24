import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-lightBg dark:bg-darkBg">
            <DotLottieReact
                src="https://lottie.host/fc49a1b3-9eb6-4ef2-bbf9-82b96a6ad9dd/RXSnSNoWLS.lottie"
                loop
                autoplay
                style={{ width: 150, height: 150 }}
            />
        </div>
    );
}