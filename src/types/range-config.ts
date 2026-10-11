export type ContinuousRangeConfig = {
  mode: 'continuous';
  min: number;
  max: number;
};

export type DiscreteRangeConfig = {
  mode: 'discrete';
  values: number[];
};

export type RangeConfig = ContinuousRangeConfig | DiscreteRangeConfig;

export type RangeMode = RangeConfig['mode'];
