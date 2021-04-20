import * as mysql from '../utils/mysql.mjs';

export default async (ctx) => {
  // заглушка токена
  const { token } = { token: '6525fe47-9526-5f4e-94de-858fc2c6d0e4' };
  //     await mysql.main.queryRow(
  //   'SELECT token FROM ma_users_session WHERE is_deleted = 0 LIMIT 1',
  // );

  ctx.body = {
    token,
  };
};
