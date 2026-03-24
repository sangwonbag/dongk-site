/**
 * 브랜드 및 두께 관련 유틸리티
 */

/**
 * 텍스트에서 두께 패턴(x.xT)을 추출합니다.
 * @param {string} text - 제목 또는 이름
 * @returns {string|null} - 추출된 두께 (예: "1.8T")
 */
export const getThicknessToken = (text) => {
    if (!text) return null;
    const match = text.match(/(\d+(?:\.\d+)?)T/);
    return match ? match[1] + "T" : null;
};

/**
 * 카테고리가 "장판"인 경우 "LX" + "두께" 형태의 브랜드명을 반환합니다.
 * @param {Object} item - 자재 또는 샘플북 객체
 * @returns {string} - 계산된 브랜드명
 */
export const getComputedBrand = (item) => {
    if (!item) return "기타";

    const originalBrand = (item.brand || "기타").trim();

    if (item.category === "장판") {
        // 장판인 경우 이름(title)이나 기존 thickness 필드에서 두께 추출
        const textToSearch = item.title || item.name || "";
        const thickness = getThicknessToken(textToSearch) || item.thickness || "";

        if (thickness) {
            // "1.8T" -> "LX1.8T"
            const cleanThickness = thickness.replace(/[()]/g, ""); // 괄호 제거
            return `LX ${cleanThickness}`;
        }
    }

    return originalBrand;
};
