import React from "react";

export default class LazyErrorBoundary extends React.Component {
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
    const errorId = `ERR-LAZY-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[LazyErrorBoundary] Route Dynamic Import Error:", {
      errorId: this.state.errorId,
      pathname: window.location.pathname,
      error: error?.message || error,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
    window.location.href = "/";
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

      let titleText = "페이지를 불러오는 도중 오류가 발생했습니다.";
      let descText = "네트워크 연결 문제이거나 이전 버전의 파일이 캐시되어 있을 수 있습니다.";

      if (isChunkError) {
        titleText = "사이트 새 버전이 업데이트되었습니다.";
        descText = "최신 버전을 반영하기 위해 아래 [새로고침] 버튼을 눌러주세요.";
      } else if (isNetworkError) {
        titleText = "네트워크 연결이 원활하지 않습니다.";
        descText = "인터넷 연결 상태를 확인 후 다시 시도해 주세요.";
      }

      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#FAF8F2',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 28px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E6E2D8'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F7F2EB',
              color: '#3A2A1E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 'bold',
              margin: '0 auto 16px auto'
            }}>
              !
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', color: '#111827' }}>
              {titleText}
            </h2>

            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', lineHeight: '1.6' }}>
              {descText}
            </p>

            {/* Error Identification Code for User Reference */}
            {!isDev && this.state.errorId && (
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '20px', fontFamily: 'monospace' }}>
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '11px 22px',
                  backgroundColor: '#3A2A1E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                페이지 새로고침
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '11px 22px',
                  backgroundColor: '#E6E2D8',
                  color: '#3A2A1E',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                다시 시도
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '11px 22px',
                  backgroundColor: 'transparent',
                  color: '#3A2A1E',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

