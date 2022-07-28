import path from 'path';
import app, { listen, dbConnection } from '../../index';
import supertest from 'supertest';

const request = supertest( app );

afterAll( async () => {
  await listen.close();
  await dbConnection.connection.close();
})

describe('Publications', () => {
  const testImagePath = path.join(__dirname, 'test.png');
  const testImagePath2 = path.join(__dirname, 'test.jpg');
  let idPublication = '';
  let tokenSession = '';

  test('New', async () => {
    const login = await request
      .post('/login')
      .send({
        dni: '46165177',
        password: '46165177'
      })
      .set('Accept', 'application/json')
      .expect( 200 );

    tokenSession = login.body.tokenSession;

    await request
      .post('/publications/new')
      .field('title', 'título de la nueva publicación de prueba')
      .field('description', 'descripción de la nueva publicación de prueba')
      .attach('image', testImagePath)
      .expect( 409 );

    const newPublication = await request
      .post('/publications/new')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('title', 'título de la nueva publicación de prueba')
      .field('description', 'descripción de la nueva publicación de prueba')
      .attach('image', testImagePath)
      .expect( 200 );

      idPublication = newPublication.body._id;
  }, 15000)

  test('List & Search', async () => {
    await request
      .get('/publications')
      .expect( 409 );

    const listPublications = await request
      .get('/publications')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );
    expect( listPublications.body.list ).toBeDefined();
    expect( listPublications.body.list.length ).toBeTruthy();

    await request
      .get('/publications')
      .query({ title: 'nueva' })
      .set('Accept', 'application/json')
      .expect( 409 );

    const searchAndFound = await request
      .get('/publications')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({ title: 'nueva' })
      .set('Accept', 'application/json')
      .expect( 200 );


    expect( searchAndFound.body.list ).toBeDefined();
    expect( searchAndFound.body.list.length ).toBeTruthy();

    const searchAndNotFound = await request
      .get('/publications')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({ title: 'asdasdasdasdasd' })
      .set('Accept', 'application/json')
      .expect( 200 );
    expect( searchAndNotFound.body.list ).toBeDefined();
    expect( searchAndNotFound.body.list.length ).toBeFalsy();
  }, 15000)

  test('Update', async () => {

    await request
      .patch(`/publications/${ idPublication }`)
      .field('title', 'test titulo publicacion cambiado')
      .field('description', 'test descripción publicación cambiado')
      .attach('image', testImagePath2)
      .expect( 409 );

    await request
      .patch(`/publications/${ idPublication }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('title', 'test titulo publicacion cambiado')
      .field('description', 'test descripción publicación cambiado')
      .attach('image', testImagePath2)
      .expect( 200 );

    await request
      .patch(`/publications/${ idPublication }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('title', 'test titulo nueva publicacion 2')
      .expect( 200 );

    await request
      .patch(`/publications/${ idPublication }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('description', 'test descripción publicación')
      .expect( 200 );

    await request
      .patch(`/publications/${ idPublication }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .attach('image', testImagePath)
      .expect( 200 );
  }, 15000)

  test('Delete', async () => {
    await request
      .delete(`/publications/${ idPublication }`)
      .expect( 409 );

    await request
      .delete(`/publications/${ idPublication }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );
  }, 15000)

})
