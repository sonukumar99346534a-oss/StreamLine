/**
 * Continuous Integration (CI) and Canary Continuous Deployment (CD) Engine
 * Directly implementing Experiment 9.1 & Experiment 9.2:
 * - CI Unit Tests (JUnit 5 + Mockito service tests)
 * - CI Integration Tests (Spring MockMvc + Testcontainers MySQL)
 * - CI Contract Testing (Pact verification: ProductClient -> ProductService)
 * - CD Multi-Stage Docker Build
 * - CD Cloud Run Canary Deployment (10% traffic split -> smoke test -> 100% promote / rollback)
 */

import { CanaryDeploymentState, CiTestResult } from '../types';

export const INITIAL_CI_TESTS: CiTestResult[] = [
  {
    id: 'test-1',
    name: 'ProductServiceTest#createSavesAndReturnsProduct',
    type: 'UNIT',
    status: 'PASSED',
    durationMs: 42,
    details: 'Mockito verify(productRepository).save(product) called exactly once with saved ID #1.',
    assertions: 2,
  },
  {
    id: 'test-2',
    name: 'ProductServiceTest#findByIdReturnsProductWhenItExists',
    type: 'UNIT',
    status: 'PASSED',
    durationMs: 18,
    details: 'Asserts Optional<Product> isPresent() and matches repository entity.',
    assertions: 3,
  },
  {
    id: 'test-3',
    name: 'ProductServiceTest#findByIdReturnsEmptyWhenMissing',
    type: 'UNIT',
    status: 'PASSED',
    durationMs: 12,
    details: 'Asserts Optional.empty() returned for 404L query.',
    assertions: 2,
  },
  {
    id: 'test-4',
    name: 'ProductIntegrationTest#createProductThenRetrieveIt',
    type: 'INTEGRATION',
    status: 'PASSED',
    durationMs: 340,
    details: 'MockMvc POST /api/products against running MySQL Testcontainers instance returns 201 Created and JSON path matches.',
    assertions: 4,
  },
  {
    id: 'test-5',
    name: 'ProductIntegrationTest#rejectProductWithBlankName',
    type: 'INTEGRATION',
    status: 'PASSED',
    durationMs: 85,
    details: 'Bean Validation @NotBlank triggers MethodArgumentNotValidException -> 400 Bad Request.',
    assertions: 2,
  },
  {
    id: 'test-6',
    name: 'ProductContractVerificationTest#verifyPactInteraction',
    type: 'PACT_CONTRACT',
    status: 'PASSED',
    durationMs: 195,
    details: 'Consumer contract "ProductClient-ProductService.json" verified against live Spring port with state "product 1 exists".',
    assertions: 5,
  },
];

export const INITIAL_CANARY_STATE: CanaryDeploymentState = {
  serviceName: 'cu-fullstack-service',
  currentStableRevision: 'srv-rev-09-stable',
  canaryRevision: 'srv-rev-10-canary-8a4f21',
  stableTrafficPercent: 100,
  canaryTrafficPercent: 0,
  stage: 'IDLE',
  logs: [
    'System currently serving 100% production traffic on revision: srv-rev-09-stable',
    'Ready for Experiment 10 release deployment trigger.',
  ],
  smokeTestResult: null,
  lastDeployedSha: '8a4f21e',
};
