"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Polygon {
  id: number;
  points: string;
  fill: string;
  opacity: number;
}

export default function AnimatedPolygonBackground() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  useEffect(() => {
    // Generate random polygons for background
    const generatePolygons = () => {
      const newPolygons: Polygon[] = [];
      
      for (let i = 0; i < 12; i++) {
        const centerX = Math.random() * 1200;
        const centerY = Math.random() * 800;
        const size = Math.random() * 100 + 50;
        
        // Generate triangle points
        const points = [
          [centerX, centerY - size],
          [centerX - size * 0.866, centerY + size * 0.5],
          [centerX + size * 0.866, centerY + size * 0.5]
        ].map(([x, y]) => `${x},${y}`).join(' ');
        
        const colors = [
          '#3B82F6', // blue-500
          '#6366F1', // indigo-500  
          '#8B5CF6', // violet-500
          '#A855F7', // purple-500
          '#EC4899', // pink-500
        ];
        
        newPolygons.push({
          id: i,
          points,
          fill: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.3 + 0.1
        });
      }
      
      setPolygons(newPolygons);
    };

    generatePolygons();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg 
        className="w-full h-full" 
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="polygonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        
        {polygons.map((polygon) => (
          <motion.polygon
            key={polygon.id}
            points={polygon.points}
            fill={polygon.fill}
            fillOpacity={polygon.opacity}
            stroke={polygon.fill}
            strokeWidth="1"
            strokeOpacity="0.2"
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              rotate: 0
            }}
            animate={{ 
              opacity: [0.1, polygon.opacity, 0.1],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: polygon.id * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Additional floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={`circle-${i}`}
            cx={Math.random() * 1200}
            cy={Math.random() * 800}
            r={Math.random() * 3 + 2}
            fill="#64748b"
            fillOpacity="0.4"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/80" />
    </div>
  );
}