export function estPopulationDeMigrationPassEmploi(
  population?: string
): boolean {
  if (!population) return false
  return (process.env.POPULATIONS_MIGRATION_PASS_EMPLOI ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(population)
}
