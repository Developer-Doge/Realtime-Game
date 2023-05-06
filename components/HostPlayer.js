import React from "react";

export default function HostPlayerBubble({ player, score, pageType }) {
  if (pageType == "hostWaiting") {
    return (
      <div class="card w-40 bg-neutral text-neutral-content">
        <div class="card-body items-center text-center">
          <p>{player}</p>
        </div>
      </div>
    );
  } else {
    return (
      <div class="card w-40 bg-neutral text-neutral-content">
        <div class="card-body items-center text-center">
          <p>{player}</p>
          <p>Score: {score}</p>
        </div>
      </div>
    );
  }
  
}
