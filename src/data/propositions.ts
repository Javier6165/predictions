/**
 * Typed, hand-written natural-language propositions for every market/outcome.
 * These are the "prediction-first" sentences shown from selection to portfolio.
 * A NO contract always negates its own outcome; it never names a rival as winner.
 */

export interface PropositionPair {
  yes: string;
  no: string;
}

type BinaryEntry = { kind: 'binary' } & PropositionPair;
type MultiEntry = { kind: 'multi'; byOutcome: Record<string, PropositionPair> };

const club = (name: string): PropositionPair => ({
  yes: `${name} will win the 2027 UEFA Champions League.`,
  no: `${name} will not win the 2027 UEFA Champions League.`,
});

const genre = (article: string): PropositionPair => ({
  yes: `${article} will win Best Picture at the fictional 2027 Film Awards.`,
  no: `${article} will not win Best Picture at the fictional 2027 Film Awards.`,
});

export const PROPOSITIONS: Record<string, BinaryEntry | MultiEntry> = {
  'mars-2035': {
    kind: 'binary',
    yes: 'A crewed mission will land on Mars before 2035.',
    no: 'No crewed mission will land on Mars before 2035.',
  },
  'exoplanet-2027': {
    kind: 'binary',
    yes: 'Scientists will confirm a potentially habitable exoplanet by 2027.',
    no: 'Scientists will not confirm a potentially habitable exoplanet by 2027.',
  },
  'arctic-2027': {
    kind: 'binary',
    yes: 'September 2027 Arctic sea-ice extent will be below 4m km².',
    no: 'September 2027 Arctic sea-ice extent will not be below 4m km².',
  },
  'marlowe-election-2028': {
    kind: 'binary',
    yes: 'Elena Marlowe will win the 2028 US presidential election.',
    no: 'Elena Marlowe will not win the 2028 US presidential election.',
  },
  'midterm-turnout-2026': {
    kind: 'binary',
    yes: 'US midterm turnout will exceed 52% in 2026.',
    no: 'US midterm turnout will not exceed 52% in 2026.',
  },
  'eu-reform-2027': {
    kind: 'binary',
    yes: 'An EU AI regulatory reform will be passed in 2027.',
    no: 'No EU AI regulatory reform will be passed in 2027.',
  },
  'ucl-2027': {
    kind: 'multi',
    byOutcome: {
      'real-madrid': club('Real Madrid'),
      barcelona: club('Barcelona'),
      bayern: club('Bayern'),
      other: {
        yes: 'A club other than Real Madrid, Barcelona or Bayern will win the 2027 UEFA Champions League.',
        no: 'No club outside Real Madrid, Barcelona and Bayern will win the 2027 UEFA Champions League.',
      },
    },
  },
  'world-cup-2027': {
    kind: 'binary',
    yes: 'Spain will win the 2027 Women’s World Cup.',
    no: 'Spain will not win the 2027 Women’s World Cup.',
  },
  'nba-2027': {
    kind: 'binary',
    yes: 'The Celtics will reach the 2027 NBA Finals.',
    no: 'The Celtics will not reach the 2027 NBA Finals.',
  },
  'bitcoin-150k-2027': {
    kind: 'binary',
    yes: 'Bitcoin will reach $150,000 before 2028.',
    no: 'Bitcoin will not reach $150,000 before 2028.',
  },
  'ethereum-8k': {
    kind: 'binary',
    yes: 'Ethereum will reach $8,000 by the end of 2027.',
    no: 'Ethereum will not reach $8,000 by the end of 2027.',
  },
  'crypto-etf-2027': {
    kind: 'binary',
    yes: 'A new spot crypto ETF will be approved by June 2027.',
    no: 'No new spot crypto ETF will be approved by June 2027.',
  },
  'ai-model-2027': {
    kind: 'binary',
    yes: 'An open-source AI model will top a leading benchmark in 2027.',
    no: 'No open-source AI model will top a leading benchmark in 2027.',
  },
  'apple-foldable-2027': {
    kind: 'binary',
    yes: 'Apple will announce a foldable phone by 2027.',
    no: 'Apple will not announce a foldable phone by 2027.',
  },
  'robotaxi-2027': {
    kind: 'binary',
    yes: 'A robotaxi service will launch in three more US cities by 2027.',
    no: 'No robotaxi service will launch in three more US cities by 2027.',
  },
  'fed-2027': {
    kind: 'binary',
    yes: 'The US policy rate will be below 3% in December 2027.',
    no: 'The US policy rate will not be below 3% in December 2027.',
  },
  'inflation-2026': {
    kind: 'binary',
    yes: 'US inflation will be above 3.0% for December 2026.',
    no: 'US inflation will not be above 3.0% for December 2026.',
  },
  'oil-2027': {
    kind: 'binary',
    yes: 'Oil will trade above $110 in 2027.',
    no: 'Oil will not trade above $110 in 2027.',
  },
  'music-tour-2027': {
    kind: 'binary',
    yes: 'Aurora Vale will announce a 2027 world tour.',
    no: 'Aurora Vale will not announce a 2027 world tour.',
  },
  'film-award-2027': {
    kind: 'multi',
    byOutcome: {
      drama: genre('A drama'),
      comedy: genre('A comedy'),
      'science-fiction': genre('A science-fiction film'),
      other: {
        yes: 'A film outside drama, comedy and science fiction will win Best Picture at the fictional 2027 Film Awards.',
        no: 'No film outside drama, comedy and science fiction will win Best Picture at the fictional 2027 Film Awards.',
      },
    },
  },
  'festival-2027': {
    kind: 'binary',
    yes: 'The Horizon Sound festival will be announced by 2027.',
    no: 'The Horizon Sound festival will not be announced by 2027.',
  },
  'peace-talks-2027': {
    kind: 'binary',
    yes: 'A new peace negotiation process will begin by June 2027.',
    no: 'No new peace negotiation process will begin by June 2027.',
  },
  'global-event-pending': {
    kind: 'binary',
    yes: 'The October 2026 summit will announce a signed joint initiative.',
    no: 'The October 2026 summit will not announce a signed joint initiative.',
  },
  'global-event-resolved': {
    kind: 'binary',
    yes: 'The climate summit adopted its planned declaration.',
    no: 'The climate summit did not adopt its planned declaration.',
  },
};
