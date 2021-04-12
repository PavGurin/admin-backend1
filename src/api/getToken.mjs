import * as mysql from '../utils/mysql';

export default async (ctx) => {

    const {token} = await mysql.main.queryRow(
        'SELECT token FROM ma_users_session WHERE is_deleted = 0 LIMIT 1'
    );

    ctx.body = {
        token,
    }
};
