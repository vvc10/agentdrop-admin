"use client";

interface ChartData {
  month: string;
  value: number;
  isCurrent?: boolean;
}

interface ChartProps {
  title: string;
  currentValue: string;
  change: string;
  data: ChartData[];
  height?: number;
}

export default function Chart({ title, currentValue, change, data, height = 200 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{currentValue}</div>
          <div className="text-sm text-green-600 font-medium">{change}</div>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        {/* Chart bars */}
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    item.isCurrent 
                      ? 'bg-gray-900' 
                      : 'bg-gray-300'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
                <div className="text-xs text-gray-600 mt-2">{item.month}</div>
              </div>
            );
          })}
        </div>
        
        {/* Current month indicator */}
        {data.find(item => item.isCurrent) && (
          <div className="absolute top-0 left-0 right-0">
            <div className="flex justify-center">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                {data.find(item => item.isCurrent)?.month} Earning: {currentValue}
              </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-300 mt-2"></div>
          </div>
        )}
      </div>
    </div>
  );
}
