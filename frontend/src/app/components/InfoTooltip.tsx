import React from 'react';

interface InfoTooltipProps {
  text: string;
  href?: string;
}

export default function InfoTooltip({ text, href }: InfoTooltipProps) {
  return (
    <span className="relative inline-flex items-center group align-middle ml-1">
      <span
        aria-label="info"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold cursor-default"
      >
        i
      </span>
      <span className="absolute z-10 hidden group-hover:block -top-2 left-5 w-64 bg-black text-white text-xs p-2 rounded shadow-lg">
        {text}
        {href && (
          <>
            {' '}
            <a href={href} target="_blank" rel="noreferrer" className="underline text-blue-300">
              Learn more
            </a>
          </>
        )}
      </span>
    </span>
  );
}

