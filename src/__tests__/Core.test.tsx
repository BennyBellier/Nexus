import '@testing-library/jest-dom';
import Database from 'main/competition';

describe('Competition.database', () => {
  it('test generation', () => {
    const cdb = new Database('test.db');
    expect(cdb).toBeTruthy();
  });
});
