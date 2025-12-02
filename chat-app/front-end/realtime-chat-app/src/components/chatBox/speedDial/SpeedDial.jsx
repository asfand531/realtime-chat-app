import { useState } from "react";
import { speedDialActions } from "./speedDialActions";

function SpeedDial() {
  const [isOpenAction, setIsOpenAction] = useState(false);

  const moreActions = (
    <svg
      aria-label="New"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );

  const closeActions = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="#e3e3e3"
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );

  const handleFile = (event, label) => {
    const file = event.target.files[0];
    if (!file) return;
    console.log(`[${label}] Selected: `, file);
  };

  const handleAction = () => {
    console.log("Action: " + isOpenAction);
    setIsOpenAction((prev) => !prev);
  };

  return (
    <>
      <div className="fab is-drawer-close:left-18 bottom-5 right-auto">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-lg btn-circle btn-primary tooltip tooltip-right"
          data-tip={isOpenAction ? "Close actions" : "More actions"}
          onClick={handleAction}
        >
          <svg
            aria-label="New"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={`size-6 transition-transform duration-500 ${
              isOpenAction ? "rotate-45" : "rotate-0"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>

        {speedDialActions.map((item, i) => (
          <div key={i}>
            <button
              className="btn btn-lg btn-circle tooltip tooltip-right"
              data-tip={item.label}
              onClick={() => document.getElementById(item.id)?.click()}
            >
              {item.icon}
            </button>

            <input
              id={item.id}
              type="file"
              accept={item.accept}
              capture={item.capture}
              style={{ display: "none" }}
              onChange={(e) => handleFile(e, item.label)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default SpeedDial;
