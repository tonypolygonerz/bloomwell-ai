'use client';

interface PromptSuggestion {
  text: string;
  category: 'grants' | 'compliance' | 'strategy' | 'board' | 'fundraising';
  icon?: string;
}

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  // Grants & Funding
  {
    text: 'Find grants for youth programs in my state',
    category: 'grants',
    icon: '🎯',
  },
  {
    text: 'Show me foundation grants closing this month',
    category: 'grants',
    icon: '📅',
  },
  {
    text: 'What grants are available for small nonprofits under $500K budget?',
    category: 'grants',
    icon: '💰',
  },

  // Compliance & Legal
  {
    text: 'Help me understand 990 filing requirements',
    category: 'compliance',
    icon: '📋',
  },
  {
    text: 'What are the requirements for 501(c)(3) status?',
    category: 'compliance',
    icon: '⚖️',
  },

  // Strategy & Planning
  {
    text: 'How do I build an effective board of directors?',
    category: 'board',
    icon: '👥',
  },
  {
    text: 'Help me create a strategic plan for next year',
    category: 'strategy',
    icon: '📈',
  },

  // Fundraising
  {
    text: 'What are creative fundraising ideas for small nonprofits?',
    category: 'fundraising',
    icon: '🎁',
  },
  {
    text: 'How do I write a compelling grant proposal?',
    category: 'grants',
    icon: '✍️',
  },
];

interface ChatPromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

export function ChatPromptSuggestions({
  onSelectPrompt,
  className = '',
}: ChatPromptSuggestionsProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div
        className='group flex overflow-hidden p-2 flex-col relative w-full'
        style={
          {
            '--duration': '40s',
            '--gap': '1rem',
            height: '120px',
          } as React.CSSProperties
        }
      >
        {/* Duplicate content 4 times for seamless loop */}
        {[...Array(4)].map((_, groupIndex) => (
          <div
            key={groupIndex}
            className='flex shrink-0 flex-col gap-3 animate-marquee-vertical group-hover:[animation-play-state:paused]'
          >
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <p
                key={`${groupIndex}-${index}`}
                onClick={() => onSelectPrompt(suggestion.text)}
                className='hover:text-gray-900 cursor-pointer rounded-full px-4 py-2 text-sm tracking-tight transition-colors duration-100 ease-in-out text-gray-600'
              >
                {suggestion.text}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Top gradient fade */}
      <div className='pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white'></div>

      {/* Bottom gradient fade */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white'></div>
    </div>
  );
}
