export const projectKeys = {
  all: ['projects'] as const,
  byAccount: (accountId: string) => ['projects', { accountId }] as const,
  list: (accountId: string) => ['projects', 'list', accountId] as const,
  detail: (projectId: string) => ['projects', 'detail', projectId] as const,
  views: (projectId: string) => ['projects', projectId, 'views'] as const,
}
