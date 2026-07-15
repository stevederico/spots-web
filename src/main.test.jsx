import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const createSkateboardApp = vi.fn();

vi.mock('./assets/styles.css', () => ({}));

vi.mock('@stevederico/skateboard-ui/App', () => ({
  createSkateboardApp: (...args) => createSkateboardApp(...args)
}));

vi.mock('@stevederico/skateboard-ui/Layout', () => ({
  default: () => <div data-testid="layout">Layout</div>
}));

vi.mock('./components/HomeViewSkeleton', () => ({
  default: () => <div data-testid="home-view-skeleton">Loading</div>
}));

vi.mock('./components/CommandMenu', () => ({
  default: () => <div data-testid="command-menu">Command Menu</div>
}));

vi.mock('./components/HomeView', () => ({
  default: () => <div data-testid="home-view">Home</div>
}));

vi.mock('./components/SpotDetailView', () => ({
  default: () => <div data-testid="spot-detail-view">Detail</div>
}));

vi.mock('./components/MySpotsView', () => ({
  default: () => <div data-testid="my-spots-view">My Spots</div>
}));

vi.mock('./components/HistoryView', () => ({
  default: () => <div data-testid="history-view">History</div>
}));

vi.mock('./constants.json', () => ({
  default: {
    appName: 'Spots',
    defaultRoute: 'home',
    pages: []
  }
}));

describe('main app bootstrap', () => {
  beforeEach(() => {
    createSkateboardApp.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes skateboard app with routes, constants, and layout override', async () => {
    const main = await import('./main.tsx');

    expect(createSkateboardApp).toHaveBeenCalledWith({
      constants: expect.objectContaining({ appName: 'Spots' }),
      appRoutes: expect.any(Array),
      defaultRoute: 'home',
      overrides: { layout: expect.any(Function) }
    });

    expect(main.appRoutes).toHaveLength(4);
  });

  it('registers four app routes including lazy home route', async () => {
    const { appRoutes } = await import('./main.tsx');
    const homeRoute = appRoutes.find((route) => route.path === 'home');

    expect(homeRoute?.element).toBeTruthy();
    expect(homeRoute.element.props.fallback).toBeTruthy();
  });
});

describe('AppLayout', () => {
  it('renders command menu and layout together', async () => {
    const { AppLayout } = await import('./main.tsx');
    render(<AppLayout />);

    expect(screen.getByTestId('command-menu')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });
});

describe('appRoutes', () => {
  it('defines expected route paths and elements', async () => {
    const { appRoutes } = await import('./main.tsx');
    const paths = appRoutes.map((route) => route.path);

    expect(paths).toEqual(['home', 'spots/:id', 'my-spots', 'history']);
    expect(appRoutes.every((route) => route.element)).toBe(true);
  });

  it('wraps home route in suspense with HomeViewSkeleton fallback', async () => {
    const { appRoutes } = await import('./main.tsx');
    const homeRoute = appRoutes.find((route) => route.path === 'home');
    render(homeRoute.element);

    expect(screen.getByTestId('home-view-skeleton')).toBeInTheDocument();
  });
});
