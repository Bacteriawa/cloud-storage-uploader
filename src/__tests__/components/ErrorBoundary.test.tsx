import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Prevent console.error from cluttering the test output
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

beforeEach(() => {
  jest.clearAllMocks();
});

const ThrowError = ({ shouldThrow, inLifecycle = false }: { shouldThrow: boolean, inLifecycle?: boolean }) => {
  if (shouldThrow && !inLifecycle) {
    throw new Error('Test rendering error');
  }

  // Simulate lifecycle error
  React.useEffect(() => {
    if (shouldThrow && inLifecycle) {
      throw new Error('Test lifecycle error');
    }
  }, [shouldThrow, inLifecycle]);

  return <div>Normal Content</div>;
};

// Component to simulate catching event handler errors (which standard error boundaries don't catch directly, 
// but can be caught if we wrap them in setState)
const EventHandlerError = () => {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error; // Throwing in render phase so ErrorBoundary catches it
  }

  const handleClick = () => {
    try {
      throw new Error('Test event handler error');
    } catch (e) {
      setError(e as Error);
    }
  };

  return <button onClick={handleClick}>Trigger Event Error</button>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('catches rendering errors and displays the fallback UI', () => {
    render(
      <ErrorBoundary moduleName="TestModule">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Fallback UI should be shown
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/TestModule/)).toBeInTheDocument();
    
    // Should have reported the error
    expect(console.error).toHaveBeenCalledWith(
      '[Monitor] Error:',
      expect.any(Error)
    );
    expect(console.log).toHaveBeenCalledWith('[Monitor] Error reported from module: TestModule');
  });

  it('supports custom fallback UI', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong.')).not.toBeInTheDocument();
  });

  it('can reset the error state via Try Again button', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    
    // Rerender with safe content to simulate fixing the issue
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    const tryAgainBtn = screen.getByText('Try Again');
    fireEvent.click(tryAgainBtn);
    
    expect(screen.getByText('Normal Content')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong.')).not.toBeInTheDocument();
  });

  it('catches errors triggered by event handlers (when mapped to state)', () => {
    render(
      <ErrorBoundary moduleName="EventModule">
        <EventHandlerError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Trigger Event Error')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Trigger Event Error'));
    
    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('[Monitor] Error reported from module: EventModule');
  });
});
