import React from "react";

export default function HostPlayerBubble({ player, score, pageType }) {
  if (pageType === "hostWaiting") {
    return (
      <div className="card w-40 p-4 flex items-center justify-center bg-base-200 text-base-content">
        <p className="text-lg font-bold">{player}</p>
      </div>
    );
  } else {
    return (
      <div className="card w-40 p-4 flex flex-col items-center justify-center bg-base-200 text-base-content">
        <p className="text-lg font-bold">{player}</p>
        <p className="text-sm">Score: {score}</p>
      </div>
    );
  }
}
