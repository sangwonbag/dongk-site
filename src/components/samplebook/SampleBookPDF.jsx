import React from "react";
import { Document, Page, Image, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register NanumGothic from Google Fonts for Korean support
Font.register({
    family: "NanumGothic",
    src: "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf",
});

const styles = StyleSheet.create({
    coverPage: {
        width: "100%",
        height: "100%",
        fontFamily: "NanumGothic", // Added for Korean support
    },
    coverImage: { width: "100%", height: "100%", objectFit: "cover" },

    page: {
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 24,
        fontFamily: "NanumGothic", // Added for Korean support
    },
    pageNumber: {
        position: "absolute",
        bottom: 14,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 10,
        color: "#666",
    },

    title: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
    itemRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#eee" },
    itemText: { fontSize: 11 },
});

export function SampleBookPDF({ coverImage, materials, title = "샘플북" }) {
    return (
        <Document>
            {/* 1) 커버 */}
            <Page size="A4" style={styles.coverPage}>
                <Image src={coverImage} style={styles.coverImage} />
                {/* Added page number to cover as well if needed, or keeping user snippet structure */}
            </Page>

            {/* 2) 본문 */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{title}</Text>

                {materials.map((m, idx) => (
                    <View key={`${m.code || m.id || idx}`} style={styles.itemRow}>
                        <Text style={styles.itemText}>
                            {m.brand} / {m.category} / {m.code} / {m.name}
                        </Text>
                    </View>
                ))}

                {/* 페이지 번호 */}
                <Text
                    style={styles.pageNumber}
                    fixed
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                />
            </Page>
        </Document>
    );
}

export default SampleBookPDF;
