import test from 'node:test';
import assert from 'node:assert/strict';
import { freshnessStatus, selectBestRecord, summarizeDataQuality } from '../src/market.js';

test('freshness status classifies records', () => {
  const now = new Date('2026-10-01T12:00:00Z');
  const fresh = freshnessStatus({ sourceType: 'LIVE', updatedAt: '2026-10-01T10:00:00Z' }, now);
  const stale = freshnessStatus({ sourceType: 'LIVE', updatedAt: '2026-09-30T00:00:00Z' }, now);
  assert.equal(fresh.status, 'FRESH');
  assert.equal(stale.status, 'STALE');
});

test('selectBestRecord prefers higher quality when fresh', () => {
  const now = new Date('2026-10-01T12:00:00Z');
  const picked = selectBestRecord([
    { value: 100, sourceType: 'MARKET_AVG', updatedAt: '2026-10-01T11:00:00Z' },
    { value: 105, sourceType: 'OFFICIAL', updatedAt: '2026-09-30T12:00:00Z' }
  ], { now });
  assert.equal(picked.value, 105);
});

test('summarizeDataQuality returns counts', () => {
  const now = new Date('2026-10-01T12:00:00Z');
  const s = summarizeDataQuality([
    { sourceType: 'LIVE', updatedAt: '2026-10-01T11:00:00Z' },
    { sourceType: 'LIVE', updatedAt: '2026-09-29T11:00:00Z' }
  ], { now });
  assert.equal(s.total, 2);
  assert.equal(s.fresh, 1);
  assert.equal(s.stale, 1);
});
