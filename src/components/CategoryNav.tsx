import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CategoryButtonProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function CategoryButton({ href, isActive, children }: CategoryButtonProps) {
  const router = useRouter();

  return (
    <motion.div
      className="relative"
      style={{ flex: isActive ? 2 : 0.5 }}
      layout
      transition={{
        layout: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
    >
      <button
        onClick={() => router.push(href)}
        className={`w-full h-16 rounded-lg border border-black/10 flex items-center justify-center transition-all ${
          isActive 
            ? 'bg-black/5 text-black' 
            : 'bg-white text-black hover:bg-black/5'
        }`}
      >
        <motion.span 
          className="text-lg font-light truncate px-4"
          layout="position"
        >
          {children}
        </motion.span>
      </button>
    </motion.div>
  );
}

export default function CategoryNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center gap-8 mb-12">
        <button 
          onClick={() => router.push('/app')}
          className="flex items-center justify-center w-12 h-12 rounded-lg border border-black/10 hover:bg-black/5 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5 text-black" />
        </button>

        <motion.div 
          className="flex gap-4 flex-1"
          layout
        >
          <CategoryButton 
            href="/performance" 
            isActive={pathname === '/performance'}
          >
            Performance
          </CategoryButton>
          <CategoryButton 
            href="/technical" 
            isActive={pathname === '/technical'}
          >
            Technical
          </CategoryButton>
          <CategoryButton 
            href="/content" 
            isActive={pathname === '/content'}
          >
            Content
          </CategoryButton>
        </motion.div>
      </div>
    </div>
  );
} 