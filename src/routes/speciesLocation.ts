import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'

const speciesLocationRoute = new HonoVar().basePath('speciesLocation').use(isAuth('Admin'))

export default speciesLocationRoute
