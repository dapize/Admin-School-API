import app, { listen, dbConnection } from '../../index';
import supertest from 'supertest';

const request = supertest( app );

afterAll( async () => {
  await listen.close();
  await dbConnection.connection.close();
})


describe('Logged in test', () => {

  test('login correct', async () => {
    const response = await request
      .post('/login')
      .send({
        dni: '77156164',
        password: '77156164'
      })
      .set('Accept', 'application/json')
      .expect( 200 )
      .expect( res => {
        res.body.name = 'Daniel';
        res.body.role = 'administrator';
      });

    expect( response.body.tokenSession ).toBeDefined();
  })

  test('Login incorrect', async () => {
    await request
      .post('/login')
      .send({
        dni: '77156164',
        password: '12345678'
      })
      .set('Accept', 'application/json')
      .expect( 409 )
  })

  test('User not found', async () => {
    await request
      .post('/login')
      .send({
        dni: '99999999',
        password: '99999999'
      })
      .set('Accept', 'application/json')
      .expect( 409 )
  })
})
