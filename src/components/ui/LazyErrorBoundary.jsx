import React from "react";

export default class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lazy route dynamic import error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>
            페이지를 불러오는 도중 오류가 발생했습니다.
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            네트워크 연결 문제이거나 이전 버전의 파일이 캐시되어 있을 수 있습니다.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3A2A1E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            새로고침 및 다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
