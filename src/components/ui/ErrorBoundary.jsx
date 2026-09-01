import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught React Error Exception:", {
      pathname: window.location.pathname,
      error: error?.message || error,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#FAF8F2",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "36px 28px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            maxWidth: "480px",
            width: "100%"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#191919", marginBottom: "12px" }}>
              페이지를 불러오는 중 오류가 발생했습니다.
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: "1.6" }}>
              일시적인 네트워크 또는 웹페이지 업데이트 문제일 수 있습니다. 아래 버튼을 눌러 다시 시도해주세요.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#3A2A1E",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                페이지 새로고침
              </button>
              <a
                href="/"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#E6E2D8",
                  color: "#3A2A1E",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "none"
                }}
              >
                메인으로 이동
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
