import type { SourceFiles } from './compile';
import type { TestResult } from './runner';

export type RunRequest = { type: 'run'; id: number; topicId: string; assignmentId: string; files: SourceFiles };
export type RunResponse = { type: 'result'; id: number; results: TestResult[]; compileError?: string };
export type ReadyMessage = { type: 'ready' };

export type GradeOutcome = { results: TestResult[]; compileError?: string };
