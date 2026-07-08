import React from "react";
import { Image } from "lucide-react";
import "./ImagePlaceholder.css";

export default function ImagePlaceholder({ text = "이미지 준비중", subtext = "상품코드 기준 이미지 확인 필요" }) {
  return (
    <div className="ui-image-placeholder-container">
      <Image size={24} className="ui-image-placeholder-icon" />
      <span className="ui-image-placeholder-text">{text}</span>
      {subtext && <span className="ui-image-placeholder-subtext">{subtext}</span>}
    </div>
  );
}
