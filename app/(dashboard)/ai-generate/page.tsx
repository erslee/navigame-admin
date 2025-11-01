import { AIPOIGenerator } from '@/components/ai/ai-poi-generator';

export default function AIGeneratePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        AI POI Generator
      </h1>
      <AIPOIGenerator />
    </div>
  );
}
