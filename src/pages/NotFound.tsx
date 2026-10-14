import { Link } from 'react-router';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SceneArt } from '@/components/art/SceneArt';

export function NotFound({ title = 'This page doesn’t exist', body = 'The link may be mistyped, or the demo market it pointed to isn’t part of this snapshot.' }: { title?: string; body?: string }) {
  return (
    <section className="relative mx-auto flex max-w-[1320px] flex-col items-center px-4 pb-10 pt-16 text-center sm:px-6 lg:px-8">
      <div className="h-40 w-64 overflow-hidden rounded-3xl ring-1 ring-ink/10">
        <SceneArt art="science" seed="lost" />
      </div>
      <p className="mt-8 text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="secondary">
          <Link to="/">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link to="/explore">
            <Compass className="h-4 w-4" /> Explore markets
          </Link>
        </Button>
      </div>
    </section>
  );
}
