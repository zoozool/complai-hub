import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT and get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.log('Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'main_administrator')
      .maybeSingle();

    if (roleError) {
      console.error('Error checking user role:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.log('User is not an admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User has admin role');

    // Get the complaint ID from query params or request body
    const url = new URL(req.url);
    let complaintId = url.searchParams.get('id');

    // If not in query params, try request body for POST requests
    if (!complaintId && req.method === 'POST') {
      const body = await req.json();
      complaintId = body.id;
    }

    if (!complaintId) {
      console.log('No complaint ID provided');
      return new Response(
        JSON.stringify({ error: 'Complaint ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching complaint:', complaintId);

    // Fetch the complaint
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .maybeSingle();

    if (complaintError) {
      console.error('Error fetching complaint:', complaintError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch complaint' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!complaint) {
      console.log('Complaint not found:', complaintId);
      return new Response(
        JSON.stringify({ error: 'Complaint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Complaint found successfully');

    return new Response(
      JSON.stringify({ data: complaint }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
