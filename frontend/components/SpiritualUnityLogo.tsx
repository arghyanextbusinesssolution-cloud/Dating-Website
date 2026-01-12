import Link from 'next/link';

interface SpiritualUnityLogoProps {
  className?: string;
}

export const SpiritualUnityLogo = ({ className = "" }: SpiritualUnityLogoProps) => {
  return (
    <Link
      href="/"
      className={`relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black ${className}`}
    >
      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">💜</span>
      </div>
      {/* <span className="font-medium text-black dark:text-white">Spiritual Unity Match</span> */}
    </Link>
  );
};