import { createBrowserRouter, createMemoryRouter } from 'react-router';
import { Layout } from './Layout';
import { HomePage } from '@/pages/Home';
import { ExplorePage } from '@/pages/Explore';
import { MarketDetailPage } from '@/pages/MarketDetail';
import { PortfolioPage } from '@/pages/Portfolio';
import { NotFound } from '@/pages/NotFound';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'markets/:id', element: <MarketDetailPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

// The single-file preview (npm run build:preview) runs inside hosts without their
// own URL space, so it keeps navigation in memory instead of the address bar.
export const router = import.meta.env.VITE_ROUTER === 'memory' ? createMemoryRouter(routes) : createBrowserRouter(routes);
