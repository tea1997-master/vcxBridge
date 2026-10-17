import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({
    window: {
        showInformationMessage: vi.fn(),
    },
    commands: {
        registerCommand: vi.fn(),
    },
}));

import { activate, deactivate } from '../../src/extension';

describe('Extension Lifecycle', () => {
    it('activate and deactivate should execute without errors', () => {
        const mockContext = {
            subscriptions: [],
        } as unknown as import('vscode').ExtensionContext;

        expect(() => activate(mockContext)).not.toThrow();
        expect(() => deactivate()).not.toThrow();
    });
});
