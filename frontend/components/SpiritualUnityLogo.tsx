import Link from 'next/link';
import Image from 'next/image';

interface SpiritualUnityLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const SpiritualUnityLogo = ({ className = "", width = 40, height = 40 }: SpiritualUnityLogoProps) => {
  return (
    <Link
      href="/"
      className={`relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 ${className}`}
    >
      <div className="relative" style={{ width, height }}>
        <Image
          src="/logo.webp"
          alt="Spiritual Unity Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {/* <span className="font-medium text-black dark:text-white">Spiritual Unity Match</span> */}
    </Link>
  );
};