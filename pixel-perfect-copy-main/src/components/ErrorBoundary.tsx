
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
                    <h1>Algo deu errado.</h1>
                    <p>Desculpe, ocorreu um erro inesperado que impediu o carregamento do site.</p>
                    <pre style={{
                        backgroundColor: "#f0f0f0",
                        padding: "10px",
                        borderRadius: "4px",
                        overflow: "auto",
                        color: "red"
                    }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            backgroundColor: "#000",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "4px"
                        }}
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
