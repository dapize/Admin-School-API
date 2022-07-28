import path from 'path';
import app, { listen, dbConnection } from '../../index';
import supertest from 'supertest';
import dniRandom from '../../utils/randomDni';

const request = supertest( app );

afterAll( async () => {
  await listen.close();
  await dbConnection.connection.close();
})

describe('Tuitions', () => {
  let tokenSession = '';
  const tuitions: string[] = [];
  let dniStudentRandom1: number;
  const testDocumentPdfPath = path.join(__dirname, 'test.pdf');
  const testDocument2PdfPath = path.join(__dirname, 'test.docx');

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
      .post('/tuitions/new')
      .expect( 409 );

    // new tuition 1
    dniStudentRandom1 = dniRandom();
    const dniRepresentativeRandom1 = dniRandom();

    const newTuition1 = await request
      .post('/tuitions/new')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniStudentRandom1 }`)
      .field('studentLastName', 'Chale')
      .field('studentSecondLastName', 'Zevallos')
      .field('studentName', 'André')
      .field('studentCellphone', '989898989')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentEmail', 'andre@gmail.com')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocumentPdfPath)
      .field('studentTransferDocumentType', 1)
      .field('representativeDni', `${ dniRepresentativeRandom1 }`)
      .field('representativeLastName', 'Chale')
      .field('representativeSecondLastName', 'Paucar')
      .field('representativeName', 'Pedro')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '898989898')
      .field('representativeEmail', 'pedro@gmail.com')
      .field('representativeType', 1)
      .field('tuitionCost', 3500)
      .field('monthlyCost', 2200)
      .field('observation', 'Tiende dormise')
      .expect( 200 );

    tuitions.push(newTuition1.body._id);

    // login with the new user created
    await request
      .post('/login')
      .send({
        dni: `${ dniStudentRandom1 }`,
        password: `${ dniStudentRandom1 }`
      })
      .set('Accept', 'application/json')
      .expect( 200 );

    // new tuition 2
    const dniStudentRandom2 = dniRandom();
    const dniRepresentativeRandom2 = dniRandom();
    const testDocumentImagePath = path.join(__dirname, 'test.png');

    const newTuition2 = await request
      .post('/tuitions/new')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniStudentRandom2 }`)
      .field('studentLastName', 'Chale 2')
      .field('studentSecondLastName', 'Zevallos 2')
      .field('studentName', 'André 2')
      .field('studentCellphone', '989898989')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentEmail', 'andre2@gmail.com')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocumentImagePath )
      .field('studentTransferDocumentType', 1)
      .field('representativeDni', `${ dniRepresentativeRandom2 }`)
      .field('representativeLastName', 'Chale 2')
      .field('representativeSecondLastName', 'Paucar 2')
      .field('representativeName', 'Pedro 2')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '898989898')
      .field('representativeEmail', 'pedro@gmail.com')
      .field('representativeType', 1)
      .field('tuitionCost', 5500)
      .field('monthlyCost', 3200)
      .field('observation', 'Tiende dormise')
      .expect( 200 );

    tuitions.push(newTuition2.body._id);

    // login new user 2 created
    await request
      .post('/login')
      .send({
        dni: `${ dniStudentRandom2 }`,
        password: `${ dniStudentRandom2 }`
      })
      .set('Accept', 'application/json')
      .expect( 200 );

    // new tuition 3
    const dniStudentRandom3 = dniRandom();
    const dniRepresentativeRandom3 = dniRandom();
    const testDocumentDocPath = path.join(__dirname, 'test.doc');

    const newTuition3 = await request
      .post('/tuitions/new')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniStudentRandom3 }`)
      .field('studentLastName', 'Chale 3')
      .field('studentSecondLastName', 'Zevallos 3')
      .field('studentName', 'André 2')
      .field('studentCellphone', '989898989')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentEmail', 'andre2@gmail.com')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocumentDocPath)
      .field('studentTransferDocumentType', 1)
      .field('representativeDni', `${ dniRepresentativeRandom3 }`)
      .field('representativeLastName', 'Chale 2')
      .field('representativeSecondLastName', 'Paucar 2')
      .field('representativeName', 'Pedro 2')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '898989898')
      .field('representativeEmail', 'pedro@gmail.com')
      .field('representativeType', 1)
      .field('tuitionCost', 5500)
      .field('monthlyCost', 3200)
      .field('observation', 'Tiende dormise')
      .expect( 200 );

    tuitions.push(newTuition3.body._id);

    // login with the new user 3 created
    await request
      .post('/login')
      .send({
        dni: `${ dniStudentRandom3 }`,
        password: `${ dniStudentRandom3 }`
      })
      .set('Accept', 'application/json')
      .expect( 200 );


    // new tuition 4
    const dniStudentRandom4 = dniRandom();
    const dniRepresentativeRandom4 = dniRandom();
    const testDocumentDocxPath = path.join(__dirname, 'test.docx');

    const newTuition4 = await request
      .post('/tuitions/new')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniStudentRandom4 }`)
      .field('studentLastName', 'Tangamandapio 4')
      .field('studentSecondLastName', 'Zevallos 4')
      .field('studentName', 'André 4')
      .field('studentCellphone', '989898989')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentEmail', 'andre4@gmail.com')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocumentDocxPath)
      .field('studentTransferDocumentType', 1)
      .field('representativeDni', `${ dniRepresentativeRandom4 }`)
      .field('representativeLastName', 'Chale 4')
      .field('representativeSecondLastName', 'Paucar 4')
      .field('representativeName', 'Pedro 4')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '898989898')
      .field('representativeEmail', 'pedro@gmail.com')
      .field('representativeType', 1)
      .field('tuitionCost', 5500)
      .field('monthlyCost', 3200)
      .field('observation', 'Tiende dormise')
      .expect( 200 );

    tuitions.push(newTuition4.body._id);

    // login with the new user 4 created
    await request
      .post('/login')
      .send({
        dni: `${ dniStudentRandom4 }`,
        password: `${ dniStudentRandom4 }`
      })
      .set('Accept', 'application/json')
      .expect( 200 );
  }, 15000)

  test('List', async () => {
    // witouth autorization
     await request
      .get('/tuitions')
      .expect( 409 )

    // with autorization
    const simpleList = await request
      .get('/tuitions')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );

    expect( simpleList.body.list.length ).toBeTruthy();

    // with filter StudentDni
    const withFilter1 = await request
      .get('/tuitions')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({
        studentDni: dniStudentRandom1
      })
      .expect( 200 );

    expect( withFilter1.body.list.length ).toEqual( 1 );

    // with filter studentLastName - just one
    const withFilter2 = await request
      .get('/tuitions')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({
        studentLastName: 'Tanga'
      })
      .expect( 200 );

    expect( withFilter2.body.list.length ).toEqual( 1 );

    // with filter studentLastName - 3 result
    const withFilter3 = await request
      .get('/tuitions')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({
        studentLastName: 'Chale'
      })
      .expect( 200 );

    expect( withFilter3.body.list.length ).toEqual( 3 );

    // without results
    const withFilter4 = await request
      .get('/tuitions')
      .set('Authorization',`Bearer ${ tokenSession }`)
      .query({
        studentLastName: 'dasdasdasdasdasdasdasd'
      })
      .expect( 200 );

    expect( withFilter4.body.list.length ).toBeFalsy();

  }, 15000)

  test('Update', async () => {
    await request
      .patch(`/tuitions/${ tuitions[ 0 ] }`)
      .attach('studentTransferDocument', testDocumentPdfPath)
      .expect( 409 )

    await request
      .patch(`/tuitions/${ tuitions[ 1 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniRandom() }`)
      .field('studentLastName', 'Chale')
      .field('studentSecondLastName', 'Zevallos')
      .field('studentName', 'André')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentEmail', 'andre@gmail.com')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocumentPdfPath)
      .field('studentTransferDocumentType', 1)
      .field('representativeDni', `${ dniRandom() }`)
      .field('representativeLastName', 'Chale')
      .field('representativeSecondLastName', 'Paucar')
      .field('representativeName', 'Pedro')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '898989898')
      .field('representativeEmail', 'pedro@gmail.com')
      .field('representativeType', 1)
      .field('tuitionCost', 3500)
      .field('monthlyCost', 2200)
      .expect( 200 );

    await request
      .patch(`/tuitions/${ tuitions[ 2 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentDni', `${ dniRandom() }`)
      .field('studentLastName', 'Chale')
      .field('studentSecondLastName', 'Zevallos')
      .field('studentName', 'André')
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentGrade', 11)
      .field('studentDisease', 'Asma')
      .field('studentDifficulty', 'Deficis de atención')
      .attach('studentTransferDocument', testDocument2PdfPath)
      .field('studentTransferDocumentType', 2)
      .field('representativeDni', `${ dniRandom() }`)
      .field('representativeLastName', 'Chale')
      .field('representativeSecondLastName', 'Paucar')
      .field('representativeName', 'Pedro')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeCellphone', '998989898')
      .field('representativeType', 2)
      .field('tuitionCost', 4500)
      .field('monthlyCost', 3200)
      .field('observation', 'Tiende dormise')
      .expect( 200 )

    await request
      .patch(`/tuitions/${ tuitions[ 3 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .field('studentName', 'Mía')
      .field('studentLastName', 'Califa')
      .field('studentSecondLastName', 'Chopano')
      .field('studentDni', `${ dniRandom() }`)
      .field('studentInstitutionOrigin', 'La casa de los conejitos')
      .field('studentGrade', 9)
      .field('studentTransferDocumentType', 2)
      .field('representativeDni', `${ dniRandom() }`)
      .field('representativeLastName', 'Chale')
      .field('representativeSecondLastName', 'Paucar')
      .field('representativeName', 'Pedro')
      .field('representativeAddress', 'Magdalena del Mar')
      .field('representativeType', 2)
      .field('tuitionCost', 4500)
      .field('monthlyCost', 3200)
      .expect( 200 )

  }, 15000)

  test('Delete', async () => {
    await request
      .delete(`/tuitions/${ tuitions[ 0 ] }`)
      .expect( 409 );

    await request
      .delete(`/tuitions/${ tuitions[ 0 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );

    await request
      .delete(`/tuitions/${ tuitions[ 1 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );

    await request
      .delete(`/tuitions/${ tuitions[ 2 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );

    await request
      .delete(`/tuitions/${ tuitions[ 3 ] }`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 200 );

    await request
      .delete(`/tuitions/61580ca12313c32c7dc12345`)
      .set('Authorization',`Bearer ${ tokenSession }`)
      .expect( 409 );
  }, 15000)
})
