import type { Repository } from "../types/github.ts";

interface RepoListProps {
  repos: Repository[];
  selectedRepo: Repository | null;
  onSelect: (repo: Repository) => void;
}

const MAX_VISIBLE = 8;

export function RepoList({ repos, selectedRepo }: RepoListProps) {
  if (repos.length === 0) {
    return (
      <box style={{ padding: 1 }}>
        <text>
          <span fg="#6b7280">No repositories found</span>
        </text>
      </box>
    );
  }

  // Find the selected index
  const selectedIndex = repos.findIndex((r) => r.id === selectedRepo?.id);

  // Calculate visible window around selected repo
  let startIndex = 0;
  let endIndex = Math.min(MAX_VISIBLE, repos.length);

  if (repos.length > MAX_VISIBLE && selectedIndex >= 0) {
    // Center the selected repo in the visible window
    const halfWindow = Math.floor(MAX_VISIBLE / 2);
    startIndex = Math.max(0, selectedIndex - halfWindow);
    endIndex = startIndex + MAX_VISIBLE;

    // Adjust if we're near the end
    if (endIndex > repos.length) {
      endIndex = repos.length;
      startIndex = Math.max(0, endIndex - MAX_VISIBLE);
    }
  }

  const visibleRepos = repos.slice(startIndex, endIndex);
  const hasMore = repos.length > MAX_VISIBLE;
  const showLeftIndicator = startIndex > 0;
  const showRightIndicator = endIndex < repos.length;

  return (
    <box style={{ flexDirection: "row", padding: 1, gap: 1 }}>
      <text>
        <span fg="#6b7280">Repos: </span>
      </text>
      {showLeftIndicator && (
        <text>
          <span fg="#6b7280">{"<"} </span>
        </text>
      )}
      {visibleRepos.map((repo) => {
        const isSelected = selectedRepo?.id === repo.id;
        if (isSelected) {
          return (
            <text key={repo.id}>
              <strong fg="#06b6d4">[{repo.name}]</strong>
            </text>
          );
        }
        return (
          <text key={repo.id}>
            <span fg="#ffffff"> {repo.name} </span>
          </text>
        );
      })}
      {showRightIndicator && (
        <text>
          <span fg="#6b7280"> {">"}</span>
        </text>
      )}
      {hasMore && (
        <text>
          <span fg="#6b7280"> ({selectedIndex + 1}/{repos.length})</span>
        </text>
      )}
    </box>
  );
}
