import type { Repository, WorkflowRun, Job } from "../types/github.ts";

const API_BASE = "https://api.github.com";

export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async listRepos(): Promise<Repository[]> {
    interface ReposResponse {
      id: number;
      name: string;
      full_name: string;
      owner: { login: string };
      private: boolean;
      default_branch: string;
    }
    const repos = await this.fetch<ReposResponse[]>("/user/repos?sort=pushed&per_page=100");
    return repos;
  }

  async listRuns(
    owner: string,
    repo: string,
    options?: {
      status?: string;
      branch?: string;
      per_page?: number;
    }
  ): Promise<WorkflowRun[]> {
    const params = new URLSearchParams();
    if (options?.status) params.set("status", options.status);
    if (options?.branch) params.set("branch", options.branch);
    params.set("per_page", String(options?.per_page || 30));

    const queryString = params.toString();
    const endpoint = `/repos/${owner}/${repo}/actions/runs${queryString ? `?${queryString}` : ""}`;

    interface RunsResponse {
      total_count: number;
      workflow_runs: WorkflowRun[];
    }
    const response = await this.fetch<RunsResponse>(endpoint);
    return response.workflow_runs;
  }

  async getRun(owner: string, repo: string, runId: number): Promise<WorkflowRun> {
    return this.fetch<WorkflowRun>(`/repos/${owner}/${repo}/actions/runs/${runId}`);
  }

  async getJobs(owner: string, repo: string, runId: number): Promise<Job[]> {
    interface JobsResponse {
      total_count: number;
      jobs: Job[];
    }
    const response = await this.fetch<JobsResponse>(
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`
    );
    return response.jobs;
  }

  async getJobLogs(owner: string, repo: string, jobId: number): Promise<string> {
    const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }
}
