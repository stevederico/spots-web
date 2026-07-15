import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HomeView from './HomeView';

vi.mock('@stevederico/skateboard-ui/Header', () => ({
  default: ({ title, children }) => (
    <header data-testid="header">
      {title}
      {children}
    </header>
  ),
}));

vi.mock('@stevederico/skateboard-ui/DynamicIcon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('@stevederico/skateboard-ui/Utilities', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('@stevederico/skateboard-ui/shadcn/ui/button', () => ({
  Button: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
}));

vi.mock('@stevederico/skateboard-ui/shadcn/ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock('@stevederico/skateboard-ui/shadcn/ui/skeleton', () => ({
  Skeleton: (props) => <div data-testid="skeleton" {...props} />,
}));

import { apiRequest } from '@stevederico/skateboard-ui/Utilities';

describe('HomeView', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockResolvedValue([
      {
        _id: '1',
        userId: 'u1',
        title: 'Marina Driveway',
        streetAddress: '2100 Chestnut St',
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94123',
        latitude: 37.8,
        longitude: -122.4,
        price: 4.5,
        overnight: 25,
        style: 'Driveway',
        summary: 'Quiet residential driveway near the green with easy access for midsize cars.',
        isAvailable: true,
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
  });

  it('renders browse header and loads spots', async () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );

    expect(screen.getByTestId('header')).toHaveTextContent('Spots');
    await waitFor(() => {
      expect(screen.getByText('Marina Driveway')).toBeInTheDocument();
    });
  });
});
