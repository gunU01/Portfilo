import { Component } from 'react'

// 화면을 그리다 오류가 나도 사이트 전체가 하얗게 비지 않게, 그 자리에 안내와 다시 시도 버튼을 보여 줍니다.
// 메뉴와 푸터는 그대로 남아 다른 곳으로 갈 수 있습니다. resetKey(페이지 경로)가 바뀌면 오류 상태를 풉니다.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidUpdate(prev) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="wrap fail" role="alert">
        <h1>화면을 불러오지 못했습니다</h1>
        <p>잠시 문제가 생겼습니다. 다시 시도하거나 위쪽 메뉴로 다른 화면으로 이동해 주세요.</p>
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </section>
    )
  }
}
