import { Request, Response } from 'express';
const notFoundMiddleware = (_req: Request, res: Response) => {
  res.status(404).render('404', {
    status: 404,
    message: 'Page not found',
  });
};

export default notFoundMiddleware;
