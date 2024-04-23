import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'

const levelsRoute = new HonoVar().basePath('/levels').use(isAuth('Admin'))

export default levelsRoute
