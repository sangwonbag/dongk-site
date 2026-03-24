import deliveryImg from "../assets/news-delivery.png";
import irisImg from "../assets/iris-cover.png"; // Use the uploaded cover image

export const newsSlides = [
    {
        id: "delivery",
        type: "icon",
        title: "KCC, 동신 배송 안내",
        text: "KCC,동신 50평 무료배송 / KCC 20평↑ 배송가능 / 동신 20평↑ 배송가능",
        image: deliveryImg,
        link: "/materials"
    },
    {
        id: "iris",
        type: "banner",
        title: "아이리스(IRIS) 벽지 신상출시",
        text: "친환경 합지벽지 아이리스 / 신상 시리즈를 확인해보세요",
        image: irisImg, // Use specific cover
        link: "/samplebooks?bookId=shinhan-iris-2025", // Deep link
    },
];
