import { cn } from '@/lib/utils';

const BrandMark = ({
  compact = false,
  className,
  showCaption = true,
}: {
  compact?: boolean;
  className?: string;
  showCaption?: boolean;
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative isolate">
        <div className="absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.5),_transparent_58%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.42),_transparent_62%)] blur-xl" />
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/50 bg-[linear-gradient(145deg,#0f172a,#1d4ed8)] shadow-[0_18px_40px_rgba(7,10,20,0.14)] dark:border-white/10 dark:shadow-[0_22px_48px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-[3px] rounded-[1rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
          <div className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_18px_rgba(96,165,250,0.8)]" />
          <div className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-[#2dd4bf] shadow-[0_0_18px_rgba(45,212,191,0.8)]" />
          <span className="relative text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-white">
            OP
          </span>
        </div>
      </div>

      {!compact && (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-[0.18em] text-[#111827] dark:text-white">
            OpenPerplexity
          </span>
          {showCaption && (
            <span className="truncate text-[0.65rem] uppercase tracking-[0.28em] text-black/45 dark:text-white/45">
              Research workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandMark;
