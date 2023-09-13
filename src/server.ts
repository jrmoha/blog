import http from 'http';
import app from './app';
import io from './socket';
import config from './utils/config';

const httpServer = http.createServer(app);
io(httpServer);
const port: number = config.PORT;

httpServer.listen(port);
