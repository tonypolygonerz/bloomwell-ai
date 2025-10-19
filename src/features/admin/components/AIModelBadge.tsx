'use client';

type AIModelBadgeProps = {
  modelTier?: string;
  modelDescription?: string;
  processingTime?: number;
  contextLength?: number;
  queryType?: string;
};

export default function AIModelBadge({
  modelTier,
  modelDescription,
  processingTime,
  contextLength,
  queryType,
}: AIModelBadgeProps) {
  if (!modelTier) return null;

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🏢',
          label: 'Enterprise AI',
          description: '128K Context Analysis',
        };
      case 'professional':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '💼',
          label: 'Professional AI',
          description: '32K Context Processing',
        };
      case 'standard':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🤖',
          label: 'Smart AI',
          description: '8K Context Assistant',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚡',
          label: 'AI Assistant',
          description: 'Cloud Processing',
        };
    }
  };

  const config = getTierConfig(modelTier);

  return (
    <div className='flex items-center space-x-2 text-xs'>
      <div
        className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${config.color}`}
      >
        <span>{config.icon}</span>
        <span className='font-medium'>{config.label}</span>
      </div>

      {modelDescription && (
        <span className='text-gray-500 hidden sm:inline'>
          {modelDescription}
        </span>
      )}

      {contextLength && contextLength > 8000 && (
        <span className='text-gray-500 hidden md:inline'>
          {contextLength.toLocaleString()} context
        </span>
      )}

      {processingTime && (
        <span className='text-gray-500 hidden lg:inline'>
          {processingTime}ms
        </span>
      )}

      {queryType && queryType !== 'general' && (
        <span className='text-gray-500 hidden xl:inline capitalize'>
          {queryType} analysis
        </span>
      )}
    </div>
  );
}
