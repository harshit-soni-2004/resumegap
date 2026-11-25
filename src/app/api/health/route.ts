import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

export async function GET(request: Request) {
  // Reading request.url ensures this route handler is evaluated dynamically at runtime
  void new URL(request.url);
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Check Gemini
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  let geminiReachable = false;
  if (geminiConfigured) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
        apiVersion: 'v1beta',
      });
      // Lightweight check: list models
      const pager = await ai.models.list();
      // Iterate at least one item to confirm connectivity
      for await (const model of pager) {
        if (model) {
          geminiReachable = true;
          break;
        }
      }
    } catch (err) {
      console.warn('[HealthCheck] Gemini probe failed:', err instanceof Error ? err.message : 'Unknown');
      geminiReachable = false;
    }
  }

  // 2. Check Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  let supabaseReachable = false;
  if (supabaseConfigured) {
    try {
      const supabase = createClient(supabaseUrl!, supabaseKey!, {
        auth: { persistSession: false },
      });
      const { error } = await supabase.from('analytics_events').select('id', { head: true, count: 'exact' });
      supabaseReachable = !error;
      if (error) {
        console.warn('[HealthCheck] Supabase probe returned error:', error.message);
      }
    } catch (err) {
      console.warn('[HealthCheck] Supabase connection error:', err instanceof Error ? err.message : 'Unknown');
      supabaseReachable = false;
    }
  }

  // 3. Check Upstash Redis
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const upstashConfigured = Boolean(upstashUrl && upstashToken);
  let upstashReachable = false;
  if (upstashConfigured) {
    try {
      const redis = new Redis({
        url: upstashUrl!,
        token: upstashToken!,
      });
      const pingRes = await redis.ping();
      upstashReachable = pingRes === 'PONG';
    } catch (err) {
      console.warn('[HealthCheck] Upstash probe error:', err instanceof Error ? err.message : 'Unknown');
      upstashReachable = false;
    }
  }

  // Determine overall status
  // In development, app is healthy as long as local fallbacks work. In prod, check core services.
  const isHealthy = geminiConfigured ? geminiReachable : !isProd;

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      gemini: {
        configured: geminiConfigured,
        reachable: geminiReachable,
      },
      supabase: {
        configured: supabaseConfigured,
        reachable: supabaseReachable,
      },
      upstash: {
        configured: upstashConfigured,
        reachable: upstashReachable,
      },
    },
  });
}
