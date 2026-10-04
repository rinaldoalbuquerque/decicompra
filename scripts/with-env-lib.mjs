// Monta a linha de comando para o shell, pondo aspas nos argumentos com espaço ou aspas
export function toShellCommand(args) {
  return args
    .map((arg) => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `"${arg.replace(/(["\\])/g, '\\$1')}"`))
    .join(' ')
}
