import { supabase } from '@/lib/supabase';
import { invitationSchema, type InvitationInput, type Invitation } from '../validators/invitation.schema';

/**
 * Generate a UUID compatible with all browsers
 */
function generateUUID(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Service for Tenant-related operations (Branding, Invitations).
 */
export class TenantService {
    constructor(private readonly tenantId: string) { }

    /**
     * Generates a unique invitation token for a student/coach.
     */
    async inviteUser(input: InvitationInput): Promise<Invitation> {
        const validated = invitationSchema.parse(input);

        // 1. Check if user already exists in the system (Profile)
        // Accessing 'profiles' table to find by email. Note: RLS must allow this read for coaches,
        // or this will return null and fall back to normal invite flow (which acts as a reliable fallback).
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', validated.email)
            .maybeSingle();

        if (existingProfile) {
            // User exists! Check if they are already a client in this tenant
            const { data: existingClient } = await supabase
                .from('clients')
                .select('*')
                .eq('tenant_id', input.tenant_id)
                .eq('user_id', existingProfile.id)
                .maybeSingle();

            if (existingClient) {
                // Client record exists. Check status.
                if (existingClient.status !== 'active') {
                    // Reactivate client
                    const { error: activateError } = await supabase
                        .from('clients')
                        .update({ status: 'active' })
                        .eq('id', existingClient.id);

                    if (activateError) throw activateError;

                    // Return a mock invitation response to satisfy the type, adding a status field if possible or just proceeding
                    // We can handle this in the UI via a specific success message if we threw a specific "Success" error, 
                    // but cleaner is to return the invitation-like structure or modify the return type.
                    // For now, let's throw a special error that the UI interprets as success, OR return a mock.
                    // Let's rely on the UI handling: returning a mock invitation with "accepted" status.
                    return {
                        id: 'existing-reactivated',
                        email: validated.email,
                        tenant_id: input.tenant_id,
                        role: 'client',
                        token: 'already-active',
                        status: 'accepted',
                        created_at: new Date().toISOString(),
                        expires_at: new Date().toISOString()
                    } as Invitation;
                } else {
                    throw new Error("Este usuário já é um aluno ativo.");
                }
            } else {
                // User exists but is NOT in this tenant's client list. Add them directly.
                const { error: linkError } = await supabase
                    .from('clients')
                    .insert({
                        tenant_id: input.tenant_id,
                        user_id: existingProfile.id,
                        email: validated.email,
                        full_name: existingProfile.full_name || validated.email.split('@')[0],
                        status: 'active'
                    });

                if (linkError) throw linkError;

                return {
                    id: 'existing-added',
                    email: validated.email,
                    tenant_id: input.tenant_id,
                    role: 'client',
                    token: 'already-added',
                    status: 'accepted', // Auto-accept since they are already a user
                    created_at: new Date().toISOString(),
                    expires_at: new Date().toISOString()
                } as Invitation;
            }
        }

        // 2. If user does NOT exist, proceed with standard invitation
        // Generate unique token
        const token = generateUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const { data, error } = await supabase
            .from('invitations')
            .insert({
                ...validated,
                token,
                expires_at: expiresAt.toISOString(),
                status: 'pending'
            })
            .select() // Use simple select as .single() might fail if RLS returns multiple (unlikely here)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Erro ao criar convite.");

        return data;
    }

    /**
     * Manages direct athlete/coach registration via Edge Function.
     */
    async manageAthlete(input: { fullName: string, username: string, password: string, tenantId: string, role?: 'client' | 'coach', email?: string }) {
        const { data, error } = await supabase.functions.invoke('manage-athlete', {
            body: input
        });

        if (error) throw error;
        return data as { success?: boolean; userId?: string; error?: string };
    }

    /**
     * Creates a new tenant and its master coach via Edge Function.
     */
    static async createTenant(input: { fullName: string, username: string, password: string, businessName: string }) {
        const { data, error } = await supabase.functions.invoke('create-tenant', {
            body: input
        });

        if (error) throw error;
        return data as { success?: boolean; userId?: string; tenantId?: string; error?: string };
    }

    /**
     * Validates an invitation token and returns tenant context.
     */
    static async validateToken(token: string) {
        const { data, error } = await supabase
            .from('invitations')
            .select('*, tenants(*)')
            .eq('token', token)
            .eq('status', 'pending')
            .single();

        if (error || !data) throw new Error('Convite inválido ou expirado');

        // Check expiry
        if (new Date(data.expires_at) < new Date()) {
            await supabase.from('invitations').update({ status: 'expired' }).eq('id', data.id);
            throw new Error('Convite expirado');
        }

        return data;
    }

    /**
     * Checks for pending invitations for the current user's email and accepts them.
     * This handles the case where a user already exists, was invited (standard flow),
     * encountered the "User Exists" error, logged in, but is not yet linked.
     * 
     * SAFETY: Only auto-accepts if:
     * 1. User has no existing tenant link (new student)
     * 2. User is already linked to the SAME tenant (reactivation)
     * Does NOT auto-accept if user is linked to a DIFFERENT tenant (prevents hijacking).
     */
    static async acceptPendingInvites(email: string) {
        console.log(`[TenantService] 🔍 Checking pending invites for: ${email}`);

        // 1. Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('[TenantService] ❌ No authenticated user found');
            return;
        }
        console.log(`[TenantService] ✅ Authenticated user ID: ${user.id}`);

        // 2. Check if user already belongs to ANY tenant
        const { data: currentClient, error: clientCheckError } = await supabase
            .from('clients')
            .select('id, tenant_id, status')
            .eq('user_id', user.id)
            .maybeSingle();

        if (clientCheckError) {
            console.error('[TenantService] ❌ Error checking current client:', clientCheckError);
        }

        if (currentClient) {
            console.log(`[TenantService] 📋 User already has client record:`, {
                id: currentClient.id,
                tenant_id: currentClient.tenant_id,
                status: currentClient.status
            });
        } else {
            console.log('[TenantService] 📋 User has NO client record (new student)');
        }

        // 3. Find pending invitations for this email
        const { data: invitations, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('email', email)
            .eq('status', 'pending');

        if (error) {
            console.error('[TenantService] ❌ Error fetching invitations:', error);
            return;
        }

        if (!invitations || invitations.length === 0) {
            console.log('[TenantService] 📭 No pending invitations found');
            return;
        }

        console.log(`[TenantService] 📬 Found ${invitations.length} pending invite(s):`, invitations.map(i => ({
            id: i.id,
            tenant_id: i.tenant_id,
            role: i.role,
            status: i.status
        })));

        // 4. Process each invitation with safety checks
        for (const invite of invitations) {
            console.log(`[TenantService] 🔄 Processing invite ${invite.id}...`);

            // Only handle client invites (coaches require different flow)
            if (invite.role !== 'client') {
                console.log(`[TenantService] ⏭️  Skipping non-client invite (role: ${invite.role})`);
                continue;
            }

            // SAFETY CHECK: Prevent cross-tenant automatic linking
            if (currentClient && currentClient.tenant_id !== invite.tenant_id) {
                console.warn(
                    `[TenantService] 🚫 SKIPPED invite ${invite.id}: User already linked to tenant ${currentClient.tenant_id}, ` +
                    `invite is from different tenant ${invite.tenant_id}. Manual action required.`
                );
                continue;
            }

            // Safe scenarios:
            // - User has no client record (new student)
            // - User is linked to same tenant (reactivation)

            if (currentClient) {
                // Same-tenant reactivation: update status if needed
                console.log(`[TenantService] 🔄 Same tenant scenario - checking if reactivation needed...`);
                if (currentClient.status !== 'active') {
                    const { error: updateError } = await supabase
                        .from('clients')
                        .update({ status: 'active' })
                        .eq('id', currentClient.id);

                    if (updateError) {
                        console.error(`[TenantService] ❌ Error reactivating client:`, updateError);
                    } else {
                        console.log(`[TenantService] ✅ Reactivated client ${currentClient.id}`);
                    }
                } else {
                    console.log(`[TenantService] ℹ️  Client already active, no reactivation needed`);
                }
            } else {
                // New student: create client link
                console.log(`[TenantService] ➕ Creating new client link...`);
                const { data: newClient, error: insertError } = await supabase
                    .from('clients')
                    .insert({
                        tenant_id: invite.tenant_id,
                        user_id: user.id,
                        email: email,
                        full_name: user.user_metadata?.full_name || email.split('@')[0],
                        status: 'active'
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('[TenantService] ❌ Error creating client link:', insertError);
                    continue;
                }
                console.log(`[TenantService] ✅ Created new client link:`, {
                    id: newClient.id,
                    tenant_id: newClient.tenant_id,
                    user_id: newClient.user_id,
                    status: newClient.status
                });
            }

            // Mark invitation as accepted
            console.log(`[TenantService] 📝 Marking invitation ${invite.id} as accepted...`);
            const { error: updateInviteError } = await supabase
                .from('invitations')
                .update({ status: 'accepted' })
                .eq('id', invite.id);

            if (updateInviteError) {
                console.error(`[TenantService] ❌ Error updating invitation status:`, updateInviteError);
            } else {
                console.log(`[TenantService] ✅ Invitation ${invite.id} marked as accepted`);
            }
        }

        console.log('[TenantService] ✅ Finished processing all pending invites');
    }
}
