export default function Tooltip({ children, text, position = "top" }) {
  return (
    <div className="relative inline-block group mr-2">
      {/* Wrapped Content */}
      {children}

      {/* Tooltip */}
      <div
        className={`
          absolute whitespace-nowrap px-2 py-1 text-xs rounded
          bg-black text-white
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none z-100

          ${
            position === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : ""
          }
          ${
            position === "bottom"
              ? "top-full left-1/2 -translate-x-1/2 mt-2"
              : ""
          }
          ${
            position === "left"
              ? "right-full top-1/2 -translate-y-1/2 mr-2"
              : ""
          }
          ${
            position === "right"
              ? "left-full top-1/2 -translate-y-1/2 ml-2"
              : ""
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}
