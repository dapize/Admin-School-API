import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// absolutes
const mainFolder = path.join( 'static', 'uploads' );
const images = path.join( mainFolder, 'images' );
const documents = path.join( mainFolder, 'documents' );
const templates = path.join( process.env.NODE_ENV === 'production' ? path.resolve('./') : 'src', 'templates' );
const downloads = path.join( path.resolve('./'), 'static', 'downloads' );
const materials = path.join( mainFolder, 'materials' );

// relatives
const paths = {
  images: {
    publications: path.join( images, 'publications' ),
    schedules: path.join( images, 'schedules' )
  },
  documents: {
    tuitions: path.join( documents, 'tuitions' ),
    questions: path.join( documents, 'questions' ),
    answers: path.join( documents, 'answers' ),
  },
  templates: {
    base: templates,
    tuition: path.join( templates, 'tuition.html' ),
    records: path.join( templates, 'records.html' )
  },
  downloads,
  materials,

}

export default paths;
