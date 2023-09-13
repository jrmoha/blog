import supertest from 'supertest';
import app from '../app';

//create a request object
const request = supertest(app);
describe('Test Basic endpoint server', () => {
  it('Get the /login endpoint', async () => {
    const respons = await request.get('/login');
    expect(respons.status).toBe(200);
  });
});
