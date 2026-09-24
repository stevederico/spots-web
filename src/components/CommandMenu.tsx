import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getState } from '@stevederico/skateboard-ui/Context';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@stevederico/skateboard-ui/shadcn/ui/command';
import { History, Map, ParkingMeter, type LucideIcon } from 'lucide-react';

/** Page entry from constants.json's pages array. */
interface PageEntry {
  title: string;
  url: string;
  icon: string;
}

/** Named Lucide icons used by this app's page list. */
const PAGE_ICONS: Record<string, LucideIcon> = {
  map: Map,
  'parking-meter': ParkingMeter,
  history: History,
};

/**
 * Render a page icon from the known Lucide set.
 *
 * @param props - Icon name from constants.json
 * @returns The matching icon, or nothing when the name is unknown
 */
function PageIcon({ name }: { name: string }) {
  const Icon = PAGE_ICONS[name];
  if (!Icon) return null;
  return <Icon size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />;
}

/**
 * Global command menu activated via Cmd+K (Mac) or Ctrl+K (Windows).
 *
 * Renders a searchable command palette overlay that lists all app pages
 * from constants.json. Selecting a page navigates to its route under /app/.
 *
 * Uses cmdk under the hood via skateboard-ui's Command primitives.
 * The keyboard listener is global, so this component works regardless
 * of which route is currently active.
 *
 * @component
 * @returns Command dialog with page navigation
 *
 * @example
 * // Add to any layout or view — keyboard shortcut is global
 * <CommandMenu />
 */
export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { state } = getState();
  const pages: PageEntry[] = state.constants?.pages || [];

  useEffect(() => {
    /**
     * Toggle command menu on Cmd+K / Ctrl+K keydown.
     * @param e - Native keyboard event
     */
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Navigate to the selected page and close the menu.
   * @param url - Route path relative to /app/
   */
  const handleSelect = useCallback(
    (url: string) => {
      navigate(`/app/${url}`);
      setOpen(false);
    },
    [navigate]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Menu"
      description="Search and navigate to any page"
    >
      <Command className="rounded-lg">
        <CommandInput placeholder="Search pages..." />
        <CommandList className="p-2">
          <CommandEmpty>No pages found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.url}
                value={page.title}
                onSelect={() => handleSelect(page.url)}
                className="gap-3 px-3 py-2.5"
              >
                <PageIcon name={page.icon} />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
