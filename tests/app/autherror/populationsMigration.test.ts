import { whitescreenDeMigration } from 'app/autherror/populationsMigration'

describe('whitescreenDeMigration', () => {
  const envInitial = process.env

  beforeEach(() => {
    process.env = {
      ...envInitial,
      POPULATIONS_MIGRATION_PASS_EMPLOI: ' POP_PE_1 , POP_PE_2,',
      POPULATIONS_MIGRATION_1J1S: 'POP_1J1S',
    }
  })

  afterEach(() => {
    process.env = envInitial
  })

  it('reconnaît une population pass emploi, espaces et virgule finale ignorés', () => {
    expect(whitescreenDeMigration('POP_PE_1')).toEqual('PASS_EMPLOI')
    expect(whitescreenDeMigration('POP_PE_2')).toEqual('PASS_EMPLOI')
  })

  it('reconnaît une population 1J1S', () => {
    expect(whitescreenDeMigration('POP_1J1S')).toEqual('1J1S')
  })

  it('ne reconnaît ni une population inconnue ni une population absente', () => {
    expect(whitescreenDeMigration('POP_INCONNUE')).toBeUndefined()
    expect(whitescreenDeMigration(undefined)).toBeUndefined()
    expect(whitescreenDeMigration('')).toBeUndefined()
  })

  it('privilégie pass emploi quand la population est dans les deux listes', () => {
    process.env.POPULATIONS_MIGRATION_1J1S = 'POP_PE_1'

    expect(whitescreenDeMigration('POP_PE_1')).toEqual('PASS_EMPLOI')
  })

  it('ne reconnaît rien quand les variables ne sont pas définies', () => {
    delete process.env.POPULATIONS_MIGRATION_PASS_EMPLOI
    delete process.env.POPULATIONS_MIGRATION_1J1S

    expect(whitescreenDeMigration('POP_PE_1')).toBeUndefined()
  })
})
