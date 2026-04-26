interface Props {
  files: string[];
}

const EXT_COLORS: Record<string, string> = {
  '.ts':    'text-blue-400',
  '.tsx':   'text-blue-300',
  '.js':    'text-yellow-400',
  '.jsx':   'text-yellow-300',
  '.py':    'text-green-400',
  '.java':  'text-orange-400',
  '.go':    'text-cyan-400',
  '.rs':    'text-orange-300',
  '.cpp':   'text-purple-400',
  '.c':     'text-purple-300',
  '.cs':    'text-violet-400',
  '.php':   'text-indigo-400',
  '.rb':    'text-red-400',
  '.swift': 'text-orange-500',
  '.kt':    'text-violet-500',
  '.vue':   'text-emerald-400',
  '.scala': 'text-red-300',
};

function getExt(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot !== -1 ? path.slice(dot).toLowerCase() : '';
}

const RANK_BADGES = ['🥇', '🥈', '🥉'];

export function ComplexityFileList({ files }: Props) {
  if (!files.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No complex files detected.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {files.map((file, i) => {
        const ext = getExt(file);
        const extColor = EXT_COLORS[ext] ?? 'text-muted-foreground';
        const parts = file.split('/');
        const filename = parts[parts.length - 1];
        const dir = parts.slice(0, -1).join('/');

        return (
          <li
            key={file}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
          >
            <span className="w-7 text-center text-sm flex-shrink-0">
              {i < 3 ? RANK_BADGES[i] : (
                <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
              )}
            </span>
            <div className="flex-1 min-w-0 font-mono text-sm">
              {dir && (
                <span className="text-muted-foreground/50 text-xs">{dir}/</span>
              )}
              <span className={extColor}>{filename}</span>
            </div>
            {ext && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted ${extColor}`}>
                {ext}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
