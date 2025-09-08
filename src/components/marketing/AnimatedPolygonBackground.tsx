"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Polygon {
  id: number;
  points: string;
  fill: string;
  opacity: number;
}

interface FloatingCircle {
  id: number;
  cx: number;
  cy: number;
  r: number;
  duration: number;
}

interface AnimatedPolygonBackgroundProps {
  density?: number;
}

export default function AnimatedPolygonBackground({ density = 1.0 }: AnimatedPolygonBackgroundProps) {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [circles, setCircles] = useState<FloatingCircle[]>([]);

  useEffect(() => {
    // Generate two distinct shape clusters - big blob top-left, smaller blob bottom-right
    const generatePolygons = () => {
      const newPolygons: Polygon[] = [];
      
      // Big blob in top-left (adjustable density)
      const topLeftShapes = Math.floor(60 * density);
      for (let i = 0; i < topLeftShapes; i++) {
        // Bias shapes toward top-left of the blob (closer to 40,40)
        const topLeftBias = Math.random() * 0.7 + 0.3; // 0.3-1.0 bias toward top-left
        const centerX = Math.random() * (400 * topLeftBias) + 40;  // More shapes toward left
        const centerY = Math.random() * (280 * topLeftBias) + 40;  // More shapes toward top
        
        // Larger shapes toward top-left, smaller toward bottom-right
        const sizeMultiplier = topLeftBias; // Bigger shapes when closer to top-left
        const size = Math.random() * (10 * sizeMultiplier) + 6; // Much smaller: 6-16px
        
        // Generate triangle points
        const points = [
          [centerX, centerY - size],
          [centerX - size * 0.866, centerY + size * 0.5],
          [centerX + size * 0.866, centerY + size * 0.5]
        ].map(([x, y]) => `${x},${y}`).join(' ');
        
        const colors = [
          '#a855f7', // brighter purple-500
          '#9333ea', // brighter purple-600
          '#8b5cf6', // brighter purple-500
          '#7c3aed', // purple-700  
          '#6366f1', // indigo-500
          '#818cf8', // indigo-400
        ];
        
        newPolygons.push({
          id: i,
          points,
          fill: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 * topLeftBias + 0.4 + (topLeftBias * 0.35) // Much brighter toward top-left: 0.4-0.95
        });
      }
      
      // Bottom-right blob (adjustable density)
      const bottomRightShapes = Math.floor(50 * density);
      for (let i = topLeftShapes; i < topLeftShapes + bottomRightShapes; i++) {
        // Bias shapes toward bottom-right of the blob (closer to 1120,760)
        const bottomRightBias = Math.random() * 0.7 + 0.3; // 0.3-1.0 bias toward bottom-right
        const centerX = Math.random() * 240 + 880 + (240 * (1 - bottomRightBias));  // More shapes toward right
        const centerY = Math.random() * 180 + 580 + (180 * (1 - bottomRightBias));  // More shapes toward bottom
        
        // Larger shapes toward bottom-right, smaller toward top-left
        const sizeMultiplier = bottomRightBias; // Bigger shapes when closer to bottom-right
        const size = Math.random() * (10 * sizeMultiplier) + 6; // Much smaller: 6-16px
        
        // Generate triangle points
        const points = [
          [centerX, centerY - size],
          [centerX - size * 0.866, centerY + size * 0.5],
          [centerX + size * 0.866, centerY + size * 0.5]
        ].map(([x, y]) => `${x},${y}`).join(' ');
        
        const colors = [
          '#a855f7', // brighter purple-500
          '#9333ea', // brighter purple-600
          '#8b5cf6', // brighter purple-500
          '#7c3aed', // purple-700  
          '#6366f1', // indigo-500
          '#818cf8', // indigo-400
        ];
        
        newPolygons.push({
          id: i,
          points,
          fill: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 * bottomRightBias + 0.45 + (bottomRightBias * 0.4) // Much brighter toward bottom-right: 0.45-1.0
        });
      }
      
      // Scattered shapes across entire space (adjustable density)
      const scatteredShapes = Math.floor(120 * density);
      const startIndex = topLeftShapes + bottomRightShapes;
      for (let i = startIndex; i < startIndex + scatteredShapes; i++) {
        const centerX = Math.random() * 1200;      // X: anywhere across full width
        const centerY = Math.random() * 800;       // Y: anywhere across full height
        const size = Math.random() * 8 + 4;        // Very small shapes: 4-12px
        
        // Generate triangle points
        const points = [
          [centerX, centerY - size],
          [centerX - size * 0.866, centerY + size * 0.5],
          [centerX + size * 0.866, centerY + size * 0.5]
        ].map(([x, y]) => `${x},${y}`).join(' ');
        
        const colors = [
          '#a855f7', // brighter purple-500
          '#9333ea', // brighter purple-600
          '#8b5cf6', // brighter purple-500
          '#7c3aed', // purple-700  
          '#6366f1', // indigo-500
          '#818cf8', // indigo-400
        ];
        
        newPolygons.push({
          id: i,
          points,
          fill: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 + 0.2 // Much more visible: 0.2-0.6
        });
      }
      
      setPolygons(newPolygons);
    };

    const generateCircles = () => {
      const newCircles: FloatingCircle[] = [];
      
      // Circles for big blob in top-left (adjustable density)
      const topLeftCircles = Math.floor(30 * density);
      for (let i = 0; i < topLeftCircles; i++) {
        // Bias circles toward top-left of the blob
        const topLeftBias = Math.random() * 0.7 + 0.3;
        const cx = Math.random() * (360 * topLeftBias) + 60;
        const cy = Math.random() * (240 * topLeftBias) + 60;
        const r = Math.random() * (2.5 * topLeftBias) + 1; // Much smaller circles: 1-3.5px toward top-left
        
        newCircles.push({
          id: i,
          cx,
          cy,
          r,
          duration: 3 + Math.random() * 2
        });
      }
      
      // Circles for bottom-right blob (adjustable density)
      const bottomRightCircles = Math.floor(25 * density);
      for (let i = topLeftCircles; i < topLeftCircles + bottomRightCircles; i++) {
        // Bias circles toward bottom-right of the blob
        const bottomRightBias = Math.random() * 0.7 + 0.3;
        const cx = Math.random() * 220 + 900 + (220 * (1 - bottomRightBias));
        const cy = Math.random() * 160 + 600 + (160 * (1 - bottomRightBias));
        const r = Math.random() * (2.5 * bottomRightBias) + 1; // Much smaller circles: 1-3.5px toward bottom-right
        
        newCircles.push({
          id: i,
          cx,
          cy,
          r,
          duration: 3 + Math.random() * 2
        });
      }
      
      // Scattered tiny circles across entire space (40 circles - reduced density)
      const scatteredStart = topLeftCircles + bottomRightCircles; // Start after the blob circles
      for (let i = scatteredStart; i < scatteredStart + 40; i++) {
        newCircles.push({
          id: i,
          cx: Math.random() * 1200,       // X: anywhere across full width
          cy: Math.random() * 800,        // Y: anywhere across full height
          r: Math.random() * 2 + 1,       // Very tiny circles: 1-3px
          duration: 4 + Math.random() * 3 // Slower animation for subtlety
        });
      }
      
      setCircles(newCircles);
    };

    generatePolygons();
    generateCircles();
  }, [density]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-trenddojo-bg-primary">
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
              opacity: polygon.opacity * 0.8, 
              scale: 0.9,
              rotate: 0
            }}
            animate={{ 
              opacity: [polygon.opacity * 0.6, polygon.opacity, polygon.opacity * 0.3],
              scale: [0.9, 1.2, 0.9],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.min(polygon.id * 0.1, 2),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Additional floating geometric shapes */}
        {circles.map((circle) => (
          <motion.circle
            key={`circle-${circle.id}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="#8b5cf6"
            fillOpacity="0.75"
            initial={{ opacity: 0.4 }}
            animate={{ 
              opacity: [0.3, 0.9, 0.2],
              y: [0, -20, 0]
            }}
            transition={{
              duration: circle.duration,
              delay: Math.min(circle.id * 0.2, 1.5),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      
      {/* Gradient overlay - enhanced for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-trenddojo-bg-primary/60 via-trenddojo-bg-secondary/20 to-trenddojo-bg-primary/70" />
    </div>
  );
}