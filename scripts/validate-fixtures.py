#!/usr/bin/env python3
"""Validate the externally-authored NOVA demo seed before Claude Code uses it.
Stdlib-only: python3 scripts/validate-fixtures.py
"""
from __future__ import annotations
import json
from datetime import datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/demo-fixtures.v1.7.json'
d=json.loads(DATA.read_text(encoding='utf-8'))
errors=[]

def check(ok:bool,message:str):
    if not ok:errors.append(message)

def money(*values): return all(isinstance(v,int) and not isinstance(v,bool) for v in values)

def dt(value):
    try:
        v=datetime.fromisoformat(value.replace('Z','+00:00'))
        check(v.utcoffset() is not None, f'Unzoned date: {value}')
        return v
    except Exception: errors.append(f'Invalid date: {value}');return None

check(d['schemaVersion']==2,'Unexpected schema')
check(d['isSimulation'] is True,'Simulation label missing')
snapshot=dt(d['displayAsOf'])
markets=d['marketData'];ids=[m['id'] for m in markets]
check(len(markets)>=24,'Insufficient demo diversity')
check(len(ids)==len(set(ids)),'Duplicate market IDs')
check(len(set(m['category'] for m in markets))>=8,'Fewer than 8 categories')
by_id={m['id']:m for m in markets}
for m in markets:
    mid=m['id']; status=m['status']; end=dt(m['closeAt'])
    check(m['storylineIsFictional'] is True,f'{mid}: not flagged fiction')
    check(m['resolutionRule']['isSimulated'] is True,f'{mid}: no simulated resolution')
    check(m['resolutionRule']['yesCondition'] and m['resolutionRule']['evaluatedAt'],f'{mid}: missing rule')
    dt(m['resolutionRule']['evaluatedAt'])
    check(len(m['outcomes'])>=1,f'{mid}: no outcomes')
    check(len(set(o['id'] for o in m['outcomes']))==len(m['outcomes']),f'{mid}: duplicate outcomes')
    if snapshot is not None and end is not None:
        check((end>snapshot) == (status in ('OPEN','UPCOMING')),f'{mid}: market status vs snapshot time')
    if m['type']=='MULTI_OUTCOME':check(sum(o['probabilityCents'] for o in m['outcomes'])==100,f'{mid}: mutually exclusive outcomes do not total 100')
    for o in m['outcomes']:
        oid=o['id']; v=o['probabilityCents']
        check(money(v) and 0<=v<=100,f'{mid}/{oid}: invalid probability')
        for side in ('yesQuote','noQuote'):
            q=o[side]
            if status!='OPEN':
                check(q is None,f'{mid}/{oid}: nontrading market still has executable quote')
            else:
                check(q is not None,f'{mid}/{oid}: active market quote missing')
                if q:
                    a,b,k=q['askCents'],q['bidCents'],q['indicativeCents']
                    check(money(a,b,k) and 1<=b<=k<=a<=99,f'{mid}/{oid}/{side}: bad bid/mark/ask')
                    check(k==(v if side=='yesQuote' else 100-v),f'{mid}/{oid}/{side}: inconsistent probability')
    series=m['chartPoints']
    check(len(series)>=8,f'{mid}: too few chart points')
    time_values=[dt(p['at']) for p in series]
    check(all(a<b for a,b in zip(time_values,time_values[1:]) if a and b),f'{mid}: unordered chart')
    for p in series:
        vs=p['probabilityCentsByOutcome']
        check(set(vs)=={o['id'] for o in m['outcomes']},f'{mid}: chart outcome IDs differ')
        check(all(money(x) and 1<=x<=99 for x in vs.values()),f'{mid}: bad chart point')
        if m['type']=='MULTI_OUTCOME':check(sum(vs.values())==100,f'{mid}: chart snapshot not 100%')
    check(series[-1]['probabilityCentsByOutcome']=={o['id']:o['probabilityCents'] for o in m['outcomes']},f'{mid}: chart endpoint not equal to displayed probability')
    if end and time_values[-1]:check(time_values[-1]<=end,f'{mid}: chart after close')
    for upd in m['demoUpdates']:
        check(upd['isSimulated'] is True and upd['publisher']=='NOVA DEMO',f'{mid}: simulated update not clearly labelled')
        dt(upd['at'])
    liq=m['demoLiquidity']
    check(money(*liq.values()) and all(x>=0 for x in liq.values()),f'{mid}: liquidity invalid')
    if status!='OPEN':check(all(x==0 for x in liq.values()),f'{mid}: untradeable market liquidity nonzero')
    if status=='RESOLVED':
        check(m['winningOutcomeId'] in {o['id'] for o in m['outcomes']},f'{mid}: winner missing')
        dt(m['resolvedAt'])

st=d['initialState'];positions=st['positions'];orders=st['orders']
spent=sum(p['costBasisCents'] for p in positions)
marked=sum(p['currentMarkedValueCents'] for p in positions)
check(money(*[st[k] for k in ('initialDepositCents','cashTotalCents','reservedCashCents','availableCashCents','portfolioValueCents','unrealizedPnLCents','realizedPnLCents')]),'Floats used for money')
check(st['initialDepositCents']-spent==st['cashTotalCents'],'seed cash vs purchases mismatch')
check(st['cashTotalCents']-st['reservedCashCents']==st['availableCashCents'],'available cash mismatch')
check(st['cashTotalCents']+marked==st['portfolioValueCents'],'portfolio total mismatch')
check(sum(p['unrealizedPnLCents'] for p in positions)==st['unrealizedPnLCents'],'seed unrealized P&L mismatch')
check(sum(o['reservedCashCents'] for o in orders)==st['reservedCashCents'],'sum reserved orders mismatch')
check(len({p['id'] for p in positions})==len(positions),'Duplicate positions')
for p in positions:
    mid,oid=p['marketId'],p['outcomeId']
    check(mid in by_id,f'position {p["id"]}: unknown market')
    if mid not in by_id:continue
    m=by_id[mid]; outcomes={o['id']:o for o in m['outcomes']}
    check(oid in outcomes,f'position {p["id"]}: unknown outcome')
    if oid not in outcomes:continue
    o=outcomes[oid]
    desired=o['probabilityCents'] if p['side']=='YES' else 100-o['probabilityCents']
    check(p['currentMarkCents']==desired,f'position {p["id"]}: stale mark')
    check(p['costBasisCents']==p['quantity']*p['averageBuyPriceCents'],f'position {p["id"]}: basis mismatch')
    check(p['currentMarkedValueCents']==p['quantity']*p['currentMarkCents'],f'position {p["id"]}: value mismatch')
    check(p['unrealizedPnLCents']==p['currentMarkedValueCents']-p['costBasisCents'],f'position {p["id"]}: P&L mismatch')
for o in orders:
    check(o['status']=='OPEN' and o['filledQuantity']==0,'P0 pending seed must be fully open')
    check(o['marketId'] in by_id,'order unknown market')
    check(o['reservedCashCents']==o['requestedQuantity']*o['limitPriceCents'],'order cash reserve wrong')
for ref in st['savedMarketIds']:
    check(ref in by_id,f'saved nonexistent market {ref}')
for n in st['notifications']:
    check(n.get('targetMarketId') in by_id,'notification nonexistent target')

if errors:
    print(f'FAILED: {len(errors)} fixture issue(s)')
    for issue in errors:print(' -',issue)
    raise SystemExit(1)
print(f'PASS: {len(markets)} markets, {len(set(m["category"] for m in markets))} categories, '
      f'{len(positions)} open positions, {len(orders)} resting order(s); full financial reconciliation OK.')
