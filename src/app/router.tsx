import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter(routes);
