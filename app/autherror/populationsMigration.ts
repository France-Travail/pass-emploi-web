export type WhitescreenDeMigration = 'PASS_EMPLOI' | '1J1S'

export function whitescreenDeMigration(
  population?: string
): WhitescreenDeMigration | undefined {
  if (!population) return
  if (
    idsDePopulations(process.env.POPULATIONS_MIGRATION_PASS_EMPLOI).includes(
      population
    )
  )
    return 'PASS_EMPLOI'
  if (
    idsDePopulations(process.env.POPULATIONS_MIGRATION_1J1S).includes(
      population
    )
  )
    return '1J1S'
}

function idsDePopulations(variable?: string): string[] {
  return (variable ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}
