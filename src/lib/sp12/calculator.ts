/**
 * Расчёт категории помещения по пожарной и взрывопожарной опасности
 * согласно СП 12.13130.2009.
 *
 * Реализованы:
 *   - § 6.1, 6.2, А.1 — расчёт ΔP (избыточное давление взрыва) для газов и ЛВЖ
 *   - § 6.3, А.2 — расчёт ΔP для пылей
 *   - § 7, Б — расчёт удельной пожарной нагрузки g (категории В1-В4)
 */

import { Substance } from './substances';

export type Category = 'А' | 'Б' | 'В1' | 'В2' | 'В3' | 'В4' | 'Г' | 'Д';

export interface CalculationInput {
  /** Наименование помещения */
  roomName: string;
  /** Площадь помещения, м² */
  area: number;
  /** Высота помещения, м */
  height: number;
  /** Свободный объём, м³ (если 0 — будет рассчитан как S × H × 0.8) */
  freeVolume?: number;
  /** Температура в помещении, °C (по умолчанию 20) */
  roomTemp?: number;
  /** Расчётное вещество */
  substance: Substance;
  /** Масса горючего вещества, поступившего в помещение, кг */
  mass: number;
  /** Площадь размещения пожарной нагрузки, м² (для В1-В4). По СП 12 — не более 10 м² минимум */
  loadArea?: number;
  /** Наличие исправной аварийной вентиляции (понижает категорию) */
  emergencyVentilation?: boolean;
  /** Время отключения трубопровода, с (по умолчанию 120) */
  shutoffTime?: number;
}

export interface CalculationStep {
  label: string;
  formula?: string;
  value: string;
}

export interface CalculationResult {
  category: Category;
  reason: string;
  /** Избыточное давление взрыва, кПа (если применимо) */
  deltaP?: number;
  /** Полная пожарная нагрузка Q, МДж */
  Q?: number;
  /** Удельная пожарная нагрузка g, МДж/м² */
  g?: number;
  /** Стехиометрическая концентрация C_st, % об. */
  Cst?: number;
  /** Коэффициент β для C_st */
  beta?: number;
  /** Свободный объём помещения, м³ */
  freeVolume: number;
  /** Промежуточные шаги для вывода */
  steps: CalculationStep[];
  /** Предупреждения / пометки */
  warnings: string[];
  /** Применимы ли расчёты ΔP к выбранному веществу */
  pressureCalculated: boolean;
}

const PMAX = 900; // кПа, максимальное давление взрыва (типично для большинства углеводородов)
const P0 = 101; // кПа, начальное давление
const Z = 0.5; // коэффициент участия горючего в горении (для газов и ЛВЖ)
const Z_DUST = 0.5; // для пылей
const KN = 3; // коэффициент негерметичности и неадиабатичности

/**
 * Стехиометрический коэффициент кислорода:
 * β = n_C + (n_H - n_X)/4 - n_O/2
 */
export function calcBeta(formula: { C: number; H: number; O: number; X: number }): number {
  const { C, H, O, X } = formula;
  return C + (H - X) / 4 - O / 2;
}

/**
 * Стехиометрическая концентрация горючего в воздухе:
 * C_st = 100 / (1 + 4.84 × β), % об.
 */
export function calcCst(beta: number): number {
  return 100 / (1 + 4.84 * beta);
}

/**
 * Удельная теплота сгорания нагрузки i (МДж):
 * Q = Σ G_i × Q_нi
 */
export function calcFireLoad(mass: number, heatOfCombustion: number): number {
  return mass * heatOfCombustion;
}

/**
 * Удельная пожарная нагрузка g, МДж/м²
 * (площадь не менее 10 м² согласно СП 12 § 7)
 */
export function calcSpecificLoad(Q: number, area: number): number {
  const effArea = Math.max(area, 10);
  return Q / effArea;
}

/**
 * Категория В1-В4 по удельной нагрузке g (СП 12, таблица Б.1)
 */
export function categorizeByLoad(g: number): { cat: Category; reason: string } | null {
  if (g <= 0) return null;
  if (g > 2200) return { cat: 'В1', reason: 'Удельная пожарная нагрузка g > 2200 МДж/м²' };
  if (g > 1400) return { cat: 'В2', reason: 'Удельная пожарная нагрузка 1401–2200 МДж/м²' };
  if (g > 180) return { cat: 'В3', reason: 'Удельная пожарная нагрузка 181–1400 МДж/м²' };
  return { cat: 'В4', reason: 'Удельная пожарная нагрузка 1–180 МДж/м²' };
}

/**
 * Расчёт избыточного давления взрыва ΔP, кПа.
 *
 * Для газов и ЛВЖ (СП 12 § А.1.1):
 *   ΔP = (P_max - P_0) × m × Z × 100 / (V_св × ρ_г,п × C_st × K_н)
 *
 * Для пылей (СП 12 § А.2):
 *   ΔP = m × H_T × P_0 × Z / (V_св × ρ_в × C_p × T_0 × K_н),
 *   упрощённая форма с использованием эмпирического выражения, см. СП.
 *   Здесь используется формула из задания пользователя:
 *   ΔP = P_max × (1 − 1.12 × P_0 / P_max) × (m × z × 100) / (V_св × ρ_п × K_н)
 */
export function calcDeltaP(
  substanceType: 'gas' | 'lvzh' | 'gzh' | 'dust' | 'solid',
  mass: number,
  freeVolume: number,
  density: number,
  Cst: number,
): number | null {
  if (freeVolume <= 0 || density <= 0) return null;

  if (substanceType === 'gas' || substanceType === 'lvzh') {
    if (Cst <= 0) return null;
    return ((PMAX - P0) * mass * Z * 100) / (freeVolume * density * Cst * KN);
  }

  if (substanceType === 'dust') {
    return (PMAX * (1 - (1.12 * P0) / PMAX) * mass * Z_DUST * 100) / (freeVolume * density * KN);
  }

  return null; // ГЖ — взрыв не считается, сразу В1-В4 / Г
}

/**
 * Главная функция расчёта категории.
 */
export function calculateCategory(input: CalculationInput): CalculationResult {
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];

  // Свободный объём (по умолчанию 80% от геометрического)
  const geomVolume = input.area * input.height;
  const freeVolume = input.freeVolume && input.freeVolume > 0
    ? input.freeVolume
    : geomVolume * 0.8;

  steps.push({
    label: 'Геометрический объём помещения',
    formula: 'V = S × H',
    value: `${input.area} × ${input.height} = ${geomVolume.toFixed(2)} м³`,
  });
  if (!input.freeVolume) {
    steps.push({
      label: 'Свободный объём (по умолчанию)',
      formula: 'V_св = V × 0,8',
      value: `${geomVolume.toFixed(2)} × 0,8 = ${freeVolume.toFixed(2)} м³`,
    });
  } else {
    steps.push({
      label: 'Свободный объём (задан вручную)',
      value: `V_св = ${freeVolume.toFixed(2)} м³`,
    });
  }

  // Полная пожарная нагрузка
  const Q = calcFireLoad(input.mass, input.substance.heatOfCombustion);
  steps.push({
    label: 'Полная пожарная нагрузка',
    formula: 'Q = G × Q_н',
    value: `${input.mass} кг × ${input.substance.heatOfCombustion} МДж/кг = ${Q.toFixed(2)} МДж`,
  });

  const loadArea = input.loadArea && input.loadArea > 0 ? input.loadArea : Math.min(input.area, 10);
  const effArea = Math.max(loadArea, 10);
  const g = Q / effArea;
  steps.push({
    label: 'Удельная пожарная нагрузка',
    formula: 'g = Q / S (S не менее 10 м²)',
    value: `${Q.toFixed(2)} / ${effArea} = ${g.toFixed(2)} МДж/м²`,
  });

  // ΔP — только для газов, ЛВЖ, пылей
  const sType = input.substance.type;
  let deltaP: number | null = null;
  let Cst: number | null = null;
  let beta: number | null = null;
  let pressureCalculated = false;

  if (sType === 'gas' || sType === 'lvzh') {
    beta = calcBeta(input.substance.formula);
    Cst = calcCst(beta);
    const density = input.substance.vaporDensity || 0;
    if (density > 0) {
      deltaP = calcDeltaP(sType, input.mass, freeVolume, density, Cst);
      pressureCalculated = deltaP !== null;
      steps.push({
        label: 'Стехиометрический коэффициент β',
        formula: 'β = n_C + (n_H − n_X)/4 − n_O/2',
        value: `β = ${beta.toFixed(4)}`,
      });
      steps.push({
        label: 'Стехиометрическая концентрация',
        formula: 'C_st = 100 / (1 + 4,84 × β)',
        value: `C_st = ${Cst.toFixed(3)} % об.`,
      });
      if (deltaP !== null) {
        steps.push({
          label: 'Избыточное давление взрыва',
          formula: 'ΔP = (P_max − P_0) × m × Z × 100 / (V_св × ρ_г × C_st × K_н)',
          value: `ΔP = ${deltaP.toFixed(3)} кПа`,
        });
      }
    } else {
      warnings.push('Не задана плотность пара/газа — ΔP рассчитать невозможно');
    }
  } else if (sType === 'dust') {
    const density = input.substance.vaporDensity || 0;
    if (density > 0) {
      deltaP = calcDeltaP(sType, input.mass, freeVolume, density, 0);
      pressureCalculated = deltaP !== null;
      if (deltaP !== null) {
        steps.push({
          label: 'Избыточное давление взрыва (пыль)',
          formula: 'ΔP = P_max × (1 − 1,12·P_0/P_max) × m·Z·100 / (V_св × ρ_п × K_н)',
          value: `ΔP = ${deltaP.toFixed(3)} кПа`,
        });
      }
    } else {
      warnings.push('Не задана плотность пыли — ΔP рассчитать невозможно');
    }
  } else {
    warnings.push(
      `Для типа «${sType === 'gzh' ? 'ГЖ' : 'твёрдое горючее'}» расчёт ΔP по СП 12 не выполняется. Категория определяется только по пожарной нагрузке.`,
    );
  }

  // Определение категории
  let category: Category;
  let reason: string;

  if (pressureCalculated && deltaP !== null && deltaP > 5) {
    if (sType === 'gas' || sType === 'lvzh') {
      // Категория А: горючие газы или ЛВЖ с t_всп ≤ 28°C, ΔP > 5 кПа
      // Категория Б: горючие пыли или ЛВЖ с t_всп > 28°C, ΔP > 5 кПа
      const flash = input.substance.flashPoint;
      if (sType === 'gas' || (flash !== undefined && flash <= 28)) {
        category = 'А';
        reason = `Горючие газы/ЛВЖ с t_всп ≤ 28°C, ΔP = ${deltaP.toFixed(2)} кПа > 5 кПа`;
      } else {
        category = 'Б';
        reason = `ЛВЖ с t_всп > 28°C, ΔP = ${deltaP.toFixed(2)} кПа > 5 кПа`;
      }
    } else if (sType === 'dust') {
      category = 'Б';
      reason = `Горючая пыль, ΔP = ${deltaP.toFixed(2)} кПа > 5 кПа`;
    } else {
      category = 'В1';
      reason = '';
    }
  } else {
    // Категория по пожарной нагрузке
    const cat = categorizeByLoad(g);
    if (cat) {
      category = cat.cat;
      reason = cat.reason;
      if (!pressureCalculated && (sType === 'gas' || sType === 'lvzh' || sType === 'dust')) {
        reason += ' (ΔP ≤ 5 кПа или не рассчитано)';
      }
    } else {
      category = 'Д';
      reason = 'Горючие вещества и материалы отсутствуют либо пожарная нагрузка нулевая';
    }
  }

  if (input.emergencyVentilation && (category === 'А' || category === 'Б')) {
    warnings.push(
      'При наличии исправной аварийной вентиляции категория может быть снижена согласно СП 12 § 6.5 — требуется отдельный расчёт.',
    );
  }

  return {
    category,
    reason,
    deltaP: deltaP || undefined,
    Q,
    g,
    Cst: Cst || undefined,
    beta: beta || undefined,
    freeVolume,
    steps,
    warnings,
    pressureCalculated,
  };
}

export const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string; label: string }> = {
  'А': { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white', label: 'Повышенная взрывопожароопасность' },
  'Б': { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white', label: 'Взрывопожароопасность' },
  'В1': { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-white', label: 'Пожароопасность (высокая)' },
  'В2': { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-white', label: 'Пожароопасность (повыш.)' },
  'В3': { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-slate-900', label: 'Пожароопасность (средняя)' },
  'В4': { bg: 'bg-yellow-300', border: 'border-yellow-400', text: 'text-slate-900', label: 'Пожароопасность (пониж.)' },
  'Г': { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', label: 'Умеренная пожароопасность' },
  'Д': { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', label: 'Пониженная пожароопасность' },
};
