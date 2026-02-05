import { BaseRepository } from './BaseRepository';
import { type Workout } from '@/lib/supabase';

export class WorkoutRepository extends BaseRepository<Workout> {
    constructor(tenantId: string) {
        super('workouts', tenantId);
    }

    /**
     * Complex query example - fetching workouts with exercise count
     */
    async getWorkoutsWithStats() {
        const { data, error } = await this.query()
            .select(`
        *,
        exercise_count:workout_exercises(count)
      `);

        if (error) throw error;
        return data;
    }
}
