export const ValkyrieBaseRanks = Object.freeze(['b', 'a', 's'] as const);

export const ValkyrieRanks = Object.freeze([
  'b',
  'a',
  's',
  's1',
  's2',
  's3',
  'ss',
  'ss1',
  'ss2',
  'ss3',
  'sss',
] as const);

export const ValkyrieNatures = Object.freeze([
  {
    display: 'Mecha',
    value: 'mech',
    emoji: '<:NatureMecha:825769059994828810>',
  },
  {
    display: 'Biologic',
    value: 'bio',
    emoji: '<:NatureBiologic:825769849229672459>',
  },
  {
    display: 'Psychic',
    value: 'psy',
    emoji: '<:NaturePsychic:825770181912690688>',
  },
  {
    display: 'Quantum',
    value: 'qua',
    emoji: '<:NatureQuantum:826695360168722454>',
  },
  {
    display: 'Imaginary',
    value: 'imag',
    emoji: '<:NatureImaginary:901671589614075955>',
  },
] as const);

export const AugmentCoreRanks = Object.freeze([1, 2, 3, 4, 5, 6] as const);

/**
 * AugmentCoreRequirements[baseRank][coreRank] = Minimum Valkyrie Rank
 */
export const AugmentCoreRequirements = Object.freeze({
  a: ['a', 's', 's', 'ss', 'ss', 'sss'] as const,
  s: ['s', 's', 's', 's', 'ss', 'sss'] as const,
});
