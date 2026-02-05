import { WorkoutRepository } from '../repositories/WorkoutRepository';
import { workoutSchema, type WorkoutInput } from '../validators/workout.schema';

/**
 * Workout Service following 'Backend Development Guidelines'.
 * Coordinates business logic and data access.
 */
export class WorkoutService {
    constructor(private readonly repository: WorkoutRepository) { }

    async listUserWorkouts() {
        return this.repository.getAll();
    }

    async createWorkout(input: WorkoutInput) {
        // 1. Validate Business Logic/Input
        const validated = workoutSchema.parse(input);

        // 2. Domain logic (e.g., check if user already has a workout today)
        // ...

        // 3. Persist
        return this.repository.create(validated);
    }

    async markAsCompleted(workoutId: string) {
        // Business logic: check if all exercises are done first?
        // For now, simple update
        return this.repository.update(workoutId, { status: 'completed' });
    }

    async getCompletionStats() {
        const workouts = await this.repository.getAll();
        const completed = workouts.filter(w => w.status === 'completed').length;
        return {
            total: workouts.length,
            completed,
            percentage: workouts.length > 0 ? (completed / workouts.length) * 100 : 0
        };
    }
}
