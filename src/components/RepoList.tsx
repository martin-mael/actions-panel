import type { Repository } from "../types/github.ts";

interface RepoListProps {
  repos: Repository[];
  selectedRepo: Repository | null;
  onSelect: (repo: Repository) => void;
}

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

  return (
    <box style={{ flexDirection: "row", padding: 1, gap: 1 }}>
      <text>
        <span fg="#6b7280">Repos: </span>
      </text>
      {repos.slice(0, 10).map((repo) => {
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
      {repos.length > 10 && (
        <text>
          <span fg="#6b7280">+{repos.length - 10} more</span>
        </text>
      )}
    </box>
  );
}
