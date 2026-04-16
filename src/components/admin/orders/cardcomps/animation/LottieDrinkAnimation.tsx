"use client";

import Lottie from "lottie-react";
import mixingAnimation from "../../../../../../public/lottie/mixing.json";

export default function LottieDrinkAnimation() {
  return (
    <div className="w-20 h-20">
      <Lottie animationData={mixingAnimation} loop />
    </div>
  );
}