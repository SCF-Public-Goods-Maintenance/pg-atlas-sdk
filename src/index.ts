import { 
  getContributorContributorsContributorIdGet,
  getMetadataMetadataGet,
  getProjectDependsOnProjectsCanonicalIdDependsOnGet,
  getProjectHasDependentsProjectsCanonicalIdHasDependentsGet,
  getProjectProjectsCanonicalIdGet,
  getProjectReposProjectsCanonicalIdReposGet,
  getRepoDependsOnReposCanonicalIdDependsOnGet,
  getRepoHasDependentsReposCanonicalIdHasDependentsGet,
  getRepoReposCanonicalIdGet,
  getSbomSubmissionIngestSbomSubmissionIdGet,
  healthHealthGet,
  ingestSbomIngestSbomPost,
  listProjectsProjectsGet,
  listReposReposGet,
  listSbomSubmissionsIngestSbomGet,
} from './generated';

import { createClient, type Config } from './generated/client';

export * from './generated';

export const version = "0.3.0";

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
}

/**
 * PGAtlasClient
 * 
 * A stateful wrapper around the PG Atlas API.
 */
export class PGAtlasClient {
  private client: ReturnType<typeof createClient>;

  constructor(config: ClientConfig = {}) {
    this.client = createClient({
      baseUrl: config.baseUrl || "https://pg-atlas-backend-h8gen.ondigitalocean.app",
      headers: config.apiKey ? {
        'Authorization': `Bearer ${config.apiKey}`
      } : {}
    });
  }

  /**
   * Update client configuration (e.g. set API key later)
   */
  setConfig(config: ClientConfig) {
    const newConfig: Config = {
      baseUrl: config.baseUrl || this.client.getConfig().baseUrl,
      headers: {
        ...this.client.getConfig().headers,
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      }
    };
    this.client.setConfig(newConfig);
  }

  // Health
  getHealth() {
    return healthHealthGet({ client: this.client });
  }

  // Ingestion
  ingestSbom(body: any) {
    return ingestSbomIngestSbomPost({ client: this.client, body });
  }

  listSbomSubmissions(query?: any) {
    return listSbomSubmissionsIngestSbomGet({ client: this.client, query });
  }

  getSbomSubmission(submissionId: number) {
    return getSbomSubmissionIngestSbomSubmissionIdGet({ client: this.client, path: { submission_id: submissionId } });
  }

  // Metadata
  getMetadata() {
    return getMetadataMetadataGet({ client: this.client });
  }

  // Projects
  listProjects(query?: any) {
    return listProjectsProjectsGet({ client: this.client, query });
  }

  getProject(canonicalId: string) {
    return getProjectProjectsCanonicalIdGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  getProjectRepos(canonicalId: string, query?: any) {
    return getProjectReposProjectsCanonicalIdReposGet({ client: this.client, path: { canonical_id: canonicalId }, query });
  }

  getProjectDependsOn(canonicalId: string) {
    return getProjectDependsOnProjectsCanonicalIdDependsOnGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  getProjectHasDependents(canonicalId: string) {
    return getProjectHasDependentsProjectsCanonicalIdHasDependentsGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  // Repos
  listRepos(query?: any) {
    return listReposReposGet({ client: this.client, query });
  }

  getRepo(canonicalId: string) {
    return getRepoReposCanonicalIdGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  getRepoDependsOn(canonicalId: string) {
    return getRepoDependsOnReposCanonicalIdDependsOnGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  getRepoHasDependents(canonicalId: string) {
    return getRepoHasDependentsReposCanonicalIdHasDependentsGet({ client: this.client, path: { canonical_id: canonicalId } });
  }

  // Contributors
  getContributor(contributorId: number) {
    return getContributorContributorsContributorIdGet({ client: this.client, path: { contributor_id: contributorId } });
  }
}

/**
 * Default singleton instance
 */
export const client = new PGAtlasClient();

// Functional exports (proxied to singleton)
export const getHealth = () => client.getHealth();
export const ingestSbom = (body: any) => client.ingestSbom(body);
export const listSbomSubmissions = (query?: any) => client.listSbomSubmissions(query);
export const getMetadata = () => client.getMetadata();
export const listProjects = (query?: any) => client.listProjects(query);
export const getProject = (id: string) => client.getProject(id);
export const listRepos = (query?: any) => client.listRepos(query);
export const getRepo = (id: string) => client.getRepo(id);
