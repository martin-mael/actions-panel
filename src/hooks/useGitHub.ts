import { useState, useEffect, useCallback, useMemo } from "react";
import { GitHubClient } from "../lib/github.ts";
import type { Repository, WorkflowRun, Job } from "../types/github.ts";

export function useGitHub(token: string | null) {
  const client = useMemo(() => (token ? new GitHubClient(token) : null), [token]);

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const repoList = await client.listRepos();
      setRepos(repoList);
      if (repoList.length > 0 && !selectedRepo) {
        setSelectedRepo(repoList[0]!);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repos");
    } finally {
      setLoading(false);
    }
  }, [client, selectedRepo]);

  const fetchRuns = useCallback(async () => {
    if (!client || !selectedRepo) return;
    setLoading(true);
    setError(null);
    try {
      const runList = await client.listRuns(selectedRepo.owner.login, selectedRepo.name);
      setRuns(runList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch runs");
    } finally {
      setLoading(false);
    }
  }, [client, selectedRepo]);

  const fetchJobs = useCallback(async (run: WorkflowRun) => {
    if (!client || !selectedRepo) return;
    setLoading(true);
    setError(null);
    try {
      const jobList = await client.getJobs(selectedRepo.owner.login, selectedRepo.name, run.id);
      setJobs(jobList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [client, selectedRepo]);

  const selectRepo = useCallback((repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedRun(null);
    setJobs([]);
    setRuns([]);
  }, []);

  const selectRun = useCallback((run: WorkflowRun | null) => {
    setSelectedRun(run);
    if (run) {
      fetchJobs(run);
    } else {
      setJobs([]);
    }
  }, [fetchJobs]);

  const refresh = useCallback(() => {
    if (selectedRun) {
      fetchJobs(selectedRun);
    } else {
      fetchRuns();
    }
  }, [selectedRun, fetchJobs, fetchRuns]);

  useEffect(() => {
    if (client) {
      fetchRepos();
    }
  }, [client, fetchRepos]);

  useEffect(() => {
    if (selectedRepo) {
      fetchRuns();
    }
  }, [selectedRepo, fetchRuns]);

  return {
    repos,
    selectedRepo,
    selectRepo,
    runs,
    selectedRun,
    selectRun,
    jobs,
    loading,
    error,
    refresh,
    fetchRepos,
    fetchRuns,
  };
}
