# polari-functions

Operational runbook for POLARI. The live catalog is the `quick_function`
table in Supabase; the Quick Functions tab (⚡) renders it.

## The workflow
1. Open Quick Functions tab
2. App dropdown -> Function dropdown -> fill parameters
3. Copy the generated command
4. terminal(bash) commands: paste into Ubuntu terminal at ~/Projects/polari-iq
   SQL commands: paste into Supabase SQL Editor (or hand to Claude)
5. Follow the "Then" step it shows you

## Apps
- App Deploy (4 fns): add-page, wire-page, build-push, fix-duplicate-imports
- Multi-Agent (4 fns): run-agents-dry, grade-run, rate-output, critic-calibration
- Router (5 fns): tier-check, enable-model, live-switch, spend-check, evidence-check
- Intelligence Loop (2 fns): run-loop, loop-iq

## Add a new quick function (no rebuild needed)
INSERT INTO quick_function (app, fn_name, purpose, params, command_template, run_where, next_step)
VALUES ('Router','my-fn','What it does',
 '[{"name":"x","label":"X value","example":"42"}]',
 'SELECT {{x}};','sql','What to do after.');
