import { Component } from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-red-500 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-serif text-gray-800 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-8">
                            We apologize for the inconvenience. A technical error has occurred.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded transition-colors"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 text-left bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48 text-red-800">
                                <code className="font-mono">{this.state.error.toString()}</code>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
