import util from 'util';
import cp from 'child_process';

cp.exec = util.promisify(cp.exec);

export default cp;

