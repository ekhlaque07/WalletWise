import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WalletWise render error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-screen">
          <div className="app-error-card">
            <div className="logo-circle">W</div>
            <h1>WalletWise encountered an error</h1>
            <p>
              Something went wrong while rendering this page.
              Check the browser console for the technical details.
            </p>

            {this.state.error?.message && (
              <pre>{this.state.error.message}</pre>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={this.handleReload}
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
