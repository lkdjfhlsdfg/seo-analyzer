import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface CategoryButtonProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

interface Problem {
  title: string;
  impact: string;
  score: number;
  simple_summary: string;
  recommendations: string[];
}

interface AnalysisData {
  content: Problem[];
  technical: Problem[];
  performance: Problem[];
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
  const currentCategory = pathname?.split('/')[1] as keyof typeof baseSummaries;
  const [problemCounts, setProblemCounts] = useState({ performance: 0, technical: 0, content: 0 });

  const baseSummaries = {
    performance: "Analysis of your website's loading speed, responsiveness, and overall performance metrics.",
    technical: "Analysis of your website's technical health including mobile-friendliness, accessibility, and crawlability.",
    content: "Analysis of your website's content quality, relevance, and optimization for search engines."
  };

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as AnalysisData;
        setProblemCounts({
          performance: parsedData.performance?.length || 0,
          technical: parsedData.technical?.length || 0,
          content: parsedData.content?.length || 0
        });
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
  }, []);

  const getSummary = (category: keyof typeof baseSummaries) => {
    return `${baseSummaries[category]} Showing ${problemCounts[category]} issues ordered by impact and priority.`;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="border border-black/10 rounded-lg p-8">
        <div className="flex items-center gap-8 mb-6">
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

        {/* Summary Text */}
        {currentCategory && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-black/70 font-light"
          >
            {getSummary(currentCategory)}
          </motion.p>
        )}
      </div>
    </div>
  );
} 