// src/components/ErrorBoundary.js
import React from "react";
import * as Sentry from "@sentry/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.log("🔥 getDerivedStateFromError triggered:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log("🔥 componentDidCatch triggered:", error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      console.log("🔥 Rendering fallback UI!"); // Confirm this logs in the console
      return (
        <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#ffeeee", border: "1px solid red" }}>
          <h2>🔥 Something went wrong. 🔥</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;