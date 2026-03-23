import { Component, type ReactNode } from 'react'
import { Button, Result } from 'antd'

interface Props { children: ReactNode }
interface State { hasError: boolean }

class ErrorBoundary extends Component<Props, State> {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="500"
                    title="Что-то пошло не так"
                    extra={
                        <Button onClick={() => window.location.reload()}>
                            Перезагрузить
                        </Button>
                    }
                />
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary