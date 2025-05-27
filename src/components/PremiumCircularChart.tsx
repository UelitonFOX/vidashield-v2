import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataPoint {
  label: string
  value: number
  color: string
  gradient: string
}

interface PremiumCircularChartProps {
  title: string
  subtitle?: string
  data: DataPoint[]
  size?: number
  strokeWidth?: number
  centerText?: string
  centerValue?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  showLegend?: boolean
  animated?: boolean
}

const PremiumCircularChart: React.FC<PremiumCircularChartProps> = ({
  title,
  subtitle,
  data,
  size = 200,
  strokeWidth = 12,
  centerText,
  centerValue,
  trend,
  trendValue,
  showLegend = true,
  animated = true
}) => {
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)

  const radius = (size - strokeWidth) / 2
  const center = size / 2

  useEffect(() => {
    setIsVisible(true)
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValues(data.map(item => item.value))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValues(data.map(item => item.value))
    }
  }, [data, animated])

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-zinc-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-zinc-400'
    }
  }

  return (
    <div className="relative p-6 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/20 group hover:border-slate-600/30 transition-all duration-500 shadow-2xl overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white/95 mb-1">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-400/80">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-xl border border-slate-700/30">
              {getTrendIcon()}
              <span className={`text-sm font-bold ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {/* Modern Donut Chart */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
            >


              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(71, 85, 105, 0.3)"
                strokeWidth={strokeWidth}
              />

              {/* Data segments - simplified approach */}
              {data.map((item, index) => {
                const animatedValue = animatedValues[index] || 0
                const percentage = (animatedValue / total) * 100
                
                if (percentage === 0) return null

                // Calculate start position for this segment
                let startPercentage = 0
                for (let i = 0; i < index; i++) {
                  startPercentage += (animatedValues[i] || 0) / total * 100
                }

                const strokeDasharray = 2 * Math.PI * radius
                const strokeOffset = strokeDasharray - (strokeDasharray * percentage) / 100
                const rotateAngle = (startPercentage * 360) / 100

                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1200 ease-out ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                                         style={{
                       transform: `rotate(${rotateAngle}deg)`,
                       transformOrigin: `${center}px ${center}px`,
                       transitionDelay: `${index * 150}ms`
                     }}
                  />
                )
              })}
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {centerValue && (
                <div className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)' }}>
                  {centerValue}
                </div>
              )}
              {centerText && (
                <div className="text-sm text-slate-300 font-bold uppercase tracking-widest drop-shadow-md">
                  {centerText}
                </div>
              )}
            </div>
          </div>

          {/* Vibrant Legend */}
          {showLegend && (
            <div className="w-full space-y-2">
              {data.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 transition-all duration-300 border border-slate-600/20 hover:border-slate-500/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 20px ${item.color}60, inset 0 0 10px ${item.color}40`
                          }}
                        />
                        <div
                          className="absolute inset-0 w-4 h-4 rounded-full animate-pulse opacity-70"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white group-hover:text-slate-100">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-lg font-bold"
                        style={{ color: item.color }}
                      >
                        {percentage}%
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PremiumCircularChart 