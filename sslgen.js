const { spawn, exec } = require('child_process');

const generateNewCert = async (days=10) => {

  await exec('rm -f local*.key local*.crt');
  const child = spawn(`openssl`, ['req', '-x509', '-nodes', '-days', days, '-newkey', 'rsa:2048', '-keyout', './localhost.key', '-out', 'localhost.crt']);
  child.stdin.write("\n\n\n\n\n\n\n");

  return {
    then: callback => {
      child.on('close', code => {
        console.log(`[SSL] Cert generation process exited with code ${code}.`);
        console.log(`[SSL] Generated new cert valid for ${days} days.`)

        callback();
      })
    }
  };
}

module.exports = {
  generateNewCert,
}
