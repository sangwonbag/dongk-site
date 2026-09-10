import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `ERR-ROOT-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ORIGINAL_APP_ERROR', error);
    console.error('ERROR_NAME', error?.name);
    console.error('ERROR_MESSAGE', error?.message);
    console.error('ERROR_STACK', error?.stack);
    console.error('ERROR_CAUSE', error?.cause);
    console.error('CURRENT_URL', typeof window !== 'undefined' ? window.location.href : '');
    console.error('REACT_ERROR', error);
    console.error('COMPONENT_STACK', errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const errMessage = String(this.state.error?.message || this.state.error || '');
      
      const isChunkError =
        errMessage.includes('Failed to fetch dynamically imported module') ||
        errMessage.includes('Loading chunk') ||
        errMessage.includes('Unexpected token') ||
        this.state.error?.name === 'ChunkLoadError';

      const isNetworkError =
        !navigator.onLine ||
        errMessage.includes('NetworkError') ||
        errMessage.includes('Failed to fetch');

      let titleText = "페이지를 불러오는 중 오류가 발생했습니다.";
      let descText = "일시적인 네트워크 또는 웹페이지 업데이트 문제일 수 있습니다. 아래 버튼을 눌러 다시 시도해주세요.";

      if (isChunkError) {
        titleText = "사이트 최신 업데이트가 완료되었습니다.";
        descText = "최신 화면을 반영하기 위해 [페이지 새로고침] 버튼을 눌러주세요.";
      } else if (isNetworkError) {
        titleText = "네트워크 연결이 끊어졌습니다.";
        descText = "인터넷 연결 상태를 확인한 후 다시 시도해 주세요.";
      }

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
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "36px 28px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E6E2D8",
            maxWidth: "520px",
            width: "100%"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#F7F2EB",
              color: "#3A2A1E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "bold",
              margin: "0 auto 16px auto"
            }}>
              !
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#191919", marginBottom: "12px" }}>
              {titleText}
            </h2>

            <p style={{ fontSize: "14px", color: "#666666", marginBottom: "20px", lineHeight: "1.6" }}>
              {descText}
            </p>

            {/* Error Identification Code for User Reference */}
            {!isDev && this.state.errorId && (
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "20px", fontFamily: "monospace" }}>
                오류 식별 코드: {this.state.errorId}
              </div>
            )}

            {/* Dev Mode Debug Inspector */}
            {isDev && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#1E1E1E',
                color: '#F87171',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#FBBF24', marginBottom: '6px' }}>
                  [개발자 정보] 오류 상세 보기
                </summary>
                <div><strong>Message:</strong> {this.state.error?.message}</div>
                <div><strong>Stack:</strong> {this.state.error?.stack}</div>
                <div><strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}</div>
              </details>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#3A2A1E",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                페이지 새로고침
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#E6E2D8",
                  color: "#3A2A1E",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                다시 시도
              </button>

              <a
                href="/"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "transparent",
                  color: "#3A2A1E",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-block"
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

