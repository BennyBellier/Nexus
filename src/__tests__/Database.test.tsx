import Database from '../main/database';

jest.mock('electron-log', () => ({
  error: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn(),
}));

describe('Database', () => {
  let database: Database;
  const testDbName = 'test_database.db';

  beforeEach(() => {
    database = new Database(testDbName, {} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    database.close();
  });

  it('should insert team successfully', async () => {
    await database.addTeam('test_team', 0, 0, 0);
    const result = await database.query(
      'SELECT * FROM teams WHERE name = "test_team"'
    );
    expect(result[0]).toEqual({
      name: 'test_team',
      points: 0,
      wins: 0,
      losses: 0,
    });
  });

  it('should insert played game successfully', async () => {
    await database.addTeam('test_team_1', 0, 0, 0);
    await database.addTeam('test_team_2', 0, 0, 0);
    await database.addPLayedMatch('test_team_1', 'test_team_2', 1, 0);
    const result = await database.query(
      'SELECT * FROM played_games WHERE home_team = "test_team_1"'
    );
    expect(result[0]).toEqual({
      id: 1,
      home_team: 'test_team_1',
      away_team: 'test_team_2',
      home_score: 1,
      away_score: 0,
    });
  });

  it('should reset database successfully', async () => {
    await database.reset();
    const result = await database.query('SELECT COUNT(*) as count FROM teams');
    expect(result[0].count).toBe(0);
  });
});
