import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const TestComponent = () => <div>Hello World</div>;

describe('App', () => {
    it('renders hello world', () => {
        render(<TestComponent />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
});
