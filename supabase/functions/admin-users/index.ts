import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// CashFlow price ID — only subscriptions with this price are relevant
const CASHFLOW_PRICE_ID = "price_1T7DVhQjq40OtFkDBWdHoSIm";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const callerId = userData.user?.id;
    if (!callerId) throw new Error("Not authenticated");

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Unauthorized: admin only");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the product ID associated with our price
    const price = await stripe.prices.retrieve(CASHFLOW_PRICE_ID);
    const cashflowProductId = typeof price.product === 'string' ? price.product : price.product.id;

    // Get all users from auth
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw usersError;

    // Get all profiles
    const { data: profiles } = await supabaseClient.from("profiles").select("*");
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Get ALL subscriptions (any status) and filter by CashFlow price
    let allSubs: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const params: any = { limit: 100, status: "all" };
      if (startingAfter) params.starting_after = startingAfter;
      const batch = await stripe.subscriptions.list(params);
      allSubs = allSubs.concat(batch.data);
      hasMore = batch.has_more;
      if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
    }

    // Filter: only subs that contain the CashFlow price
    const cashflowSubs = allSubs.filter((s: any) =>
      s.items.data.some((item: any) => item.price.id === CASHFLOW_PRICE_ID)
    );

    // Map customer ID -> subscription (most recent)
    const subByCustomer = new Map<string, any>();
    for (const s of cashflowSubs) {
      const custId = typeof s.customer === 'string' ? s.customer : s.customer.id;
      const existing = subByCustomer.get(custId);
      if (!existing || s.created > existing.created) {
        subByCustomer.set(custId, s);
      }
    }

    // Get relevant customer IDs
    const relevantCustomerIds = new Set(subByCustomer.keys());

    // Get customers for email mapping
    const customerEmailMap = new Map<string, any>(); // email -> customer
    const customerIdMap = new Map<string, any>(); // id -> customer
    let custHasMore = true;
    let custStartingAfter: string | undefined;
    while (custHasMore) {
      const params: any = { limit: 100 };
      if (custStartingAfter) params.starting_after = custStartingAfter;
      const batch = await stripe.customers.list(params);
      for (const c of batch.data) {
        if (c.email) customerEmailMap.set(c.email, c);
        customerIdMap.set(c.id, c);
      }
      custHasMore = batch.has_more;
      if (batch.data.length > 0) custStartingAfter = batch.data[batch.data.length - 1].id;
    }

    // Build user list
    const userList = users.map((u: any) => {
      const profile = profileMap.get(u.id);
      const customer = u.email ? customerEmailMap.get(u.email) : null;
      const sub = customer ? subByCustomer.get(customer.id) : null;

      let status: 'ativo' | 'cancelado' | 'inadimplente' = 'cancelado';
      if (sub) {
        if (sub.status === 'active') status = 'ativo';
        else if (sub.status === 'past_due') status = 'inadimplente';
        else status = 'cancelado';
      }

      return {
        id: u.id,
        nome: profile?.nome || '',
        email: u.email || '',
        loja: profile?.loja || '',
        status,
        dataCadastro: u.created_at,
        dataRenovacao: sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      };
    });

    // Get invoices ONLY for CashFlow subscriptions
    const cashflowSubIds = new Set(cashflowSubs.map((s: any) => s.id));
    let allInvoices: any[] = [];
    let invHasMore = true;
    let invStartingAfter: string | undefined;
    while (invHasMore) {
      const params: any = { limit: 100 };
      if (invStartingAfter) params.starting_after = invStartingAfter;
      const batch = await stripe.invoices.list(params);
      allInvoices = allInvoices.concat(batch.data);
      invHasMore = batch.has_more;
      if (batch.data.length > 0) invStartingAfter = batch.data[batch.data.length - 1].id;
    }

    // Build set of registered user emails for cross-referencing
    const registeredEmails = new Set(users.map((u: any) => u.email?.toLowerCase()).filter(Boolean));

    // Filter invoices: only those belonging to CashFlow subscriptions AND registered users
    const cashflowInvoices = allInvoices.filter((inv: any) => {
      // Must be from a registered user
      if (!inv.customer_email || !registeredEmails.has(inv.customer_email.toLowerCase())) {
        return false;
      }
      // Must be from a CashFlow subscription
      if (inv.subscription) {
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription.id;
        return cashflowSubIds.has(subId);
      }
      // Also check line items for the product
      if (inv.lines?.data) {
        return inv.lines.data.some((line: any) =>
          line.price?.id === CASHFLOW_PRICE_ID ||
          line.price?.product === cashflowProductId
        );
      }
      return false;
    });

    const billingHistory = cashflowInvoices.map((inv: any) => ({
      id: inv.id,
      customerEmail: inv.customer_email,
      customerName: inv.customer_name || inv.customer_email,
      valor: (inv.amount_paid || 0) / 100,
      data: new Date(inv.created * 1000).toISOString(),
      status: inv.status === 'paid' ? 'pago' : inv.status === 'open' ? 'pendente' : 'falhou',
      metodo: inv.payment_intent ? 'Cartão' : 'Outro',
    }));

    return new Response(JSON.stringify({ users: userList, billing: billingHistory }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
