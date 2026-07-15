/**
 * Spots — parking marketplace (ParkPro remake on Skateboard).
 *
 * @see archive/ for original 2012 iOS + Rails sources
 */
import './assets/styles.css';
import { lazy, Suspense } from 'react';
import { createSkateboardApp } from '@stevederico/skateboard-ui/App';
import type { AppRoute } from '@stevederico/skateboard-ui/App';
import Layout from '@stevederico/skateboard-ui/Layout';
import CommandMenu from './components/CommandMenu';
import HomeViewSkeleton from './components/HomeViewSkeleton';
import constants from './constants.json';

const HomeView = lazy(() => import('./components/HomeView'));
const SpotDetailView = lazy(() => import('./components/SpotDetailView'));
const MySpotsView = lazy(() => import('./components/MySpotsView'));
const HistoryView = lazy(() => import('./components/HistoryView'));

/**
 * App layout with global command menu overlay.
 *
 * @returns Layout with command menu
 */
export function AppLayout() {
  return (
    <>
      <CommandMenu />
      <Layout />
    </>
  );
}

/** Application routes for the parking marketplace. */
export const appRoutes: AppRoute[] = [
  {
    path: 'home',
    element: (
      <Suspense fallback={<HomeViewSkeleton />}>
        <HomeView />
      </Suspense>
    ),
  },
  {
    path: 'spots/:id',
    element: (
      <Suspense fallback={<HomeViewSkeleton />}>
        <SpotDetailView />
      </Suspense>
    ),
  },
  {
    path: 'my-spots',
    element: (
      <Suspense fallback={<HomeViewSkeleton />}>
        <MySpotsView />
      </Suspense>
    ),
  },
  {
    path: 'history',
    element: (
      <Suspense fallback={<HomeViewSkeleton />}>
        <HistoryView />
      </Suspense>
    ),
  },
];

createSkateboardApp({
  constants,
  appRoutes,
  defaultRoute: 'home',
  overrides: { layout: AppLayout },
});

setTimeout(() => import('./components/HomeView'), 2000);
