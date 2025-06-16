const RESET = "\x1b[0m";
const FG_YELLOW = "\x1b[33m";
const FG_GRAY = "\x1b[90m";

export const Logger = {
  customLogger: console.log,
  prefix: '',
  setPrefix(prefix: string) {
    this.prefix = prefix
  },
  log(message: string) {
    this.customLogger(`${FG_YELLOW}[${this.prefix}]${RESET} ${FG_GRAY}${message}${RESET}`)
  },
  logHeader(message: string) {
    this.customLogger(`########## ${message} ##########`)
  }
}