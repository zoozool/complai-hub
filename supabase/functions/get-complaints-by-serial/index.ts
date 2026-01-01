import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Create admin client to check role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) {
      console.log('Error fetching role:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Error checking user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowedRoles = ['main_administrator', 'employee', 'service_technician'];
    if (!roleData || !allowedRoles.includes(roleData.role)) {
      console.log('User does not have required role:', roleData?.role);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User role verified:', roleData.role);

    // Get serial number from query params or body
    let serialNumber: string | null = null;

    const url = new URL(req.url);
    serialNumber = url.searchParams.get('serial_number');

    if (!serialNumber && req.method === 'POST') {
      try {
        const body = await req.json();
        serialNumber = body.serial_number || body.serialNumber;
      } catch {
        console.log('Failed to parse request body');
      }
    }

    if (!serialNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing serial_number parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for complaints with serial number:', serialNumber);

    // Fetch complaints by serial number
    const { data: complaints, error: complaintsError } = await supabaseAdmin
      .from('complaints')
      .select(`
        id,
        internal_complaint_number,
        device_serial_number,
        device_type,
        status,
        warranty_repair,
        damage_description,
        reported_problem,
        diagnosis,
        repair_cost,
        submission_date,
        completion_date,
        assigned_technician_id,
        return_first_name,
        return_last_name,
        return_email,
        return_phone
      `)
      .ilike('device_serial_number', `%${serialNumber}%`)
      .order('submission_date', { ascending: false });

    if (complaintsError) {
      console.log('Error fetching complaints:', complaintsError.message);
      return new Response(
        JSON.stringify({ error: 'Error fetching complaints' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${complaints?.length || 0} complaints`);

    return new Response(
      JSON.stringify({ 
        complaints: complaints || [],
        count: complaints?.length || 0
      }),
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
