import useBlockStore from '@/store/useBlockStore';
import { cn } from '@/lib/utils';

const DividerBlock = ({ block }) => {
    const { deleteBlock } = useBlockStore();

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            deleteBlock(block._id);
        }
    };

    return (
        <div
            className="py-6 group/divider relative outline-none focus:ring-2 focus:ring-primary/20 rounded-sm cursor-pointer"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <hr className="border-t-2 border-border/60 transition-colors group-hover/divider:border-border" />
        </div>
    );
};

export default DividerBlock;
