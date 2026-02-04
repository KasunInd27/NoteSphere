import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import usePageStore from '@/store/usePageStore';
import useSocketStore from '@/store/useSocketStore';
import useBlockStore from '@/store/useBlockStore';
import { ModeToggle } from './ModeToggle';
import { MoreHorizontal, Printer, Download } from 'lucide-react';
import HistorySheet from '@/components/common/HistorySheet';

const Topbar = () => {
    const { id } = useParams();
    const { pages } = usePageStore();
    const { activeUsers } = useSocketStore();

    // Find current page title for breadcrumbs (simple version)
    // A real breadcrumb would traverse up the parentId chain, but for now let's just show current title or "Dashboard"
    const currentPage = pages.find(p => p._id === id);

    return (
        <nav className="bg-background/80 dark:bg-[#1F1F1F] backdrop-blur-sm px-4 py-2 w-full h-14 flex items-center gap-x-4 border-b border-border/40 sticky top-0 z-40">
            <div className="flex items-center gap-x-2 flex-1 min-w-0">
                {/* Mobile menu trigger could go here */}

                {currentPage ? (
                    <div className="flex items-center text-sm">
                        {/* Fake breadcrumb path for visual */}
                        <span className="text-muted-foreground px-1">/</span>
                        <div className="flex items-center gap-x-1.5 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors cursor-pointer min-w-0">
                            {currentPage.icon && <span className="text-base leading-none">{currentPage.icon}</span>}
                            <span className="font-medium truncate text-foreground">{currentPage.title}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center text-sm font-medium text-muted-foreground/80 px-2">Dashboard</div>
                )}
            </div>

            <div className="flex items-center gap-x-3">
                {/* Status or Last Edited */}
                <div className="flex items-center gap-x-1 text-xs text-muted-foreground/60 hidden sm:flex">
                    {currentPage && <span>Edited just now</span>}
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-border mx-1" />

                <div className="flex items-center gap-x-2">
                    {/* Active Users */}
                    <div className="flex items-center -space-x-2 mr-2">
                        {Object.values(activeUsers).map((u, i) => (
                            <div key={i} className="relative group/avatar cursor-default">
                                {u.avatar?.url ? (
                                    <img src={u.avatar.url} className="w-6 h-6 rounded-full border-2 border-background object-cover grayscale active:grayscale-0 hover:grayscale-0 transition" title={u.name} alt={u.name} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground" title={u.name}>
                                        {u.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                        {Object.keys(activeUsers).length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium z-10">
                                +{Object.keys(activeUsers).length - 3}
                            </div>
                        )}
                    </div>

                    <ModeToggle />

                    {currentPage && (
                        <>
                            <HistorySheet pageId={currentPage._id} />
                            <div className="relative group/menu ml-1">
                                <div role="button" className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                </div>

                                <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border shadow-md rounded-md overflow-hidden z-50 hidden group-hover/menu:block">
                                    <div className="py-1">
                                        <div
                                            onClick={() => window.print()}
                                            className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Print / PDF
                                        </div>
                                        <div
                                            onClick={() => {
                                                // Quick Hack: Markdown Export
                                                // Ideally we move this to a helper.
                                                const { blocks } = useBlockStore.getState();
                                                // Check if blocks belong to current page? default store has 'blocks' from last fetch.
                                                // Assuming we are on the page.
                                                let md = `# ${currentPage.title}\n\n`;
                                                blocks.forEach(b => {
                                                    if (b.type === 'heading') {
                                                        md += `${'#'.repeat(b.props?.level || 1)} ${b.content.replace(/<[^>]*>?/gm, '')}\n\n`;
                                                    } else if (b.type === 'image') {
                                                        md += `![Image](${b.content.url})\n\n`;
                                                    } else {
                                                        // Basic HTML strip for now
                                                        md += `${b.content.replace(/<[^>]*>?/gm, '')}\n\n`;
                                                    }
                                                });

                                                const blob = new Blob([md], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${currentPage.title}.md`;
                                                a.click();
                                            }}
                                            className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export Markdown
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
