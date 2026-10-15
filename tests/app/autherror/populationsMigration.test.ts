import { estPopulationDeMigrationPassEmploi } from 'app/autherror/populationsMigration'

describe('estPopulationDeMigrationPassEmploi', () => {
  const envInitial = process.env

  beforeEach(() => {
    process.env = {
      ...envInitial,
      POPULATIONS_MIGRATION_PASS_EMPLOI: ' POP_PE_1 , POP_PE_2,',
    }
  })

  afterEach(() => {
    process.env = envInitial
  })

  it('reconnaît une population pass emploi, espaces et virgule finale ignorés', () => {
    expect(estPopulationDeMigrationPassEmploi('POP_PE_1')).toBe(true)
    expect(estPopulationDeMigrationPassEmploi('POP_PE_2')).toBe(true)
  })

  it('ne reconnaît ni une population inconnue ni une population absente', () => {
    expect(estPopulationDeMigrationPassEmploi('POP_INCONNUE')).toBe(false)
    expect(estPopulationDeMigrationPassEmploi(undefined)).toBe(false)
    expect(estPopulationDeMigrationPassEmploi('')).toBe(false)
  })

  it('ne reconnaît rien quand la variable n’est pas définie', () => {
    delete process.env.POPULATIONS_MIGRATION_PASS_EMPLOI

    expect(estPopulationDeMigrationPassEmploi('POP_PE_1')).toBe(false)
  })
})
