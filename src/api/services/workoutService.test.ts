import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutService } from '@/api/services/workoutService';
import { WorkoutRepository } from '@/api/repositories/WorkoutRepository';

describe('WorkoutService', () => {
    let service: WorkoutService;
    let repository: any;

    beforeEach(() => {
        repository = {
            getAll: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        };
        service = new WorkoutService(repository as any);
    });

    it('should list user workouts', async () => {
        const mockWorkouts = [{ id: '1', name: 'Treino A' }];
        repository.getAll.mockResolvedValue(mockWorkouts);

        const result = await service.listUserWorkouts();
        expect(result).toEqual(mockWorkouts);
        expect(repository.getAll).toHaveBeenCalled();
    });

    it('should calculate completion stats correctly', async () => {
        const mockWorkouts = [
            { status: 'completed' },
            { status: 'pending' },
            { status: 'completed' },
        ];
        repository.getAll.mockResolvedValue(mockWorkouts);

        const stats = await service.getCompletionStats();
        expect(stats.total).toBe(3);
        expect(stats.completed).toBe(2);
        expect(stats.percentage).toBeCloseTo(66.66, 1);
    });
});
