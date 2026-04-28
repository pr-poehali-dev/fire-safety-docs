/**
 * Справочник горючих веществ для расчётов категории помещения
 * по СП 12.13130.2009.
 *
 * Источник данных: СП 12.13130.2009 Приложение А и Б,
 * "Пожаровзрывоопасность веществ и материалов" (Корольченко А.Я.).
 */

export type SubstanceType = 'gas' | 'lvzh' | 'gzh' | 'dust' | 'solid';

export interface Substance {
  id: string;
  name: string;
  type: SubstanceType;
  /** Низшая теплота сгорания, МДж/кг */
  heatOfCombustion: number;
  /** Плотность пара/газа, кг/м³ (для газов и ЛВЖ при н.у.) */
  vaporDensity?: number;
  /** Плотность жидкости при 20°C, кг/м³ (для ЛВЖ/ГЖ) */
  liquidDensity?: number;
  /** Температура вспышки, °C (для ЛВЖ/ГЖ) */
  flashPoint?: number;
  /** Нижний концентрационный предел распространения пламени, % об. */
  lcl?: number;
  /** Молекулярная формула: атомы C, H, O, X (галогены), N */
  formula: { C: number; H: number; O: number; X: number; N?: number };
  /** Молярная масса, г/моль */
  molarMass: number;
  /** Стехиометрический коэффициент кислорода β (если посчитан явно) */
  beta?: number;
}

export const SUBSTANCES: Substance[] = [
  // === ГАЗЫ ===
  {
    id: 'methane',
    name: 'Метан (CH₄)',
    type: 'gas',
    heatOfCombustion: 50.0,
    vaporDensity: 0.668,
    lcl: 5.28,
    formula: { C: 1, H: 4, O: 0, X: 0 },
    molarMass: 16.04,
  },
  {
    id: 'propane',
    name: 'Пропан (C₃H₈)',
    type: 'gas',
    heatOfCombustion: 46.4,
    vaporDensity: 1.872,
    lcl: 2.31,
    formula: { C: 3, H: 8, O: 0, X: 0 },
    molarMass: 44.10,
  },
  {
    id: 'butane',
    name: 'Бутан (C₄H₁₀)',
    type: 'gas',
    heatOfCombustion: 45.7,
    vaporDensity: 2.519,
    lcl: 1.86,
    formula: { C: 4, H: 10, O: 0, X: 0 },
    molarMass: 58.12,
  },
  {
    id: 'hydrogen',
    name: 'Водород (H₂)',
    type: 'gas',
    heatOfCombustion: 119.83,
    vaporDensity: 0.084,
    lcl: 4.0,
    formula: { C: 0, H: 2, O: 0, X: 0 },
    molarMass: 2.016,
  },
  {
    id: 'acetylene',
    name: 'Ацетилен (C₂H₂)',
    type: 'gas',
    heatOfCombustion: 48.22,
    vaporDensity: 1.087,
    lcl: 2.5,
    formula: { C: 2, H: 2, O: 0, X: 0 },
    molarMass: 26.04,
  },

  // === ЛВЖ ===
  {
    id: 'gasoline',
    name: 'Бензин АИ-92',
    type: 'lvzh',
    heatOfCombustion: 43.6,
    liquidDensity: 745,
    vaporDensity: 3.0,
    flashPoint: -36,
    lcl: 1.1,
    formula: { C: 7.024, H: 13.706, O: 0, X: 0 },
    molarMass: 98.2,
  },
  {
    id: 'kerosene',
    name: 'Керосин',
    type: 'lvzh',
    heatOfCombustion: 43.5,
    liquidDensity: 820,
    vaporDensity: 5.4,
    flashPoint: 40,
    lcl: 1.4,
    formula: { C: 13.595, H: 26.752, O: 0, X: 0 },
    molarMass: 184.3,
  },
  {
    id: 'acetone',
    name: 'Ацетон (C₃H₆O)',
    type: 'lvzh',
    heatOfCombustion: 28.6,
    liquidDensity: 791,
    vaporDensity: 2.0,
    flashPoint: -18,
    lcl: 2.7,
    formula: { C: 3, H: 6, O: 1, X: 0 },
    molarMass: 58.08,
  },
  {
    id: 'ethanol',
    name: 'Этанол (C₂H₆O)',
    type: 'lvzh',
    heatOfCombustion: 27.2,
    liquidDensity: 789,
    vaporDensity: 1.6,
    flashPoint: 13,
    lcl: 3.6,
    formula: { C: 2, H: 6, O: 1, X: 0 },
    molarMass: 46.07,
  },
  {
    id: 'methanol',
    name: 'Метанол (CH₄O)',
    type: 'lvzh',
    heatOfCombustion: 22.7,
    liquidDensity: 791,
    vaporDensity: 1.1,
    flashPoint: 8,
    lcl: 6.0,
    formula: { C: 1, H: 4, O: 1, X: 0 },
    molarMass: 32.04,
  },
  {
    id: 'toluene',
    name: 'Толуол (C₇H₈)',
    type: 'lvzh',
    heatOfCombustion: 40.94,
    liquidDensity: 866,
    vaporDensity: 3.18,
    flashPoint: 4,
    lcl: 1.27,
    formula: { C: 7, H: 8, O: 0, X: 0 },
    molarMass: 92.14,
  },
  {
    id: 'benzene',
    name: 'Бензол (C₆H₆)',
    type: 'lvzh',
    heatOfCombustion: 40.58,
    liquidDensity: 879,
    vaporDensity: 2.7,
    flashPoint: -11,
    lcl: 1.43,
    formula: { C: 6, H: 6, O: 0, X: 0 },
    molarMass: 78.11,
  },
  {
    id: 'isopropanol',
    name: 'Изопропанол (C₃H₈O)',
    type: 'lvzh',
    heatOfCombustion: 30.55,
    liquidDensity: 786,
    vaporDensity: 2.07,
    flashPoint: 14,
    lcl: 2.23,
    formula: { C: 3, H: 8, O: 1, X: 0 },
    molarMass: 60.10,
  },

  // === ГЖ (горючие жидкости — t всп > 61°C) ===
  {
    id: 'diesel',
    name: 'Дизельное топливо',
    type: 'gzh',
    heatOfCombustion: 42.6,
    liquidDensity: 840,
    flashPoint: 62,
    formula: { C: 14.511, H: 29.120, O: 0, X: 0 },
    molarMass: 203.6,
  },
  {
    id: 'masut',
    name: 'Мазут топочный',
    type: 'gzh',
    heatOfCombustion: 39.2,
    liquidDensity: 990,
    flashPoint: 90,
    formula: { C: 17, H: 29, O: 0, X: 0 },
    molarMass: 240,
  },
  {
    id: 'mineral_oil',
    name: 'Масло индустриальное',
    type: 'gzh',
    heatOfCombustion: 41.87,
    liquidDensity: 880,
    flashPoint: 165,
    formula: { C: 18, H: 38, O: 0, X: 0 },
    molarMass: 254,
  },
  {
    id: 'transformer_oil',
    name: 'Масло трансформаторное',
    type: 'gzh',
    heatOfCombustion: 41.87,
    liquidDensity: 880,
    flashPoint: 135,
    formula: { C: 21.74, H: 42.28, O: 0, X: 0 },
    molarMass: 305,
  },

  // === ПЫЛИ ===
  {
    id: 'wood_dust',
    name: 'Древесная пыль',
    type: 'dust',
    heatOfCombustion: 17.0,
    vaporDensity: 250,
    lcl: 12.6,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
  {
    id: 'flour',
    name: 'Мука пшеничная',
    type: 'dust',
    heatOfCombustion: 16.0,
    vaporDensity: 540,
    lcl: 17.6,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
  {
    id: 'sugar_dust',
    name: 'Сахарная пудра',
    type: 'dust',
    heatOfCombustion: 16.5,
    vaporDensity: 590,
    lcl: 17.0,
    formula: { C: 12, H: 22, O: 11, X: 0 },
    molarMass: 342,
  },
  {
    id: 'aluminum_dust',
    name: 'Алюминиевая пыль',
    type: 'dust',
    heatOfCombustion: 30.7,
    vaporDensity: 250,
    lcl: 40,
    formula: { C: 0, H: 0, O: 0, X: 0 },
    molarMass: 26.98,
  },
  {
    id: 'coal_dust',
    name: 'Угольная пыль',
    type: 'dust',
    heatOfCombustion: 22.0,
    vaporDensity: 480,
    lcl: 114,
    formula: { C: 1, H: 0.5, O: 0.1, X: 0 },
    molarMass: 13.5,
  },

  // === ТВЁРДЫЕ ГОРЮЧИЕ ===
  {
    id: 'wood',
    name: 'Древесина (сосна)',
    type: 'solid',
    heatOfCombustion: 13.8,
    vaporDensity: 500,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
  {
    id: 'paper',
    name: 'Бумага',
    type: 'solid',
    heatOfCombustion: 13.4,
    vaporDensity: 800,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
  {
    id: 'cardboard',
    name: 'Картон',
    type: 'solid',
    heatOfCombustion: 14.5,
    vaporDensity: 700,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
  {
    id: 'rubber',
    name: 'Резина',
    type: 'solid',
    heatOfCombustion: 33.5,
    vaporDensity: 1200,
    formula: { C: 5, H: 8, O: 0, X: 0 },
    molarMass: 68.12,
  },
  {
    id: 'plastic_pe',
    name: 'Полиэтилен',
    type: 'solid',
    heatOfCombustion: 47.14,
    vaporDensity: 920,
    formula: { C: 2, H: 4, O: 0, X: 0 },
    molarMass: 28.05,
  },
  {
    id: 'plastic_pp',
    name: 'Полипропилен',
    type: 'solid',
    heatOfCombustion: 45.8,
    vaporDensity: 905,
    formula: { C: 3, H: 6, O: 0, X: 0 },
    molarMass: 42.08,
  },
  {
    id: 'cotton',
    name: 'Хлопок',
    type: 'solid',
    heatOfCombustion: 16.7,
    vaporDensity: 250,
    formula: { C: 6, H: 10, O: 5, X: 0 },
    molarMass: 162,
  },
];

export const SUBSTANCE_TYPE_LABELS: Record<SubstanceType, string> = {
  gas: 'Горючий газ',
  lvzh: 'ЛВЖ (легковоспламеняющаяся жидкость)',
  gzh: 'ГЖ (горючая жидкость)',
  dust: 'Горючая пыль',
  solid: 'Твёрдое горючее вещество',
};

export function getSubstanceById(id: string): Substance | undefined {
  return SUBSTANCES.find((s) => s.id === id);
}

export function getSubstancesByType(type: SubstanceType): Substance[] {
  return SUBSTANCES.filter((s) => s.type === type);
}
