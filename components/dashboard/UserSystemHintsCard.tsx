import { Search, Image, BrainCircuit, FileText, BookOpen } from 'lucide-react';
import GlassCard from '../cards/GlassCard';

interface UserSystemHintsData {
  search?: number; // Made optional
  picture?: number;
  picture_v2?: number;
  reason?: number;
  canvas?: number;
  tatertot?: number;
}

interface UserSystemHintsCardProps {
  data: UserSystemHintsData;
}

export default function UserSystemHintsCard({ data }: UserSystemHintsCardProps) {
  const totalPicture = (data.picture ?? 0) + (data.picture_v2 ?? 0);
  const hints = [
    {
      icon: <Search className="w-7 h-7" />,
      label: 'Search',
      value: data.search ?? 0, // Added null coalescing operator
      description: 'times used search hint',
      iconColor: 'text-blue-500',
      bgGlow: 'bg-blue-500/20',
      gradientFrom: 'from-blue-500/10',
      valueColor: 'text-blue-500/90 dark:text-blue-400/90',
      hoverGlow: 'bg-blue-500/5'
    },
    {
      icon: <Image className="w-7 h-7" />,
      label: 'Picture',
      value: totalPicture,
      description: 'times used picture hint',
      iconColor: 'text-green-500',
      bgGlow: 'bg-green-500/20',
      gradientFrom: 'from-green-500/10',
      valueColor: 'text-green-500/90 dark:text-green-400/90',
      hoverGlow: 'bg-green-500/5'
    },
    {
      icon: <BrainCircuit className="w-7 h-7" />,
      label: 'Reason',
      value: data.reason ?? 0,
      description: 'times used reason hint',
      iconColor: 'text-teal-500',
      bgGlow: 'bg-teal-500/20',
      gradientFrom: 'from-teal-500/10',
      valueColor: 'text-teal-500/90 dark:text-teal-400/90',
      hoverGlow: 'bg-teal-500/5'
    },
    {
      icon: <FileText className="w-7 h-7" />,
      label: 'Canvas',
      value: data.canvas ?? 0,
      description: 'times used canvas hint',
      iconColor: 'text-amber-500',
      bgGlow: 'bg-amber-500/20',
      gradientFrom: 'from-amber-500/10',
      valueColor: 'text-amber-500/90 dark:text-amber-400/90',
      hoverGlow: 'bg-amber-500/5'
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      label: 'Study & Learn',
      value: data.tatertot ?? 0,
      description: 'times used study mode',
      iconColor: 'text-indigo-500',
      bgGlow: 'bg-indigo-500/20',
      gradientFrom: 'from-indigo-500/10',
      valueColor: 'text-indigo-500/90 dark:text-indigo-400/90',
      hoverGlow: 'bg-indigo-500/5'
    }
  ];

  return (
    <GlassCard>
      <div className="relative p-2">
        <h3 className="text-2xl font-semibold text-gray-800/90 dark:text-white/90 mb-8 pl-2">
          User System Hints
        </h3>

        {/* Grid layout: 2 columns on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {hints.map((hint) => (
            <div
              key={hint.label}
              className="group relative isolate"
            >
              <div className="relative h-full">
                <div className={`absolute inset-0 bg-gradient-to-b ${hint.gradientFrom} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}>
                </div>
                <div className="relative backdrop-blur-[2px] rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl
                              dark:bg-gray-900/[0.02] dark:border-gray-700/[0.05]
                              transition-all duration-500 ease-out">
                    
                    <div className="relative mb-4 inline-block">
                      <div className={`absolute inset-0 ${hint.bgGlow} blur-xl 
                                    scale-150 opacity-0 group-hover:opacity-100 
                                    transition-opacity duration-500`}>
                      </div>
                      <div className={`relative z-10 ${hint.iconColor} 
                                    transition-transform duration-500 ease-out
                                    group-hover:scale-110 group-hover:-rotate-12`}>
                        {hint.icon}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`text-4xl md:text-5xl font-bold tracking-tight ${hint.valueColor}
                                    transition-transform duration-500
                                    group-hover:translate-x-1`}>
                        {hint.value}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400
                                    transition-opacity duration-500
                                    opacity-70 group-hover:opacity-100">
                        {hint.description}
                      </div>
                    </div>

                    <div className={`absolute right-4 top-4 w-20 h-20 
                                   ${hint.bgGlow} rounded-full blur-2xl opacity-0 
                                   group-hover:opacity-100 transition-all duration-700
                                   group-hover:scale-150`}>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                              bg-gradient-to-r from-transparent via-white/[0.02] to-transparent
                              blur-sm transition-opacity duration-500">
                </div>
              </div>

              <div className={`absolute -z-10 inset-0 ${hint.hoverGlow}
                             rounded-2xl transition-transform duration-500
                             group-hover:scale-105 opacity-0 group-hover:opacity-100`}>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute -top-20 -right-20 w-60 h-60 
                       bg-gradient-to-br from-blue-500/10 via-green-500/10 to-teal-500/10 to-amber-500/10
                       rounded-full blur-3xl opacity-30 mix-blend-overlay pointer-events-none">
        </div>
      </div>
    </GlassCard>
  );
}