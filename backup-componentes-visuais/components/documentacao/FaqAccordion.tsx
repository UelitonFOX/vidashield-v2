import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { FaqItemProps } from "./types";

interface FaqAccordionProps {
  items: FaqItemProps[];
}

/**
 * Componente de acordeão para exibir perguntas frequentes
 */
const FaqAccordion: React.FC<FaqAccordionProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-zinc-700 rounded-lg overflow-hidden">
          <button
            className="w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 flex justify-between items-center"
            onClick={() => toggleAccordion(index)}
          >
            <span className="text-zinc-100">{item.question}</span>
            <ChevronRight 
              className={`text-green-400 transition-transform ${activeIndex === index ? 'rotate-90' : ''}`} 
              size={18} 
            />
          </button>
          {activeIndex === index && (
            <div className="p-4 bg-zinc-800/50 text-zinc-300 border-t border-zinc-700">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion; 