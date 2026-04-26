/**
 * OpenAPI 3.0 specification for DNA Analyzer API.
 * Served at /api/docs and rendered via swagger-ui-react at /docs.
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DNA Analyzer API',
    version: '1.0.0',
    description:
      'REST API for analyzing GitHub repositories. Returns complexity scores, commit patterns, risk areas, contributor insights, and an overall health score.',
    contact: { name: 'DNA Analyzer', url: 'https://github.com' },
  },
  servers: [
    { url: '/api', description: 'Current environment' },
  ],
  tags: [
    { name: 'Analysis', description: 'Submit and track analysis jobs' },
    { name: 'Reports',  description: 'View and manage DNA reports' },
    { name: 'GitHub',   description: 'GitHub repository search' },
    { name: 'Auth',     description: 'Authentication (Better Auth)' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session-token',
        description: 'Session cookie set by Better Auth on login',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Session token in Authorization header (alternative)',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          data:  { nullable: true, description: 'Response payload, null on error' },
          error: { type: 'string', nullable: true, description: 'Error message, null on success' },
          meta:  { type: 'object', nullable: true },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data:    { type: 'array', items: { $ref: '#/components/schemas/Report' } },
          total:   { type: 'integer' },
          page:    { type: 'integer' },
          limit:   { type: 'integer' },
          hasMore: { type: 'boolean' },
        },
      },
      SubScores: {
        type: 'object',
        properties: {
          complexity: { type: 'number', minimum: 0, maximum: 100, description: 'Higher = less complex = better' },
          commits:    { type: 'number', minimum: 0, maximum: 100, description: 'Commit hygiene score' },
          risk:       { type: 'number', minimum: 0, maximum: 100, description: 'Higher = MORE risky' },
          velocity:   { type: 'number', minimum: 0, maximum: 100, description: 'Development cadence' },
        },
        required: ['complexity', 'commits', 'risk', 'velocity'],
      },
      RiskArea: {
        type: 'object',
        properties: {
          file:     { type: 'string' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          reason:   { type: 'string' },
          metric:   { type: 'string' },
        },
        required: ['file', 'severity', 'reason', 'metric'],
      },
      ContributorInsight: {
        type: 'object',
        properties: {
          login:           { type: 'string' },
          avatarUrl:       { type: 'string', format: 'uri' },
          commitCount:     { type: 'integer' },
          linesAdded:      { type: 'integer' },
          linesDeleted:    { type: 'integer' },
          churnRatio:      { type: 'number' },
          lastActiveAt:    { type: 'string', format: 'date-time' },
          isGhost:         { type: 'boolean', description: 'True if inactive for 90+ days' },
          ownershipPercent:{ type: 'number' },
        },
      },
      ActivityHeatmap: {
        type: 'object',
        properties: {
          grid:     { type: 'array', items: { type: 'array', items: { type: 'integer' } }, description: '7 days × 24 hours commit counts' },
          peakDay:  { type: 'integer', minimum: 0, maximum: 6 },
          peakHour: { type: 'integer', minimum: 0, maximum: 23 },
        },
      },
      Report: {
        type: 'object',
        properties: {
          id:                 { type: 'string' },
          jobId:              { type: 'string' },
          repoUrl:            { type: 'string', format: 'uri' },
          repoName:           { type: 'string' },
          repoOwner:          { type: 'string' },
          healthScore:        { type: 'number', minimum: 0, maximum: 100 },
          grade:              { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
          subScores:          { $ref: '#/components/schemas/SubScores' },
          busFactor:          { type: 'integer' },
          topComplexFiles:    { type: 'array', items: { type: 'string' } },
          riskAreas:          { type: 'array', items: { $ref: '#/components/schemas/RiskArea' } },
          contributorInsights:{ type: 'array', items: { $ref: '#/components/schemas/ContributorInsight' } },
          activityHeatmap:    { $ref: '#/components/schemas/ActivityHeatmap' },
          languageBreakdown:  { type: 'object', additionalProperties: { type: 'number' } },
          summary:            { type: 'string' },
          createdAt:          { type: 'string', format: 'date-time' },
        },
        required: ['id', 'healthScore', 'grade', 'subScores'],
      },
      AnalysisProgress: {
        type: 'object',
        properties: {
          jobId:      { type: 'string' },
          status:     { type: 'string', enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] },
          progress:   { type: 'integer', minimum: 0, maximum: 100 },
          currentStep:{ type: 'string' },
          reportId:   { type: 'string', nullable: true },
          errorMsg:   { type: 'string', nullable: true },
        },
        required: ['jobId', 'status', 'progress', 'currentStep'],
      },
      GithubRepo: {
        type: 'object',
        properties: {
          id:            { type: 'integer' },
          name:          { type: 'string' },
          fullName:      { type: 'string' },
          url:           { type: 'string', format: 'uri' },
          description:   { type: 'string', nullable: true },
          language:      { type: 'string', nullable: true },
          stars:         { type: 'integer' },
          forks:         { type: 'integer' },
          isPrivate:     { type: 'boolean' },
          defaultBranch: { type: 'string' },
          pushedAt:      { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          data:  { type: 'null' },
          error: { type: 'string' },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  paths: {
    '/analyze': {
      post: {
        tags: ['Analysis'],
        summary: 'Start a new repository analysis',
        description: 'Validates the GitHub URL, creates an AnalysisJob, enqueues it to Bull, and returns the jobId. Rate limited to 5 per hour per user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  repoUrl: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://github.com/facebook/react',
                    description: 'Full GitHub repository URL',
                  },
                },
                required: ['repoUrl'],
              },
            },
          },
        },
        responses: {
          '202': {
            description: 'Job accepted and queued',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            jobId:  { type: 'string' },
                            status: { type: 'string', example: 'PENDING' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { description: 'Invalid GitHub URL or missing token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Not authenticated' },
          '429': { description: 'Rate limit exceeded (5/hour)', headers: { 'Retry-After': { schema: { type: 'integer' } } } },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/analyze/{jobId}': {
      get: {
        tags: ['Analysis'],
        summary: 'Poll analysis job progress',
        description: 'Returns the current status and progress percentage of an analysis job. Poll every 3 seconds until status is COMPLETED or FAILED.',
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' }, description: 'Analysis job ID returned from POST /analyze' },
        ],
        responses: {
          '200': {
            description: 'Current job progress',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/AnalysisProgress' } } },
                  ],
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '404': { description: 'Job not found or not owned by user' },
        },
      },
    },
    '/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List all reports (paginated)',
        description: 'Returns a paginated list of reports for the authenticated user. Does not include rawData.',
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
          { name: 'sort',  in: 'query', schema: { type: 'string', enum: ['createdAt_desc', 'createdAt_asc', 'healthScore_desc', 'healthScore_asc'], default: 'createdAt_desc' } },
        ],
        responses: {
          '200': {
            description: 'Paginated reports list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/reports/{id}': {
      get: {
        tags: ['Reports'],
        summary: 'Get a single full report',
        description: 'Returns the complete DNA report including rawData. Cached in Redis for 1 hour.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Full report with rawData',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Report' } } },
                  ],
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '404': { description: 'Report not found or not owned by user' },
        },
      },
      delete: {
        tags: ['Reports'],
        summary: 'Soft-delete a report',
        description: 'Sets deletedAt timestamp. Report is excluded from all future queries. Redis cache is invalidated.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Report deleted',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { type: 'object', properties: { deleted: { type: 'boolean' } } } } },
                  ],
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '404': { description: 'Report not found' },
        },
      },
    },
    '/github/search': {
      get: {
        tags: ['GitHub'],
        summary: 'Search GitHub repositories',
        description: 'Searches repositories matching the query. Uses the authenticated user\'s GitHub token for higher rate limits.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query (e.g. "react", "next.js")' },
        ],
        responses: {
          '200': {
            description: 'Matching repositories',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/GithubRepo' } } } },
                  ],
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/auth/{...betterauth}': {
      get: {
        tags: ['Auth'],
        summary: 'Better Auth catch-all handler (GET)',
        description: 'Handles OAuth callbacks, session retrieval, and other GET auth flows via Better Auth.',
        parameters: [
          { name: '...betterauth', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Auth response' } },
      },
      post: {
        tags: ['Auth'],
        summary: 'Better Auth catch-all handler (POST)',
        description: 'Handles sign-in, sign-out, and other POST auth flows via Better Auth.',
        parameters: [
          { name: '...betterauth', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Auth response' } },
      },
    },
  },
};
