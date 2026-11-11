/**
 * Ficha de sostenibilidad — modelo de estimación de huella de carbono de un evento.
 *
 * Responsable del modelo: Jesús David Miranda (Ing. Mecánica).
 * Todos los factores y supuestos están en EMISSION_FACTORS: si se ajusta un valor
 * aquí, se actualiza en toda la plataforma (ficha del evento, formulario y panel).
 *
 * Modelo (Fase 5 de la propuesta):
 *   Huella total = Transporte + Energía + Materiales
 *
 *   Transporte = asistentes × distancia promedio de ida × 2 (ida y vuelta)
 *                × Σ (participación del modo × factor por pasajero-km del modo)
 *     factor por pasajero-km = factor del combustible (kg CO₂/gal)
 *                              ÷ rendimiento del vehículo (km/gal)
 *                              ÷ ocupación promedio (personas/vehículo)
 *
 *   Energía    = potencia de equipos (kW) × horas de uso × factor de la red (kg CO₂e/kWh)
 *     Ej.: sonido de 1 kW × 3 h = 3 kWh × 0,220 = 0,66 kg CO₂e
 *
 *   Materiales = Σ cantidad × factor del material (kg CO₂e/unidad)
 */
import type { FootprintResult, SustainabilityInputs } from './types'

export const EMISSION_FACTORS = {
  fuels: {
    gasolinaE10: {
      kgCO2PerGal: 7.6181,
      label: 'Gasolina E10 (mezcla comercial)',
      source: 'UPME — Factores de Emisión de los Combustibles Colombianos (FECOC 2016)',
    },
    dieselB10: {
      kgCO2PerGal: 10.2765,
      label: 'Diésel B10 (mezcla comercial)',
      source: 'UPME — Factores de Emisión de los Combustibles Colombianos (FECOC 2016)',
    },
  },
  grid: {
    kgCO2ePerKWh: 0.22,
    label: 'Sistema Interconectado Nacional, año 2024',
    source: 'UPME — Resolución 000085 de 2026 (factor de emisión del SIN 2024)',
  },
  /**
   * Supuestos de rendimiento y ocupación (ajustables). Son valores típicos para
   * vehículos urbanos en Colombia y deben validarse con datos locales.
   */
  vehicles: {
    car: { label: 'Carro particular o taxi', fuel: 'gasolinaE10', kmPerGal: 40, occupancy: 1.5 },
    motorcycle: { label: 'Moto', fuel: 'gasolinaE10', kmPerGal: 100, occupancy: 1.2 },
    bus: { label: 'Bus o Transmetro', fuel: 'dieselB10', kmPerGal: 8, occupancy: 30 },
    bikeWalk: { label: 'Bicicleta o a pie', fuel: null, kmPerGal: null, occupancy: 1 },
  },
  /**
   * Factores de referencia aproximados para materiales (producción del material,
   * literatura internacional de análisis de ciclo de vida). Pendientes de validación.
   */
  materials: {
    printedSheets: { label: 'Hojas impresas (A4)', unit: 'hoja', kgCO2e: 0.005 },
    plasticBottles: { label: 'Botellas plásticas (PET 500 ml)', unit: 'botella', kgCO2e: 0.08 },
    disposableTableware: { label: 'Kits desechables (plato, vaso y cubiertos)', unit: 'kit', kgCO2e: 0.07 },
    tshirts: { label: 'Camisetas de algodón', unit: 'camiseta', kgCO2e: 2.6 },
  },
  /** Equivalencia local: 335 mangles rojos capturan ≈ 7,0 t CO₂/año (Uninorte, 2026). */
  mangrove: {
    kgCO2PerPlantPerYear: 7000 / 335,
    source: 'Universidad del Norte (2026), jornada "Manos a la Ciénaga": 335 mangles ≈ 7,0 t CO₂/año',
  },
  /** Umbrales de la etiqueta por asistente (kg CO₂e/persona). */
  levels: { lowMax: 1.5, mediumMax: 4 },
} as const

type Mode = keyof SustainabilityInputs['transportMix']

/** kg CO₂ por pasajero-km para cada modo de transporte. */
export function perPassengerKm(mode: Mode): number {
  const v = EMISSION_FACTORS.vehicles[mode]
  if (!v.fuel || !v.kmPerGal) return 0
  const fuel = EMISSION_FACTORS.fuels[v.fuel]
  return fuel.kgCO2PerGal / v.kmPerGal / v.occupancy
}

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d

function safe(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n)
  return Number.isFinite(x) && x > 0 ? x : 0
}

/** Normaliza la mezcla de transporte para que sume 100 %. */
export function normalizeMix(mix: SustainabilityInputs['transportMix']) {
  const raw = {
    car: safe(mix?.car),
    motorcycle: safe(mix?.motorcycle),
    bus: safe(mix?.bus),
    bikeWalk: safe(mix?.bikeWalk),
  }
  const total = raw.car + raw.motorcycle + raw.bus + raw.bikeWalk
  if (total === 0) return { car: 0, motorcycle: 0, bus: 0, bikeWalk: 100 }
  return {
    car: (raw.car / total) * 100,
    motorcycle: (raw.motorcycle / total) * 100,
    bus: (raw.bus / total) * 100,
    bikeWalk: (raw.bikeWalk / total) * 100,
  }
}

export function computeFootprint(i: SustainabilityInputs): FootprintResult {
  const attendees = safe(i.attendees)
  const distance = safe(i.avgDistanceKm)
  const mix = normalizeMix(i.transportMix)

  const factorMix =
    (mix.car / 100) * perPassengerKm('car') +
    (mix.motorcycle / 100) * perPassengerKm('motorcycle') +
    (mix.bus / 100) * perPassengerKm('bus') +
    (mix.bikeWalk / 100) * perPassengerKm('bikeWalk')

  const transportKg = attendees * distance * 2 * factorMix
  const energyKg = safe(i.equipmentKw) * safe(i.hours) * EMISSION_FACTORS.grid.kgCO2ePerKWh

  const m = i.materials ?? { printedSheets: 0, plasticBottles: 0, disposableTableware: 0, tshirts: 0 }
  const F = EMISSION_FACTORS.materials
  const materialsKg =
    safe(m.printedSheets) * F.printedSheets.kgCO2e +
    safe(m.plasticBottles) * F.plasticBottles.kgCO2e +
    safe(m.disposableTableware) * F.disposableTableware.kgCO2e +
    safe(m.tshirts) * F.tshirts.kgCO2e

  const totalKg = transportKg + energyKg + materialsKg
  const perAttendeeKg = attendees > 0 ? totalKg / attendees : totalKg
  const { lowMax, mediumMax } = EMISSION_FACTORS.levels
  const level: FootprintResult['level'] =
    perAttendeeKg <= lowMax ? 'bajo' : perAttendeeKg <= mediumMax ? 'medio' : 'alto'

  return {
    transportKg: round(transportKg, 2),
    energyKg: round(energyKg, 2),
    materialsKg: round(materialsKg, 2),
    totalKg: round(totalKg, 2),
    perAttendeeKg: round(perAttendeeKg, 2),
    level,
    recommendations: buildRecommendations(i, { transportKg, energyKg, materialsKg, mix, attendees, distance }),
  }
}

function buildRecommendations(
  i: SustainabilityInputs,
  c: {
    transportKg: number
    energyKg: number
    materialsKg: number
    mix: ReturnType<typeof normalizeMix>
    attendees: number
    distance: number
  },
): string[] {
  const recs: { text: string; savingKg: number }[] = []
  const m = i.materials ?? { printedSheets: 0, plasticBottles: 0, disposableTableware: 0, tshirts: 0 }
  const F = EMISSION_FACTORS.materials

  // Transporte: carro compartido (pasar de 1,5 a 3 personas por carro reduce a la mitad ese modo)
  const carKg = c.attendees * c.distance * 2 * (c.mix.car / 100) * perPassengerKm('car')
  if (carKg > 0.5) {
    recs.push({
      text: `Promueve el carro compartido: con 3 personas por carro se evitan ≈ ${fmt(carKg / 2)} kg CO₂e.`,
      savingKg: carKg / 2,
    })
  }
  const motoKg = c.attendees * c.distance * 2 * (c.mix.motorcycle / 100) * perPassengerKm('motorcycle')
  if (c.mix.bus < 40 && c.distance > 3 && carKg + motoKg > 1) {
    recs.push({
      text: 'Publica la ruta de Transmetro o bus más cercana y define un punto de encuentro para llegar juntos.',
      savingKg: (carKg + motoKg) * 0.3,
    })
  }
  if (c.distance <= 6 && c.mix.bikeWalk < 30) {
    recs.push({
      text: 'Invita a llegar en bicicleta o a pie y habilita un espacio seguro para parquear bicicletas.',
      savingKg: (carKg + motoKg) * 0.2,
    })
  }
  if (safe(m.plasticBottles) > 0) {
    const s = safe(m.plasticBottles) * F.plasticBottles.kgCO2e
    recs.push({
      text: `Pide a los asistentes llevar su termo y ofrece un punto de hidratación (evita ${fmt(s)} kg CO₂e en botellas).`,
      savingKg: s,
    })
  }
  if (safe(m.disposableTableware) > 0) {
    const s = safe(m.disposableTableware) * F.disposableTableware.kgCO2e
    recs.push({
      text: `Reemplaza los desechables por vajilla reutilizable o compostable (≈ ${fmt(s)} kg CO₂e menos).`,
      savingKg: s,
    })
  }
  if (safe(m.printedSheets) >= 20) {
    const s = safe(m.printedSheets) * F.printedSheets.kgCO2e
    recs.push({ text: 'Cambia volantes y listas impresas por un código QR.', savingKg: s })
  }
  if (safe(m.tshirts) > 0) {
    const s = safe(m.tshirts) * F.tshirts.kgCO2e
    recs.push({
      text: `Evita camisetas conmemorativas o usa prendas de segunda mano (≈ ${fmt(s)} kg CO₂e).`,
      savingKg: s,
    })
  }
  if (c.energyKg > 0.3) {
    recs.push({
      text: 'Aprovecha la luz del día, usa equipos eficientes y apágalos cuando no se usen.',
      savingKg: c.energyKg * 0.3,
    })
  }

  const sorted = recs.sort((a, b) => b.savingKg - a.savingKg).map((r) => r.text)
  sorted.push('Separa residuos en la fuente y designa un responsable de sostenibilidad del evento (ISO 20121).')
  return sorted.slice(0, 5)
}

function fmt(n: number) {
  return n.toLocaleString('es-CO', { maximumFractionDigits: n < 10 ? 1 : 0 })
}

/** Equivalencias para comunicar la huella de forma cercana. */
export function footprintEquivalences(totalKg: number) {
  const carKmFactor = EMISSION_FACTORS.fuels.gasolinaE10.kgCO2PerGal / EMISSION_FACTORS.vehicles.car.kmPerGal
  return {
    /** km recorridos en un carro particular a gasolina */
    carKm: Math.round(totalKg / carKmFactor),
    /** mangles rojos necesarios para capturar esa huella en un año */
    mangroves: Math.max(1, Math.ceil(totalKg / EMISSION_FACTORS.mangrove.kgCO2PerPlantPerYear)),
  }
}

/** Equivalencia en una frase (usada en la ficha). */
export function footprintEquivalence(totalKg: number): string {
  if (totalKg <= 0) return 'Sin emisiones estimadas.'
  const { carKm, mangroves } = footprintEquivalences(totalKg)
  return `Equivale a recorrer ${carKm.toLocaleString('es-CO')} km en un carro a gasolina, o a lo que capturan unos ${mangroves.toLocaleString('es-CO')} ${mangroves === 1 ? 'mangle rojo' : 'mangles rojos'} en un año.`
}

export const TRANSPORT_LABELS = {
  car: 'Carro particular o taxi',
  motorcycle: 'Moto',
  bus: 'Bus o Transmetro',
  bikeWalk: 'Bicicleta o a pie',
} as const

export const MATERIAL_LABELS = {
  printedSheets: 'Hojas impresas',
  plasticBottles: 'Botellas plásticas (500 ml)',
  disposableTableware: 'Kits desechables (plato, vaso, cubiertos)',
  tshirts: 'Camisetas de algodón',
} as const

export const LEVEL_LABELS: Record<FootprintResult['level'], string> = {
  bajo: 'Impacto bajo',
  medio: 'Impacto medio',
  alto: 'Impacto alto',
}

export const DEFAULT_SUSTAINABILITY: SustainabilityInputs = {
  attendees: 40,
  avgDistanceKm: 8,
  transportMix: { car: 35, motorcycle: 20, bus: 35, bikeWalk: 10 },
  equipmentKw: 0,
  hours: 0,
  materials: { printedSheets: 0, plasticBottles: 0, disposableTableware: 0, tshirts: 0 },
}

export const methodology = {
  summary:
    'La huella se estima sumando tres componentes: el transporte de los asistentes, la energía de los equipos y los materiales usados. Es una estimación sencilla para comparar eventos y tomar decisiones, no un inventario certificado.',
  formulas: [
    {
      label: 'Transporte',
      formula:
        'asistentes × distancia promedio de ida × 2 (ida y vuelta) × Σ (porcentaje de cada modo × su factor por pasajero-km)',
    },
    {
      label: 'Factor por pasajero-km',
      formula: 'factor del combustible (kg CO₂/gal) ÷ rendimiento del vehículo (km/gal) ÷ ocupación promedio',
    },
    {
      label: 'Energía',
      formula: 'potencia de los equipos (kW) × horas de uso × 0,220 kg CO₂e/kWh (red eléctrica nacional, 2024)',
    },
    { label: 'Materiales', formula: 'Σ (cantidad de cada material × su factor de emisión)' },
  ],
  disclaimer:
    'Es una estimación de referencia para comparar eventos y tomar decisiones, no un inventario certificado. Los factores de materiales son aproximados y están pendientes de validación.',
  example: 'Ejemplo: un equipo de sonido de 1 kW usado durante 3 horas consume 3 kWh, que equivalen a unos 0,66 kg de CO₂e.',
  sources: [
    'UPME (2016). Factores de Emisión de los Combustibles Colombianos — FECOC: gasolina E10 = 7,6181 kg CO₂/gal; diésel B10 = 10,2765 kg CO₂/gal.',
    'UPME (2026). Resolución 000085: factor de emisión del SIN 2024 = 0,220 kg CO₂e/kWh.',
    'ISO 20121:2024 — Sistemas de gestión de la sostenibilidad de eventos (recomendaciones).',
    'Universidad del Norte (2026): 335 mangles rojos ≈ 7,0 t CO₂ capturadas al año (equivalencia).',
  ],
  assumptions: [
    'Rendimientos: carro 40 km/gal, moto 100 km/gal, bus 8 km/gal.',
    'Ocupación promedio: carro 1,5 personas, moto 1,2, bus 30.',
    'Los factores de materiales son valores de referencia aproximados y deben validarse.',
  ],
} as const
