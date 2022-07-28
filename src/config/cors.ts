const cors = () => {
  return {
    origin: process.env.CORS_ORIGIN?.split(',')
  }
}

export default cors;
