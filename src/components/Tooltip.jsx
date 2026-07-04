import React from "react";

const TooltipItem = ({ children, tooltipsText, position }) => {
  const tooltipPosition =
    (position === "right" &&
      "left-full top-1/2 ml-3 -translate-y-1/2") ||
    (position === "top" &&
      "bottom-full left-1/2 mb-3 -translate-x-1/2") ||
    (position === "left" &&
      "right-full top-1/2 mr-3 -translate-y-1/2") ||
    "left-1/2 top-full mt-3 -translate-x-1/2";

  const arrowPosition =
    (position === "right" &&
      "left-[-3px] top-1/2 -translate-y-1/2") ||
    (position === "top" &&
      "bottom-[-3px] left-1/2 -translate-x-1/2") ||
    (position === "left" &&
      "right-[-3px] top-1/2 -translate-y-1/2") ||
    "left-1/2 top-[-3px] -translate-x-1/2";

  return (
    <div className="group relative min-w-0">
      <button
        className="block w-full truncate rounded text-inherit"
        title={typeof tooltipsText === "string" ? tooltipsText : undefined}
      >
        {children}
      </button>
      <div
        className={`pointer-events-none absolute z-40 max-w-xs break-words rounded-lg bg-slate-950/82 px-3 py-2 text-xs font-semibold leading-5 text-white opacity-0 shadow-xl backdrop-blur-xl transition group-hover:opacity-100 ${tooltipPosition}`}
      >
        <span
          className={`absolute -z-10 h-2 w-2 rotate-45 rounded-sm bg-slate-950/82 ${arrowPosition}`}
        ></span>
        {tooltipsText}
      </div>
    </div>
  );
};


export default TooltipItem;
