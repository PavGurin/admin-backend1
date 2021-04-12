import cp from './child_process';

export default (address, output) => cp.exec(`wget "${address}" -O ${output} -o /dev/null`);
