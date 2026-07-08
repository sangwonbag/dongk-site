import React from "react";
import { FileWarning } from "lucide-react";
import "./PdfUnavailable.css";

export default function PdfUnavailable({ title = "PDF 미등록 상태", message = "해당 샘플북의 PDF 카탈로그가 아직 준비되지 않았습니다." }) {
  return (
    <div className="ui-pdf-unavailable-box">
      <FileWarning size={28} className="ui-pdf-unavailable-icon" />
      <div className="ui-pdf-unavailable-text-group">
        <h4 className="ui-pdf-unavailable-title">{title}</h4>
        <p className="ui-pdf-unavailable-desc">{message}</p>
      </div>
    </div>
  );
}
